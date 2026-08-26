import { generateTOTP, verifyTOTP } from "@epic-web/totp"

import {
  TOTP_ALGORITHM,
  TOTP_CHAR_SET,
  TOTP_DIGITS,
  TOTP_PERIOD,
} from "../domain/auth-constants"

/**
 * Generates a TOTP with the project's standard configuration.
 *
 * @returns The generated TOTP containing otp, secret, algorithm, digits, period, and charSet.
 */
export const generateVerificationTOTP = () =>
  generateTOTP({
    algorithm: TOTP_ALGORITHM,
    charSet: TOTP_CHAR_SET,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
  })

/**
 * Verifies a TOTP code against a stored secret.
 *
 * @param params - The OTP and verification config to check against.
 * @returns The verification result or null if invalid.
 */
export const verifyVerificationTOTP = ({
  algorithm,
  charSet,
  digits,
  otp,
  period,
  secret,
}: {
  algorithm: string
  charSet: string
  digits: number
  otp: string
  period: number
  secret: string
}) =>
  verifyTOTP({
    algorithm,
    charSet,
    digits,
    otp,
    period,
    secret,
  })
