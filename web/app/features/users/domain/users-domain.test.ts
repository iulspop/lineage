import { describe, expect, test } from "vitest"

import {
  isUserValidationError,
  userValidationErrorToI18nKey,
  validateEmail,
} from "./users-domain"

describe("validateEmail()", () => {
  test("given: a valid email, should: return trimmed lowercase email", () => {
    const result = validateEmail("  Alice@Example.COM  ")

    expect(result).toEqual({ data: "alice@example.com", success: true })
  })

  test("given: an empty string, should: return EMAIL_EMPTY error", () => {
    const result = validateEmail("   ")

    expect(result).toEqual({ error: "EMAIL_EMPTY", success: false })
  })

  test("given: an invalid email, should: return EMAIL_INVALID error", () => {
    const result = validateEmail("not-an-email")

    expect(result).toEqual({ error: "EMAIL_INVALID", success: false })
  })

  test("given: an email with spaces, should: trim and lowercase", () => {
    const result = validateEmail("  Test@Test.com ")

    expect(result).toEqual({ data: "test@test.com", success: true })
  })
})

describe("userValidationErrorToI18nKey()", () => {
  test("given: EMAIL_EMPTY, should: return validation.emailRequired", () => {
    expect(userValidationErrorToI18nKey("EMAIL_EMPTY")).toBe(
      "validation.emailRequired",
    )
  })

  test("given: EMAIL_INVALID, should: return validation.emailInvalid", () => {
    expect(userValidationErrorToI18nKey("EMAIL_INVALID")).toBe(
      "validation.emailInvalid",
    )
  })
})

describe("isUserValidationError()", () => {
  test("given: a valid error code, should: return true", () => {
    expect(isUserValidationError("EMAIL_EMPTY")).toBe(true)
  })

  test("given: an invalid string, should: return false", () => {
    expect(isUserValidationError("NOT_AN_ERROR")).toBe(false)
  })
})
