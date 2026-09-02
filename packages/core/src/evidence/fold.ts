import type {
	CorpusDocument,
	LearningObservation,
	LearningTarget,
} from "../corpus/schema.js";
import { foldReadingPositions } from "./reading.js";
import { foldLatestRecall } from "./recall.js";
import { summarizeEvidence } from "./summary.js";
import type {
	DerivedLearnerState,
	DeriveStateInput,
	EvidenceDiagnostic,
	RecentEvidence,
	Repetition,
} from "./types.js";
import { targetKey } from "./types.js";

function timestamp(value: string | Date) {
	return value instanceof Date
		? value.toISOString()
		: new Date(value).toISOString();
}

function compareEvidence(
	left: { evidenceId?: string; id?: string; observedAt: string },
	right: { evidenceId?: string; id?: string; observedAt: string },
) {
	const leftId = left.id ?? left.evidenceId ?? "";
	const rightId = right.id ?? right.evidenceId ?? "";
	return (
		Date.parse(left.observedAt) - Date.parse(right.observedAt) ||
		leftId.localeCompare(rightId)
	);
}

function createTargetResolver(corpus: CorpusDocument) {
	const exactTargets = new Set([
		...corpus.prompts.map((prompt) => `prompt:${prompt.id}@${prompt.revision}`),
		...corpus.sources.map((source) => `source:${source.id}@${source.revision}`),
		...corpus.materials.map(
			(material) => `material:${material.id}@${material.revision}`,
		),
		...corpus.readingSegments.map((segment) =>
			targetKey({
				id: segment.target.id,
				revision: segment.target.revision,
				segmentId: segment.id,
				type:
					segment.target.type === "source"
						? "source-segment"
						: "material-segment",
			}),
		),
	]);
	const collections = new Set(corpus.collections.map(({ id }) => id));
	const concepts = new Set(
		corpus.relationships.flatMap(({ source, target }) => [
			source.id,
			target.id,
		]),
	);
	return (target: LearningTarget) => {
		if (target.type === "collection") return collections.has(target.id);
		if (target.type === "concept") return concepts.has(target.id);
		return exactTargets.has(targetKey(target));
	};
}

export function deriveState({
	asOf,
	corpus,
	evidence,
	recentLimit = 20,
}: DeriveStateInput): DerivedLearnerState {
	const asOfTimestamp = timestamp(asOf);
	const asOfMilliseconds = Date.parse(asOfTimestamp);
	const diagnostics: EvidenceDiagnostic[] = [];
	const targetResolves = createTargetResolver(corpus);
	const repetitions = [...(evidence?.repetitions ?? corpus.repetitions)].sort(
		(left, right) =>
			compareEvidence(
				{ id: left.id, observedAt: left.reviewedAt },
				{ id: right.id, observedAt: right.reviewedAt },
			),
	);
	const observations = [
		...(evidence?.learningObservations ?? corpus.learningObservations),
	].sort(compareEvidence);

	const acceptedRepetitions: Repetition[] = [];
	for (const repetition of repetitions) {
		if (Date.parse(repetition.reviewedAt) > asOfMilliseconds) {
			diagnostics.push({
				code: "evidence.future",
				evidenceId: repetition.id,
				message: "The repetition occurs after the requested as-of time.",
				target: {
					id: repetition.promptId,
					revision: repetition.promptRevision,
					type: "prompt",
				},
			});
			continue;
		}
		const target: LearningTarget = {
			id: repetition.promptId,
			revision: repetition.promptRevision,
			type: "prompt",
		};
		if (!targetResolves(target)) {
			diagnostics.push({
				code: "evidence.target-unresolved",
				evidenceId: repetition.id,
				message: "The repetition does not resolve to an exact Prompt revision.",
				target,
			});
			continue;
		}
		acceptedRepetitions.push(repetition);
	}

	const acceptedObservations: LearningObservation[] = [];
	for (const observation of observations) {
		if (Date.parse(observation.observedAt) > asOfMilliseconds) {
			diagnostics.push({
				code: "evidence.future",
				evidenceId: observation.id,
				message:
					"The learning observation occurs after the requested as-of time.",
				target: observation.target,
			});
			continue;
		}
		if (!targetResolves(observation.target)) {
			diagnostics.push({
				code: "evidence.target-unresolved",
				evidenceId: observation.id,
				message: "The learning observation target cannot be resolved.",
				target: observation.target,
			});
			continue;
		}
		acceptedObservations.push(observation);
	}

	const recentEvidence: RecentEvidence[] = [
		...acceptedRepetitions.map((repetition) => ({
			activityKind: "recall" as const,
			evidenceId: repetition.id,
			observedAt: repetition.reviewedAt,
			targetKey: targetKey({
				id: repetition.promptId,
				revision: repetition.promptRevision,
				type: "prompt",
			}),
		})),
		...acceptedObservations.map((observation) => ({
			activityKind: observation.activityKind,
			evidenceId: observation.id,
			observedAt: observation.observedAt,
			targetKey: targetKey(observation.target),
		})),
	]
		.sort((left, right) => compareEvidence(left, right))
		.slice(-Math.max(0, recentLimit))
		.reverse();

	return Object.freeze({
		asOf: asOfTimestamp,
		diagnostics: Object.freeze(
			diagnostics.map((diagnostic) => Object.freeze(diagnostic)),
		),
		latestRecallByPrompt: foldLatestRecall(acceptedRepetitions),
		readingPositions: foldReadingPositions(corpus, acceptedObservations),
		recentEvidence: Object.freeze(
			recentEvidence.map((item) => Object.freeze(item)),
		),
		summariesByTarget: summarizeEvidence(
			acceptedObservations,
			acceptedRepetitions,
		),
	});
}
