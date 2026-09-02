import { describe, expect, it } from "vitest";

import { FSRS6_IDENTITY, fsrs6 } from "./fsrs6.js";
import type { RecallHistoryState } from "./policy.js";

const reviewedAt = new Date("2026-08-26T12:00:00.000Z");

describe("fsrs6", () => {
	it("preserves the existing interval previews", () => {
		expect(fsrs6().preview(null, reviewedAt)).toEqual({
			again: 1,
			easy: 8640,
			good: 10,
			hard: 6,
		});
	});

	it("preserves the complete first-review transition", () => {
		expect(fsrs6().transition("easy", null, reviewedAt)).toMatchObject({
			difficulty: 1,
			dueAt: new Date("2026-09-01T12:00:00.000Z"),
			elapsedDays: 0,
			family: FSRS6_IDENTITY.family,
			implementation: FSRS6_IDENTITY.implementation,
			lapses: 0,
			learningSteps: 0,
			nextIntervalMinutes: 8640,
			parameterSet: FSRS6_IDENTITY.parameterSet,
			previousIntervalMinutes: 0,
			profile: FSRS6_IDENTITY.profile,
			reps: 1,
			scheduledDays: 6,
			state: 2,
			version: FSRS6_IDENTITY.version,
		});
	});

	it("uses the explicit legacy due fallback", () => {
		const previous: RecallHistoryState = {
			lastReviewedAt: new Date("2026-08-20T00:00:00.000Z"),
			nextIntervalMinutes: 1440,
			scheduler: "lineage-prototype",
		};
		const policy = fsrs6();

		expect(policy.dueAt(previous)?.toISOString()).toBe(
			"2026-08-21T00:00:00.000Z",
		);
		expect(policy.isDue(previous, new Date("2026-08-20T23:59:00.000Z"))).toBe(
			false,
		);
		expect(policy.isDue(previous, new Date("2026-08-21T00:00:00.000Z"))).toBe(
			true,
		);
	});
});
