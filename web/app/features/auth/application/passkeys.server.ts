import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  Uint8Array_,
} from "@simplewebauthn/server"
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import { isoBase64URL } from "@simplewebauthn/server/helpers"

import {
  retrievePasskeyFromDatabaseByCredentialId,
  retrievePasskeysFromDatabaseByUserId,
  savePasskeyToDatabase,
  updatePasskeyCounterInDatabaseByCredentialId,
} from "../infrastructure/passkeys-model.server"
import { retrieveUserFromDatabaseByEmail } from "~/features/users/infrastructure/users-model.server"

const rpName = "Personal App"

const getRpId = (request: Request) => new URL(request.url).hostname
const getOrigin = (request: Request) => new URL(request.url).origin
const encodePublicKey = (credentialPublicKey: Uint8Array_) =>
  isoBase64URL.fromBuffer(credentialPublicKey)
const decodePublicKey = (credentialPublicKey: string) =>
  isoBase64URL.toBuffer(credentialPublicKey)
const parseTransports = (
  transports: string,
): AuthenticatorTransportFuture[] | undefined =>
  transports.length === 0
    ? undefined
    : (transports.split(",") as AuthenticatorTransportFuture[])

export async function generatePasskeyRegistrationOptions({
  request,
  userEmail,
  userId,
}: {
  request: Request
  userEmail: string
  userId: string
}) {
  const passkeys = await retrievePasskeysFromDatabaseByUserId(userId)

  return generateRegistrationOptions({
    authenticatorSelection: {
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "preferred",
    },
    excludeCredentials: passkeys.map(({ credentialId, transports }) => ({
      id: credentialId,
      transports: parseTransports(transports),
    })),
    rpID: getRpId(request),
    rpName,
    userDisplayName: userEmail,
    userID: isoBase64URL.toBuffer(isoBase64URL.fromUTF8String(userId)),
    userName: userEmail,
  })
}

export async function verifyPasskeyRegistration({
  expectedChallenge,
  request,
  response,
  userId,
}: {
  expectedChallenge: string
  request: Request
  response: RegistrationResponseJSON
  userId: string
}) {
  const result = await verifyRegistrationResponse({
    expectedChallenge,
    expectedOrigin: getOrigin(request),
    expectedRPID: getRpId(request),
    response,
  })

  if (!result.verified) return false

  const { credential, credentialBackedUp, credentialDeviceType } =
    result.registrationInfo

  await savePasskeyToDatabase({
    counter: credential.counter,
    credentialBackedUp,
    credentialDeviceType,
    credentialId: credential.id,
    credentialPublicKey: encodePublicKey(credential.publicKey),
    transports: response.response.transports?.join(",") ?? "",
    user: { connect: { id: userId } },
  })

  return true
}

export async function generatePasskeyAuthenticationOptions(request: Request) {
  return generateAuthenticationOptions({
    rpID: getRpId(request),
    userVerification: "preferred",
  })
}

export async function verifyPasskeyAuthentication({
  expectedChallenge,
  request,
  response,
}: {
  expectedChallenge: string
  request: Request
  response: AuthenticationResponseJSON
}) {
  const passkey = await retrievePasskeyFromDatabaseByCredentialId(response.id)
  if (!passkey) return null

  const result = await verifyAuthenticationResponse({
    credential: {
      counter: passkey.counter,
      id: passkey.credentialId,
      publicKey: decodePublicKey(passkey.credentialPublicKey),
      transports: parseTransports(passkey.transports),
    },
    expectedChallenge,
    expectedOrigin: getOrigin(request),
    expectedRPID: getRpId(request),
    response,
  })

  if (!result.verified) return null

  await updatePasskeyCounterInDatabaseByCredentialId({
    counter: result.authenticationInfo.newCounter,
    credentialId: passkey.credentialId,
  })

  return passkey.user
}

export async function retrieveUserForPasskeyRegistration(email: string) {
  return retrieveUserFromDatabaseByEmail(email)
}
