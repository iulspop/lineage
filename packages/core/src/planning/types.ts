import type { CorpusDocument, LearningTarget } from "../corpus/schema.js";
import type {
	DerivedLearnerState,
	LearningActivityKind,
} from "../evidence/index.js";

export type PlanningObjective =
	| Readonly<{ type: "all" }>
	| Readonly<{ collectionId: string; type: "collection" }>
	| Readonly<{ promptId: string; type: "prompt" }>
	| Readonly<{ sourceId: string; type: "source" }>
	| Readonly<{ materialId: string; type: "material" }>;

export type CandidateRationale = Readonly<{
	code:
		| "candidate.due"
		| "candidate.new"
		| "candidate.not-due"
		| "candidate.objective"
		| "candidate.objective-excluded"
		| "candidate.prerequisite-blocked"
		| "candidate.reading-continuity"
		| "candidate.suspended"
		| "candidate.target-unresolved";
	detail?: string;
}>;

export type LearningActivity = Readonly<{
	estimatedDurationMilliseconds: number;
	id: string;
	kind: LearningActivityKind;
	target: LearningTarget;
}>;

export type LearningCandidate = Readonly<{
	activity: LearningActivity;
	eligible: boolean;
	rationales: readonly CandidateRationale[];
}>;

export type CandidateGenerationInput = Readonly<{
	asOf: string | Date;
	corpus: CorpusDocument;
	defaultDurationMilliseconds?: Partial<Record<LearningActivityKind, number>>;
	objective: PlanningObjective;
	prerequisiteCompletionThreshold?: number;
	state: DerivedLearnerState;
}>;
