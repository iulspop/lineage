import { createId } from "@paralleldrive/cuid2"

import type {
  AuthoringMemoryKind,
  AuthoringProvider,
  AuthoringProviderResult,
  AuthoringRequest,
} from "../domain/authoring-provider"

function sentences(value: string) {
  return value
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12)
}

function answerFromSentence(sentence: string) {
  const separator = sentence.match(/\b(?:is|are|means|refers to|describes)\b/i)
  if (!separator?.index) return sentence.replace(/[.!?]+$/, "")
  return sentence
    .slice(separator.index + separator[0].length)
    .replace(/[.!?]+$/, "")
    .trim()
}

function challengeFor(topic: string, sentence: string) {
  const subject = sentence.match(
    /^(.+?)\s+(?:is|are|means|refers to|describes)\b/i,
  )?.[1]
  return subject
    ? `What is ${subject.trim()}?`
    : `What should you remember about ${topic}?`
}

function memoryKind(
  request: AuthoringRequest,
  index: number,
): AuthoringMemoryKind {
  return request.memoryKinds[index % request.memoryKinds.length] ?? "basic"
}

export class DeterministicAuthoringProvider implements AuthoringProvider {
  async generate(
    request: AuthoringRequest,
    signal?: AbortSignal,
  ): Promise<AuthoringProviderResult> {
    signal?.throwIfAborted()
    const sourceSentences = sentences(request.source ?? request.topic)
    const seeds = sourceSentences.length > 0 ? sourceSentences : [request.topic]
    const count = request.promptId
      ? 1
      : Math.max(1, Math.min(request.desiredCount, 12))
    const prompts = Array.from({ length: count }, (_, index) => {
      const sentence = seeds[index % seeds.length] ?? request.topic
      const answer = answerFromSentence(sentence)
      const kind = memoryKind(request, index)
      const id = request.promptId ?? createId()
      const challenge =
        kind === "cloze"
          ? sentence.replace(answer, "[…]")
          : challengeFor(request.topic, sentence)

      return {
        challenge: [challenge],
        ...(kind === "cloze"
          ? {
              clozeTargets: [{ answer, id: createId() }],
            }
          : {}),
        id,
        kind,
        resolution: [sentence, answer].filter(
          (value, itemIndex, values) => values.indexOf(value) === itemIndex,
        ),
        response: { capture: "none", mode: "self-check" },
        revision: request.promptId ? 2 : 1,
        withheld: [answer],
      }
    })

    return {
      candidateJson: JSON.stringify({
        assets: [],
        corpusId: request.corpusId,
        extensions: [],
        format: "lineage.corpus",
        formatVersion: 1,
        interoperability: [],
        materials: [],
        migrations: [],
        prompts,
        provenance: [],
        relationships: [],
        repetitionCorrections: [],
        repetitions: [],
        sources: [],
      }),
      model: "lineage-deterministic-v1",
      provider: "lineage",
      requestId: createId(),
    }
  }
}
