import { describe, expect, test } from "vitest"

import {
  SEND_MAGIC_LINK_INTENT,
  VERIFY_CODE_INTENT,
} from "../domain/auth-constants"
import { authActionSchema } from "./auth-schemas"

describe("authActionSchema", () => {
  test("given: valid sendMagicLink data, should: parse successfully", () => {
    const result = authActionSchema.safeParse({
      email: "test@example.com",
      intent: SEND_MAGIC_LINK_INTENT,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      email: "test@example.com",
      intent: SEND_MAGIC_LINK_INTENT,
    })
  })

  test("given: sendMagicLink with empty email, should: fail", () => {
    const result = authActionSchema.safeParse({
      email: "",
      intent: SEND_MAGIC_LINK_INTENT,
    })

    expect(result.success).toBe(false)
  })

  test("given: valid verifyCode data, should: parse successfully", () => {
    const result = authActionSchema.safeParse({
      code: "ABC123",
      intent: VERIFY_CODE_INTENT,
      target: "test@example.com",
      type: "login",
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      code: "ABC123",
      intent: VERIFY_CODE_INTENT,
      target: "test@example.com",
      type: "login",
    })
  })

  test("given: verifyCode with empty code, should: fail", () => {
    const result = authActionSchema.safeParse({
      code: "",
      intent: VERIFY_CODE_INTENT,
      target: "test@example.com",
      type: "login",
    })

    expect(result.success).toBe(false)
  })

  test("given: unknown intent, should: fail", () => {
    const result = authActionSchema.safeParse({
      email: "test@example.com",
      intent: "unknown",
    })

    expect(result.success).toBe(false)
  })
})
