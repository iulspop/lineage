import { describe, expect, it } from "vitest";

import { lineageRuntime } from "../runtime/index.js";
import { parseCorpusDocument } from "./schema.js";

const legacyCorpus = {
	corpusId: "legacy",
	format: "lineage.corpus" as const,
	formatVersion: 1 as const,
	prompts: [],
};

const readingCorpus = {
	...legacyCorpus,
	corpusId: "reading",
	learningObservations: [
		{
			activityKind: "read" as const,
			id: "observation-1",
			observationKind: "completed" as const,
			observedAt: "2026-09-02T16:00:00Z",
			target: {
				id: "source-1",
				revision: 1,
				segmentId: "segment-1",
				type: "source-segment" as const,
			},
		},
	],
	readingSegments: [
		{
			content: ["First durable reading segment."],
			id: "segment-1",
			ordinal: 0,
			target: { id: "source-1", revision: 1, type: "source" as const },
		},
	],
	sources: [
		{
			content: "First durable reading segment.",
			id: "source-1",
			revision: 1,
			title: "Example source",
		},
	],
};

describe("durable reading segments and learning evidence", () => {
	it("keeps legacy version-1 corpora backward compatible", () => {
		const parsed = parseCorpusDocument(legacyCorpus);

		expect(parsed.readingSegments).toEqual([]);
		expect(parsed.learningObservations).toEqual([]);
		expect(lineageRuntime.validateCorpus(legacyCorpus).valid).toBe(true);
	});

	it("accepts revision-bound reading segments and observations", () => {
		expect(lineageRuntime.validateCorpus(readingCorpus)).toMatchObject({
			diagnostics: [],
			valid: true,
		});
	});

	it("rejects unresolved segment owners and observation targets", () => {
		const result = lineageRuntime.validateCorpus({
			...readingCorpus,
			readingSegments: [
				{
					...readingCorpus.readingSegments[0],
					target: { id: "missing", revision: 1, type: "source" },
				},
			],
		});

		expect(result.valid).toBe(false);
		if (!result.valid)
			expect(result.diagnostics.map(({ code }) => code)).toEqual(
				expect.arrayContaining([
					"reading.segment-owner-unresolved",
					"evidence.target-unresolved",
				]),
			);
	});

	it("rejects duplicate segment and observation identities", () => {
		const result = lineageRuntime.validateCorpus({
			...readingCorpus,
			learningObservations: [
				readingCorpus.learningObservations[0],
				readingCorpus.learningObservations[0],
			],
			readingSegments: [
				readingCorpus.readingSegments[0],
				readingCorpus.readingSegments[0],
			],
		});

		expect(result.valid).toBe(false);
		if (!result.valid)
			expect(result.diagnostics.map(({ code }) => code)).toContain(
				"identity.duplicate",
			);
	});
});
