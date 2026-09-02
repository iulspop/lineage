import { targetKey } from "../evidence/index.js";
import type {
	CandidateScorePolicy,
	LearningCandidate,
	ScoredCandidate,
} from "../planning/index.js";
import { baselineCandidateScoring } from "../planning/index.js";

export function incrementalReading(): CandidateScorePolicy {
	const baseline = baselineCandidateScoring();
	return Object.freeze({
		id: "lineage.incremental-reading",
		score(candidate, state): ScoredCandidate {
			const scored = baseline.score(candidate, state);
			if (candidate.activity.kind !== "read") return scored;
			const rationale = candidate.rationales.find(
				({ code }) => code === "candidate.reading-continuity",
			);
			const summary =
				state.summariesByTarget[targetKey(candidate.activity.target)];
			const continuity = rationale?.detail === "current" ? 60 : 0;
			const resurfacing = (summary?.deferredCount ?? 0) > 0 ? 35 : 0;
			const recent = state.recentEvidence.at(-1);
			const contextSwitch =
				recent &&
				recent.activityKind === "read" &&
				!recent.targetKey.includes(`:${candidate.activity.target.id}@`)
					? -20
					: 0;
			const components = [
				...scored.components,
				{ name: "continuity" as const, value: continuity },
				{ name: "recency" as const, value: resurfacing + contextSwitch },
			];
			return Object.freeze({
				candidate,
				components: Object.freeze(components),
				score: components.reduce(
					(total, component) => total + component.value,
					0,
				),
			});
		},
		version: "1",
	});
}

export function readingCandidates(candidates: readonly LearningCandidate[]) {
	return Object.freeze(
		candidates.filter(
			(candidate) => candidate.eligible && candidate.activity.kind === "read",
		),
	);
}
