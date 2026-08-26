import { describe, expect, test } from "vitest"

import { createPopulatedVerification } from "./verifications-factories.server"

describe("createPopulatedVerification()", () => {
  test("given: no overrides, should: return a verification with all fields populated", () => {
    const verification = createPopulatedVerification()

    expect(verification.id).toBeDefined()
    expect(verification.type).toBe("login")
    expect(verification.target).toBeDefined()
    expect(verification.secret).toBeDefined()
    expect(verification.algorithm).toBe("SHA-1")
    expect(verification.digits).toBe(6)
    expect(verification.period).toBe(600)
    expect(verification.charSet).toBeDefined()
    expect(verification.expiresAt).toBeInstanceOf(Date)
    expect(verification.createdAt).toBeInstanceOf(Date)
  })

  test("given: overrides, should: use overridden values", () => {
    const verification = createPopulatedVerification({
      target: "custom@test.com",
      type: "reset",
    })

    expect(verification.target).toBe("custom@test.com")
    expect(verification.type).toBe("reset")
  })

  test("given: two calls, should: return distinct ids", () => {
    const a = createPopulatedVerification()
    const b = createPopulatedVerification()

    expect(a.id).not.toBe(b.id)
  })
})
