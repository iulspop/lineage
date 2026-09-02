import { describe, expect, it } from "vitest";

import type { ReviewContract } from "../corpus/index.js";
import type { RecallHistoryState } from "../scheduling/index.js";
import {
	countDueRecalls,
	findNextRecallAt,
	selectNextRecall,
} from "./recall-queue.js";

const prompts = ["first", "second", "third"].map(
	(id): ReviewContract => ({
		assets: [],
		challenge: [id],
		extensions: { optional: [], required: [] },
		id,
		kind: "basic",
		materials: [],
		presentationProfile: "lineage.review/1",
		provenance: [],
		resolution: ["answer"],
		response: { capture: "none", mode: "self-check" },
		revision: 1,
		sources: [],
		status: "active",
		withheld: ["answer"],
	}),
);

type Review = RecallHistoryState & { promptId: string };
const reviewedAt = new Date("2026-09-01T12:00:00Z");
const review = (promptId: string, dueAt: string): Review => ({
	dueAt: new Date(dueAt),
	lastReviewedAt: reviewedAt,
	nextIntervalMinutes: 60,
	promptId,
	scheduler: "fsrs",
});
const toRecallState = ({ promptId: _, ...state }: Review) => state;

describe("recall queue parity", () => {
	it("orders overdue reviews by due time before unseen prompts", () => {
		const latestReviews = [
			review("first", "2026-09-02T11:00:00Z"),
			review("third", "2026-09-02T10:00:00Z"),
		];
		const input = {
			asOf: new Date("2026-09-02T12:00:00Z"),
			latestReviews,
			prompts,
			toRecallState,
		};

		expect(selectNextRecall(input)?.prompt.id).toBe("third");
		expect(countDueRecalls(input)).toBe(3);
	});

	it("preserves corpus order for unseen prompts and excludes future reviews", () => {
		const input = {
			asOf: new Date("2026-09-02T12:00:00Z"),
			latestReviews: [review("first", "2026-09-03T12:00:00Z")],
			prompts,
			toRecallState,
		};

		expect(selectNextRecall(input)?.prompt.id).toBe("second");
		expect(countDueRecalls(input)).toBe(2);
		expect(findNextRecallAt(input)?.toISOString()).toBe(
			"2026-09-03T12:00:00.000Z",
		);
	});
});
