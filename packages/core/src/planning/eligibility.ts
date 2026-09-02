import type { CorpusDocument, LearningTarget } from "../corpus/schema.js";
import type { DerivedLearnerState } from "../evidence/index.js";

function targetId(target: LearningTarget) {
	return target.id;
}

export function unresolvedPrerequisites(input: {
	corpus: CorpusDocument;
	state: DerivedLearnerState;
	target: LearningTarget;
	threshold?: number;
}) {
	const threshold = input.threshold ?? 1;
	return input.corpus.relationships
		.filter(
			(relationship) =>
				relationship.kind === "prerequisite" &&
				relationship.target.id === targetId(input.target),
		)
		.filter((relationship) => {
			const summaries = Object.entries(input.state.summariesByTarget).filter(
				([key]) => key.includes(`:${relationship.source.id}`),
			);
			const completed = summaries.reduce(
				(total, [, summary]) => total + summary.completedCount,
				0,
			);
			const recallReady = Object.values(input.state.latestRecallByPrompt).some(
				(recall) =>
					recall.promptId === relationship.source.id &&
					(recall.assessment === "good" || recall.assessment === "easy"),
			);
			return !recallReady && completed < threshold;
		})
		.map((relationship) => relationship.source.id)
		.sort();
}
