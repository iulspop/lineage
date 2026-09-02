import { describe, expect, it } from "vitest";

import { corpusDocumentSchema } from "../corpus/schema.js";
import { deriveState } from "../evidence/index.js";
import { planSession } from "./plan.js";
import type { LearningCandidate } from "./types.js";

const corpus = corpusDocumentSchema.parse({
	corpusId: "planning",
	format: "lineage.corpus",
	formatVersion: 1,
	prompts: [],
	relationships: [
		{
			id: "related",
			kind: "related",
			source: { id: "algebra-a" },
			target: { id: "algebra-b" },
		},
	],
});
const state = deriveState({ asOf: "2026-09-02T12:00:00Z", corpus });

function candidate(
	id: string,
	kind: "lesson" | "practice" | "read" | "recall",
	targetId: string,
	duration = 60_000,
): LearningCandidate {
	return {
		activity: {
			estimatedDurationMilliseconds: duration,
			id,
			kind,
			target: { id: targetId, revision: 1, type: "prompt" },
		},
		eligible: true,
		rationales: [{ code: "candidate.objective" }],
	};
}

describe("planSession", () => {
	it("is deterministic for identical explicit inputs and seed", () => {
		const input = {
			candidates: [
				candidate("recall:a", "recall", "algebra-a"),
				candidate("practice:a", "practice", "algebra-a"),
				candidate("recall:b", "recall", "algebra-b"),
			],
			constraints: { availableMinutes: 10, maximumActivities: 3 },
			corpus,
			seed: "session-1",
			state,
		};

		expect(planSession(input)).toEqual(planSession(input));
	});

	it("avoids adjacent activities for the same target when alternatives exist", () => {
		const plan = planSession({
			candidates: [
				candidate("recall:a", "recall", "algebra-a"),
				candidate("practice:a", "practice", "algebra-a"),
				candidate("lesson:c", "lesson", "geometry"),
			],
			constraints: { availableMinutes: 10, maximumActivities: 3 },
			corpus,
			state,
		});

		expect(plan.activities.map(({ activity }) => activity.target.id)).toEqual([
			"algebra-a",
			"geometry",
			"algebra-a",
		]);
	});

	it("respects duration and activity-count budgets and explains deferral", () => {
		const plan = planSession({
			candidates: [
				candidate("lesson:a", "lesson", "a", 120_000),
				candidate("lesson:b", "lesson", "b", 120_000),
				candidate("lesson:c", "lesson", "c", 120_000),
			],
			constraints: { availableMinutes: 3, maximumActivities: 2 },
			corpus,
			state,
		});

		expect(plan.activities).toHaveLength(1);
		expect(plan.estimatedDurationMilliseconds).toBe(120_000);
		expect(plan.deferred).toHaveLength(2);
		expect(plan.deferred.every(({ reason }) => reason === "budget")).toBe(true);
	});
});
