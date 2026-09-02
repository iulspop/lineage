import type {
	CorpusDocument,
	CorpusValidationResult,
	LearningObservation,
} from "./corpus/index.js";
import { serializeCorpusDocument } from "./corpus/index.js";
import type { DeriveStateInput } from "./evidence/index.js";
import { deriveState } from "./evidence/index.js";
import type {
	CandidateGenerationInput,
	CandidateScorePolicy,
	InterleavingPolicy,
	SessionConstraints,
	SessionPlan,
} from "./planning/index.js";
import {
	generateCandidates,
	planSession,
	semanticInterleaving,
} from "./planning/index.js";
import type { ReviewContractValidator } from "./runtime/index.js";
import { lineageRuntime } from "./runtime/index.js";
import type { RecallPolicy } from "./scheduling/index.js";
import { fsrs6 } from "./scheduling/index.js";

export type LineageCorePolicies = Readonly<{
	ordering?: InterleavingPolicy;
	recall?: RecallPolicy;
	scoring?: CandidateScorePolicy;
}>;

export type RecordObservationInput = Readonly<{
	activityId: string;
	assessment?: string;
	durationMilliseconds?: number;
	observationId: string;
	observationKind: LearningObservation["observationKind"];
	observedAt: string;
	plan: SessionPlan;
	provenance?: readonly string[];
	response?: string;
}>;

export type RecordObservationResult =
	| Readonly<{ observation: LearningObservation; valid: true }>
	| Readonly<{
			diagnostics: readonly [
				Readonly<{
					code: "observation.activity-not-planned";
					message: string;
				}>,
			];
			valid: false;
	  }>;

export function createLineageCore(options?: {
	policies?: LineageCorePolicies;
	validators?: ReviewContractValidator;
}) {
	const validators = options?.validators ?? lineageRuntime;
	const recall = options?.policies?.recall ?? fsrs6();
	const ordering = options?.policies?.ordering ?? semanticInterleaving();

	return Object.freeze({
		canonicalize(document: CorpusDocument) {
			return serializeCorpusDocument(document);
		},
		deriveState(input: DeriveStateInput) {
			return deriveState(input);
		},
		inspectCandidates(input: CandidateGenerationInput) {
			return generateCandidates(input);
		},
		planSession(
			input: CandidateGenerationInput & {
				constraints: SessionConstraints;
				seed?: string;
			},
		) {
			const candidates = generateCandidates(input);
			return planSession({
				candidates,
				constraints: input.constraints,
				corpus: input.corpus,
				interleavingPolicy: ordering,
				scoringPolicy: options?.policies?.scoring,
				seed: input.seed,
				state: input.state,
			});
		},
		previewRecall(
			previous: Parameters<RecallPolicy["preview"]>[0],
			asOf: Date,
		) {
			return recall.preview(previous, asOf);
		},
		recordObservation(input: RecordObservationInput): RecordObservationResult {
			const planned = input.plan.activities.find(
				({ activity }) => activity.id === input.activityId,
			);
			if (!planned) {
				const diagnostic = Object.freeze({
					code: "observation.activity-not-planned" as const,
					message: "Activity is not present in the session plan",
				});
				return Object.freeze({
					diagnostics: [diagnostic] as const,
					valid: false as const,
				});
			}
			return Object.freeze({
				observation: Object.freeze({
					activityKind: planned.activity.kind,
					assessment: input.assessment,
					durationMilliseconds: input.durationMilliseconds,
					id: input.observationId,
					observationKind: input.observationKind,
					observedAt: input.observedAt,
					provenance: [...(input.provenance ?? [])],
					response: input.response,
					target: planned.activity.target,
				}),
				valid: true as const,
			});
		},
		transitionRecall(
			assessment: Parameters<RecallPolicy["transition"]>[0],
			previous: Parameters<RecallPolicy["transition"]>[1],
			asOf: Date,
		) {
			return recall.transition(assessment, previous, asOf);
		},
		validateCorpus(input: unknown): CorpusValidationResult {
			return validators.validateCorpus(input);
		},
	});
}

export type LineageCore = ReturnType<typeof createLineageCore>;
