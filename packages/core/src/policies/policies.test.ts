import { describe, expect, it } from "vitest";

import { corpusDocumentSchema } from "../corpus/schema.js";
import { deriveState, targetKey } from "../evidence/index.js";
import type { LearningCandidate } from "../planning/index.js";
import { incrementalReading } from "./incremental-reading.js";
import { mathematicsProgression } from "./mathematics-lesson.js";
import { prerequisiteReadiness } from "./prerequisite-readiness.js";

const corpus = corpusDocumentSchema.parse({
	corpusId: "policies",
	format: "lineage.corpus",
	formatVersion: 1,
	materials: [{ content: ["Lesson"], id: "current", revision: 1, sources: [] }],
	prompts: [],
});

function candidate(
	kind: LearningCandidate["activity"]["kind"],
	id: string,
): LearningCandidate {
	return {
		activity: {
			estimatedDurationMilliseconds: 60_000,
			id: `${kind}:${id}`,
			kind,
			target: { id, revision: 1, type: "material" },
		},
		eligible: true,
		rationales: [
			{ code: "candidate.reading-continuity", detail: "current" },
			{ code: "candidate.objective" },
		],
	};
}

describe("baseline learning policies", () => {
	it("prioritizes the current or explicitly deferred reading target", () => {
		const current = candidate("read", "current");
		const state = deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
			evidence: {
				learningObservations: [
					{
						activityKind: "read",
						id: "deferred",
						observationKind: "deferred",
						observedAt: "2026-09-02T11:00:00Z",
						provenance: [],
						target: current.activity.target,
					},
				],
			},
		});

		expect(
			state.summariesByTarget[targetKey(current.activity.target)]
				?.deferredCount,
		).toBe(1);
		expect(incrementalReading().score(current, state).score).toBeGreaterThan(
			100,
		);
	});

	it("adds authored mathematics progression weights without creating content", () => {
		const state = deriveState({ asOf: "2026-09-02T12:00:00Z", corpus });
		const lesson = mathematicsProgression().score(
			candidate("lesson", "lesson"),
			state,
		);
		const recall = mathematicsProgression().score(
			candidate("recall", "recall"),
			state,
		);

		expect(lesson.score).toBeGreaterThan(recall.score);
		expect(lesson.candidate.activity.target.id).toBe("lesson");
	});

	it("reports targets with no declared prerequisites as ready", () => {
		const state = deriveState({ asOf: "2026-09-02T12:00:00Z", corpus });
		expect(
			prerequisiteReadiness().evaluate({
				corpus,
				state,
				target: { id: "lesson", revision: 1, type: "material" },
			}),
		).toEqual({ blockedBy: [], ready: true });
	});
});
