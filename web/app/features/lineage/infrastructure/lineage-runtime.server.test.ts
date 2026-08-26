import { describe, expect, test } from "vitest"

import { lineageRuntime } from "./lineage-runtime.server"

const contract = {
  challenge: ["What is the capital of France?"],
  id: "capital-of-france",
  resolution: ["What is the capital of France?", "Paris"],
  response: "text" as const,
  revision: 1,
  withheld: ["Paris"],
}

describe("generated Lineage runtime", () => {
  test("given: a disclosure-safe contract, should: validate it through the packaged Agda core", () => {
    expect(lineageRuntime.isValid(contract)).toBe(true)
  })

  test("given: a contract leaking its answer, should: reject it through the packaged Agda core", () => {
    expect(
      lineageRuntime.isValid({
        ...contract,
        challenge: contract.resolution,
      }),
    ).toBe(false)
  })
})
