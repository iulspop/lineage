import { describe, expect, test } from "vitest"

import { createPopulatedSession } from "./sessions-factories.server"

describe("createPopulatedSession()", () => {
  test("given: no overrides, should: return a session with all fields populated", () => {
    const session = createPopulatedSession()

    expect(session.id).toBeDefined()
    expect(session.userId).toBeDefined()
    expect(session.expirationDate).toBeInstanceOf(Date)
    expect(session.createdAt).toBeInstanceOf(Date)
    expect(session.updatedAt).toBeInstanceOf(Date)
  })

  test("given: overrides, should: use overridden values", () => {
    const session = createPopulatedSession({
      userId: "custom-user-id",
    })

    expect(session.userId).toBe("custom-user-id")
  })

  test("given: two calls, should: return distinct ids", () => {
    const a = createPopulatedSession()
    const b = createPopulatedSession()

    expect(a.id).not.toBe(b.id)
  })
})
