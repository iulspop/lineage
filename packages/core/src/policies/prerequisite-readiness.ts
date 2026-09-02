import type { CorpusDocument, LearningTarget } from "../corpus/schema.js";
import type { DerivedLearnerState } from "../evidence/index.js";
import { unresolvedPrerequisites } from "../planning/index.js";

export type PrerequisiteReadinessPolicy = Readonly<{
	evaluate(input: {
		corpus: CorpusDocument;
		state: DerivedLearnerState;
		target: LearningTarget;
	}): Readonly<{ blockedBy: readonly string[]; ready: boolean }>;
	id: string;
	version: string;
}>;

export function prerequisiteReadiness(options?: {
	completionThreshold?: number;
}): PrerequisiteReadinessPolicy {
	return Object.freeze({
		evaluate(input) {
			const blockedBy = unresolvedPrerequisites({
				...input,
				threshold: options?.completionThreshold,
			});
			return Object.freeze({
				blockedBy: Object.freeze(blockedBy),
				ready: blockedBy.length === 0,
			});
		},
		id: "lineage.prerequisite-readiness",
		version: "1",
	});
}
