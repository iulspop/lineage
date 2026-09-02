import { describe, expect, it } from "vitest";

import { corpusDocumentSchema } from "../corpus/schema.js";
import { deriveState } from "../evidence/index.js";
import { generateCandidates } from "./candidates.js";

const corpus = corpusDocumentSchema.parse({
	collectionMemberships: [
		{ collectionId: "algebra", promptId: "practice-prompt" },
	],
	collections: [{ id: "algebra", title: "Algebra" }],
	corpusId: "learning",
	format: "lineage.corpus",
	formatVersion: 1,
	materials: [
		{
			content: ["Worked example"],
			id: "lesson",
			revision: 1,
			sources: [],
		},
	],
	prompts: [
		{
			challenge: ["Recall"],
			id: "prerequisite",
			resolution: ["Known"],
			response: { capture: "none", mode: "self-check" },
			revision: 1,
			withheld: ["Known"],
		},
		{
			challenge: ["Practice"],
			id: "practice-prompt",
			materials: ["lesson"],
			resolution: ["Result"],
			response: { capture: "none", mode: "self-check" },
			revision: 1,
			withheld: ["Result"],
		},
	],
	readingSegments: [
		{
			content: ["Worked example"],
			id: "segment-1",
			ordinal: 0,
			target: { id: "lesson", revision: 1, type: "material" },
		},
	],
	relationships: [
		{
			id: "prerequisite-edge",
			kind: "prerequisite",
			source: { id: "prerequisite", revision: 1 },
			target: { id: "practice-prompt", revision: 1 },
		},
	],
});

function candidates() {
	const state = deriveState({ asOf: "2026-09-02T12:00:00Z", corpus });
	return generateCandidates({
		asOf: "2026-09-02T12:00:00Z",
		corpus,
		objective: { collectionId: "algebra", type: "collection" },
		state,
	});
}

describe("generateCandidates", () => {
	it("produces recall, practice, reading, and lesson candidates deterministically", () => {
		const first = candidates();
		const second = candidates();

		expect(second).toEqual(first);
		expect(first.map(({ activity }) => activity.kind)).toEqual([
			"lesson",
			"practice",
			"read",
			"recall",
			"recall",
		]);
	});

	it("blocks candidates with unresolved prerequisite evidence", () => {
		const practice = candidates().find(
			({ activity }) => activity.id === "practice:prompt:practice-prompt@1",
		);

		expect(practice?.eligible).toBe(false);
		expect(practice?.rationales).toEqual(
			expect.arrayContaining([
				{ code: "candidate.objective" },
				{
					code: "candidate.prerequisite-blocked",
					detail: "prerequisite",
				},
			]),
		);
	});

	it("keeps objective-external candidates inspectable but ineligible", () => {
		const lesson = candidates().find(
			({ activity }) => activity.kind === "lesson",
		);
		const targetRecall = candidates().find(
			({ activity }) => activity.id === "recall:prompt:practice-prompt@1",
		);

		expect(lesson?.eligible).toBe(false);
		expect(targetRecall?.eligible).toBe(false);
	});
});
