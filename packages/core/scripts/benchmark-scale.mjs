import { deriveState } from "../dist/evidence/index.js";

const promptCount = 100_000;
const evidenceCount = 1_000_000;
const startedAt = performance.now();
const prompts = Array.from({ length: promptCount }, (_, index) => ({
	assets: [],
	challenge: [`Prompt ${index}`],
	extensions: { optional: [], required: [] },
	id: `prompt-${index}`,
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
}));
const repetitions = Array.from({ length: evidenceCount }, (_, index) => ({
	assessment: "good",
	id: `repetition-${String(index).padStart(7, "0")}`,
	promptId: `prompt-${index % promptCount}`,
	promptRevision: 1,
	provenance: [],
	reviewedAt: `2026-09-01T${String(Math.floor((index % 86_400) / 3_600)).padStart(2, "0")}:${String(Math.floor((index % 3_600) / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}Z`,
}));
const corpus = {
	assets: [],
	collectionMemberships: [],
	collections: [],
	corpusId: "scale",
	extensions: [],
	format: "lineage.corpus",
	formatVersion: 1,
	interoperability: [],
	learningObservations: [],
	materials: [],
	migrations: [],
	prompts,
	provenance: [],
	readingSegments: [],
	relationships: [],
	repetitionCorrections: [],
	repetitions,
	sources: [],
};
const state = deriveState({ asOf: "2026-09-02T00:00:00Z", corpus });
const elapsedMilliseconds = Math.round(performance.now() - startedAt);
const heapMegabytes = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

if (Object.keys(state.latestRecallByPrompt).length !== promptCount) {
	throw new Error("Scale fold did not retain every Prompt state");
}
if (state.diagnostics.length !== 0) {
	throw new Error(
		`Scale fold produced ${state.diagnostics.length} diagnostics`,
	);
}
if (elapsedMilliseconds > 60_000 || heapMegabytes > 1_500) {
	throw new Error(
		`Scale threshold exceeded: ${elapsedMilliseconds}ms, ${heapMegabytes}MiB`,
	);
}
console.log(
	JSON.stringify({
		elapsedMilliseconds,
		evidenceCount,
		heapMegabytes,
		promptCount,
	}),
);
