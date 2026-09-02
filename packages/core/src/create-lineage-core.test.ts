import { describe, expect, it } from "vitest";

import { corpusDocumentSchema } from "./corpus/index.js";
import { createLineageCore } from "./create-lineage-core.js";

const corpus = corpusDocumentSchema.parse({
	corpusId: "facade",
	format: "lineage.corpus",
	formatVersion: 1,
	prompts: [
		{
			challenge: ["Question"],
			id: "prompt",
			resolution: ["Answer"],
			response: { capture: "none", mode: "self-check" },
			revision: 1,
			withheld: ["Answer"],
		},
	],
});

describe("createLineageCore", () => {
	it("derives state, inspects candidates, and plans through one pure API", () => {
		const core = createLineageCore();
		const state = core.deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
		});
		const input = {
			asOf: "2026-09-02T12:00:00Z",
			corpus,
			objective: { type: "all" as const },
			state,
		};

		expect(core.inspectCandidates(input)).toHaveLength(1);
		expect(
			core.planSession({
				...input,
				constraints: { availableMinutes: 5, maximumActivities: 1 },
				seed: "session",
			}).activities,
		).toHaveLength(1);
	});

	it("constructs evidence only for an activity in the supplied plan", () => {
		const core = createLineageCore();
		const state = core.deriveState({
			asOf: "2026-09-02T12:00:00Z",
			corpus,
		});
		const plan = core.planSession({
			asOf: "2026-09-02T12:00:00Z",
			constraints: { availableMinutes: 5, maximumActivities: 1 },
			corpus,
			objective: { type: "all" },
			state,
		});
		const activityId = plan.activities[0]?.activity.id;
		expect(activityId).toBeDefined();
		if (!activityId) return;

		expect(
			core.recordObservation({
				activityId,
				observationId: "observation",
				observationKind: "completed",
				observedAt: "2026-09-02T12:01:00Z",
				plan,
			}),
		).toMatchObject({ valid: true });
		expect(
			core.recordObservation({
				activityId: "missing",
				observationId: "observation",
				observationKind: "completed",
				observedAt: "2026-09-02T12:01:00Z",
				plan,
			}),
		).toMatchObject({
			diagnostics: [{ code: "observation.activity-not-planned" }],
			valid: false,
		});
	});

	it("returns authoritative diagnostics for untrusted corpus input", () => {
		expect(createLineageCore().validateCorpus({})).toMatchObject({
			valid: false,
		});
	});
});
