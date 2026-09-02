import type {
	CorpusDocument,
	LearningObservation,
	LearningTarget,
} from "../corpus/schema.js";

export type Repetition = CorpusDocument["repetitions"][number];
export type LearningActivityKind = LearningObservation["activityKind"];
export type LearningObservationKind = LearningObservation["observationKind"];

export type EvidenceInput = Readonly<{
	learningObservations: readonly LearningObservation[];
	repetitions: readonly Repetition[];
}>;

export type EvidenceDiagnostic = Readonly<{
	code: "evidence.future" | "evidence.target-unresolved";
	evidenceId: string;
	message: string;
	target?: LearningTarget;
}>;

export type RecallObservation = Readonly<{
	assessment: Repetition["assessment"];
	durationMilliseconds?: number;
	id: string;
	observedAt: string;
	promptId: string;
	promptRevision: number;
}>;

export type TargetEvidenceSummary = Readonly<{
	assessmentCount: number;
	attemptedCount: number;
	completedCount: number;
	deferredCount: number;
	estimatedDurationMilliseconds?: number;
	exposureCount: number;
	latestObservationAt?: string;
	presentedCount: number;
	skippedCount: number;
}>;

export type ReadingPosition = Readonly<{
	completedSegmentIds: readonly string[];
	currentSegmentId?: string;
	deferredSegmentIds: readonly string[];
	nextOrdinal: number;
	ownerId: string;
	ownerRevision: number;
	ownerType: "material" | "source";
}>;

export type RecentEvidence = Readonly<{
	activityKind: LearningActivityKind;
	evidenceId: string;
	observedAt: string;
	targetKey: string;
}>;

export type DerivedLearnerState = Readonly<{
	asOf: string;
	diagnostics: readonly EvidenceDiagnostic[];
	latestRecallByPrompt: Readonly<Record<string, RecallObservation>>;
	readingPositions: Readonly<Record<string, ReadingPosition>>;
	recentEvidence: readonly RecentEvidence[];
	summariesByTarget: Readonly<Record<string, TargetEvidenceSummary>>;
}>;

export type DeriveStateInput = Readonly<{
	asOf: string | Date;
	corpus: CorpusDocument;
	evidence?: Partial<EvidenceInput>;
	recentLimit?: number;
}>;

export function targetKey(target: LearningTarget): string {
	switch (target.type) {
		case "prompt":
		case "source":
		case "material":
			return `${target.type}:${target.id}@${target.revision}`;
		case "source-segment":
		case "material-segment":
			return `${target.type}:${target.id}@${target.revision}#${target.segmentId}`;
		case "collection":
		case "concept":
			return `${target.type}:${target.id}`;
	}
}

export function readingOwnerKey(
	ownerType: "material" | "source",
	ownerId: string,
	ownerRevision: number,
): string {
	return `${ownerType}:${ownerId}@${ownerRevision}`;
}
