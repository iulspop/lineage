import { describe, expect, it } from "vitest";

import type { CorpusDocument } from "../corpus/schema.js";
import { deriveState } from "./fold.js";

const corpus: CorpusDocument = {
	assets: [],
	collectionMemberships: [],
	collections: [],
	corpusId: "learning",
	extensions: [],
	format: "lineage.corpus",
	formatVersion: 1,
	interoperability: [],
	learningObservations: [
		{
			activityKind: "read",
			durationMilliseconds: 120_000,
			id: "observation-1",
			observationKind: "completed",
			observedAt: "2026-09-02T10:00:00Z",
			provenance: [],
			target: {
				id: "source-1",
				revision: 1,
				segmentId: "segment-1",
				type: "source-segment",
			},
		},
		{
			activityKind: "read",
			durationMilliseconds: 180_000,
			id: "observation-2",
			observationKind: "deferred",
			observedAt: "2026-09-02T10:05:00Z",
			provenance: [],
			target: {
				id: "source-1",
				revision: 1,
				segmentId: "segment-2",
				type: "source-segment",
			},
		},
	],
	materials: [],
	migrations: [],
	prompts: [
		{
			assets: [],
			challenge: ["First prompt"],
			extensions: { optional: [], required: [] },
			id: "prompt-1",
			kind: "basic",
			materials: [],
			presentationProfile: "lineage.review/1",
			provenance: [],
			resolution: ["Answer"],
			response: { capture: "none", mode: "self-check" },
			revision: 1,
			sources: [],
			status: "active",
			withheld: ["Answer"],
		},
	],
	provenance: [],
	readingSegments: [
		{
			content: ["First"],
			id: "segment-1",
			ordinal: 0,
			target: { id: "source-1", revision: 1, type: "source" },
		},
		{
			content: ["Second"],
			id: "segment-2",
			ordinal: 1,
			target: { id: "source-1", revision: 1, type: "source" },
		},
	],
	relationships: [],
	repetitionCorrections: [],
	repetitions: [
		{
			assessment: "again",
			id: "repetition-1",
			promptId: "prompt-1",
			promptRevision: 1,
			provenance: [],
			reviewedAt: "2026-09-02T09:00:00Z",
		},
		{
			assessment: "good",
			id: "repetition-2",
			promptId: "prompt-1",
			promptRevision: 1,
			provenance: [],
			reviewedAt: "2026-09-02T11:00:00Z",
		},
	],
	sources: [
		{
			assets: [],
			content: "First\nSecond",
			id: "source-1",
			provenance: [],
			revision: 1,
			title: "Source",
		},
	],
};

describe("deriveState", () => {
	it("folds recall, reading position, summaries, and recent evidence", () => {
		const state = deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
			recentLimit: 3,
		});

		expect(state.latestRecallByPrompt["prompt:prompt-1@1"]?.assessment).toBe(
			"good",
		);
		expect(state.readingPositions["source:source-1@1"]).toMatchObject({
			completedSegmentIds: ["segment-1"],
			currentSegmentId: "segment-2",
			deferredSegmentIds: ["segment-2"],
			nextOrdinal: 1,
		});
		expect(
			state.summariesByTarget["source-segment:source-1@1#segment-1"]
				?.estimatedDurationMilliseconds,
		).toBe(120_000);
		expect(state.summariesByTarget["prompt:prompt-1@1"]).toMatchObject({
			assessmentCount: 2,
			exposureCount: 2,
		});
		expect(state.recentEvidence.map(({ evidenceId }) => evidenceId)).toEqual([
			"repetition-2",
			"observation-2",
			"observation-1",
		]);
		expect(state.diagnostics).toEqual([]);
	});

	it("excludes future and unresolved evidence with diagnostics", () => {
		const state = deriveState({
			asOf: "2026-09-02T10:30:00Z",
			corpus,
			evidence: {
				learningObservations: [
					...corpus.learningObservations,
					{
						activityKind: "practice",
						id: "unresolved",
						observationKind: "attempted",
						observedAt: "2026-09-02T10:10:00Z",
						provenance: [],
						target: { id: "missing", revision: 1, type: "prompt" },
					},
				],
			},
		});

		expect(state.latestRecallByPrompt["prompt:prompt-1@1"]?.assessment).toBe(
			"again",
		);
		expect(state.diagnostics.map(({ code }) => code)).toEqual([
			"evidence.future",
			"evidence.target-unresolved",
		]);
	});

	it("orders offset timestamps by instant rather than source text", () => {
		const state = deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
			evidence: {
				repetitions: [
					{
						assessment: "easy",
						id: "later-instant",
						promptId: "prompt-1",
						promptRevision: 1,
						provenance: [],
						reviewedAt: "2026-09-02T12:30:00+02:00",
					},
					{
						assessment: "hard",
						id: "earlier-instant",
						promptId: "prompt-1",
						promptRevision: 1,
						provenance: [],
						reviewedAt: "2026-09-02T11:00:00+01:00",
					},
				],
			},
		});

		expect(state.latestRecallByPrompt["prompt:prompt-1@1"]?.assessment).toBe(
			"easy",
		);
	});

	it("is deterministic for equivalent evidence ordering", () => {
		const left = deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
		});
		const right = deriveState({
			asOf: new Date("2026-09-02T12:00:00Z"),
			corpus: {
				...corpus,
				learningObservations: [...corpus.learningObservations].reverse(),
				repetitions: [...corpus.repetitions].reverse(),
			},
		});

		expect(right).toEqual(left);
	});
});
