import assert from "node:assert/strict"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import { pathToFileURL } from "node:url"

import { importCorpus } from "../app/features/lineage/application/import-corpus.server"
import type { CorpusSnapshotStore } from "../app/features/lineage/domain/corpus-ports"
import { createCompiledCoreValidator } from "../app/features/lineage/infrastructure/compiled-core"

type Eliminator<T> = (visitor: {
  just: (value: T) => T
  nothing: () => null
}) => T | null

type RawReviewContract = unknown
type ReviewContract = unknown
type ChallengeSession = unknown
type ResolutionSession = unknown
type CompletedSession = unknown

type LineageApi = {
  rawReviewContract: (
    challenge: string[],
  ) => (
    resolution: string[],
  ) => (response: string) => (withheld: string[]) => RawReviewContract
  isValidReviewContract: (raw: RawReviewContract) => boolean
  validateReviewContract: (raw: RawReviewContract) => Eliminator<ReviewContract>
  beginReview: (contract: ReviewContract) => ChallengeSession
  submitResponse: (
    response: string,
  ) => (session: ChallengeSession) => ResolutionSession
  recordAssessment: (
    assessment: string,
  ) => (session: ResolutionSession) => CompletedSession
  presentChallenge: (session: ChallengeSession) => string[]
  presentResolution: (session: ResolutionSession) => string[]
  presentCompleted: (session: CompletedSession) => string[]
  capturedResolutionAttempt: (session: ResolutionSession) => Eliminator<string>
}

test("compiled Lineage API validates contracts and runs a review", () => {
  const outputDirectory = process.argv[2]
  assert.ok(outputDirectory, "Expected the Agda JavaScript output directory")

  const require = createRequire(import.meta.url)
  const api = require(
    path.join(outputDirectory, "jAgda.Lineage.API.JavaScript.js"),
  ) as LineageApi

  const challengeContent = ["What is the capital of France?"]
  const resolutionContent = [...challengeContent, "Paris"]
  const raw = api.rawReviewContract(challengeContent)(resolutionContent)(
    "text",
  )(["Paris"])

  assert.equal(api.isValidReviewContract(raw), true)

  const contract = api.validateReviewContract(raw)({
    just: (value) => value,
    nothing: () => null,
  })
  assert.ok(contract)

  const challenge = api.beginReview(contract)
  assert.deepEqual(api.presentChallenge(challenge), challengeContent)

  const resolution = api.submitResponse("Paris")(challenge)
  assert.deepEqual(api.presentResolution(resolution), resolutionContent)
  assert.equal(
    api.capturedResolutionAttempt(resolution)({
      just: (value) => value,
      nothing: () => null,
    }),
    "Paris",
  )

  const completed = api.recordAssessment("good")(resolution)
  assert.deepEqual(api.presentCompleted(completed), resolutionContent)

  const unsafe = api.rawReviewContract(resolutionContent)(resolutionContent)(
    "text",
  )(["Paris"])
  assert.equal(api.isValidReviewContract(unsafe), false)
  assert.equal(
    api.validateReviewContract(unsafe)({
      just: (value) => value,
      nothing: () => null,
    }),
    null,
  )

  console.log(
    `Lineage JavaScript API smoke check passed (${pathToFileURL(outputDirectory).href})`,
  )
})

test("compiled Lineage validation guards the corpus persistence boundary", async () => {
  const outputDirectory = process.argv[2]
  assert.ok(outputDirectory, "Expected the Agda JavaScript output directory")

  const require = createRequire(import.meta.url)
  const api = require(
    path.join(outputDirectory, "jAgda.Lineage.API.JavaScript.js"),
  ) as LineageApi
  const state: {
    ownerId: string | null
    persisted: Parameters<CorpusSnapshotStore["append"]>[1] | null
  } = { ownerId: null, persisted: null }
  const store: CorpusSnapshotStore = {
    async append(ownerId, snapshot) {
      state.ownerId = ownerId
      state.persisted = snapshot
    },
    async latest(ownerId) {
      return ownerId === state.ownerId ? state.persisted : null
    },
  }

  const result = await importCorpus({
    input: {
      corpusId: "corpus-france",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [
        {
          challenge: ["What is the capital of France?"],
          id: "capital-of-france",
          resolution: ["What is the capital of France?", "Paris"],
          response: "text",
          revision: 1,
          withheld: ["Paris"],
        },
      ],
    },
    ownerId: "user-1",
    store,
    validator: createCompiledCoreValidator(api),
  })

  assert.equal(result.digest.length, 64)
  assert.equal(state.persisted?.corpusId, "corpus-france")
})
