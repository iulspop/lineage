import type { DerivedLearnerState } from "../evidence/index.js";
import type { LearningCandidate } from "./types.js";

export type ScoreComponent = Readonly<{
	name:
		| "continuity"
		| "new"
		| "objective"
		| "prerequisite"
		| "recency"
		| "urgency";
	value: number;
}>;

export type ScoredCandidate = Readonly<{
	candidate: LearningCandidate;
	components: readonly ScoreComponent[];
	score: number;
}>;

export type CandidateScorePolicy = Readonly<{
	id: string;
	score(
		candidate: LearningCandidate,
		state: DerivedLearnerState,
	): ScoredCandidate;
	version: string;
}>;

export function baselineCandidateScoring(): CandidateScorePolicy {
	return Object.freeze({
		id: "lineage.candidate-score",
		score(candidate, state) {
			const codes = new Set(candidate.rationales.map(({ code }) => code));
			const recentlySeen = state.recentEvidence.some(({ targetKey }) =>
				candidate.activity.id.endsWith(targetKey),
			);
			const components: ScoreComponent[] = [
				{
					name: "objective",
					value: codes.has("candidate.objective") ? 100 : -1000,
				},
				{ name: "urgency", value: codes.has("candidate.due") ? 80 : 0 },
				{ name: "new", value: codes.has("candidate.new") ? 40 : 0 },
				{
					name: "continuity",
					value:
						candidate.rationales.find(
							({ code }) => code === "candidate.reading-continuity",
						)?.detail === "current"
							? 30
							: 0,
				},
				{
					name: "prerequisite",
					value: codes.has("candidate.prerequisite-blocked") ? -1000 : 0,
				},
				{ name: "recency", value: recentlySeen ? -20 : 0 },
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
