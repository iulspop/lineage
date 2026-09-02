import { createHash, timingSafeEqual } from "node:crypto"

export function hashCredential(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

export function createS256Challenge(verifier: string) {
  return createHash("sha256").update(verifier, "ascii").digest("base64url")
}

export function verifyS256Challenge(verifier: string, expected: string) {
  const actual = Buffer.from(createS256Challenge(verifier))
  const wanted = Buffer.from(expected)
  return actual.length === wanted.length && timingSafeEqual(actual, wanted)
}
