import type {
	CandidateScorePolicy,
	LearningCandidate,
	ScoredCandidate,
} from "../planning/index.js";
import { baselineCandidateScoring } from "../planning/index.js";

const progressionWeights = {
	lesson: 45,
	practice: 35,
	read: 40,
	recall: 30,
} as const;

export function mathematicsProgression(): CandidateScorePolicy {
	const baseline = baselineCandidateScoring();
	return Object.freeze({
		id: "lineage.mathematics-progression",
		score(candidate, state): ScoredCandidate {
			const scored = baseline.score(candidate, state);
			const components = [
				...scored.components,
				{
					name: "objective" as const,
					value: progressionWeights[candidate.activity.kind],
				},
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

export function mathematicsCandidates(
	candidates: readonly LearningCandidate[],
): readonly LearningCandidate[] {
	return Object.freeze(
		candidates.filter(
			(candidate) =>
				candidate.eligible &&
				(candidate.activity.kind !== "practice" ||
					candidate.activity.target.type === "prompt"),
		),
	);
}
