import type { CorpusDocument, LearningTarget } from "../corpus/schema.js";
import { readingOwnerKey, targetKey } from "../evidence/index.js";
import { unresolvedPrerequisites } from "./eligibility.js";
import { targetMatchesObjective } from "./objective.js";
import type {
	CandidateGenerationInput,
	CandidateRationale,
	LearningCandidate,
} from "./types.js";

const defaultDurations = {
	lesson: 600_000,
	practice: 300_000,
	read: 300_000,
	recall: 60_000,
} as const;

function newestPrompts(corpus: CorpusDocument) {
	const revisions = new Map<string, CorpusDocument["prompts"][number]>();
	for (const prompt of corpus.prompts) {
		const current = revisions.get(prompt.id);
		if (!current || current.revision < prompt.revision)
			revisions.set(prompt.id, prompt);
	}
	return [...revisions.values()];
}

function newestMaterials(corpus: CorpusDocument) {
	const revisions = new Map<string, CorpusDocument["materials"][number]>();
	for (const material of corpus.materials) {
		const current = revisions.get(material.id);
		if (!current || current.revision < material.revision)
			revisions.set(material.id, material);
	}
	return [...revisions.values()];
}

function latestRepetition(corpus: CorpusDocument, promptId: string) {
	return corpus.repetitions
		.filter((repetition) => repetition.promptId === promptId)
		.sort(
			(left, right) =>
				Date.parse(right.reviewedAt) - Date.parse(left.reviewedAt) ||
				right.id.localeCompare(left.id),
		)[0];
}

function makeCandidate(
	input: CandidateGenerationInput,
	target: LearningTarget,
	kind: "lesson" | "practice" | "read" | "recall",
	rationales: CandidateRationale[],
	initiallyEligible = true,
): LearningCandidate {
	const blocked = unresolvedPrerequisites({
		corpus: input.corpus,
		state: input.state,
		target,
		threshold: input.prerequisiteCompletionThreshold,
	});
	if (blocked.length > 0)
		rationales.push({
			code: "candidate.prerequisite-blocked",
			detail: blocked.join(","),
		});
	const matchesObjective = targetMatchesObjective(
		input.corpus,
		target,
		input.objective,
	);
	rationales.push({
		code: matchesObjective
			? "candidate.objective"
			: "candidate.objective-excluded",
	});

	return Object.freeze({
		activity: Object.freeze({
			estimatedDurationMilliseconds:
				input.defaultDurationMilliseconds?.[kind] ?? defaultDurations[kind],
			id: `${kind}:${targetKey(target)}`,
			kind,
			target,
		}),
		eligible:
			initiallyEligible &&
			blocked.length === 0 &&
			targetMatchesObjective(input.corpus, target, input.objective),
		rationales: Object.freeze(
			rationales.map((rationale) => Object.freeze(rationale)),
		),
	});
}

export function generateCandidates(
	input: CandidateGenerationInput,
): readonly LearningCandidate[] {
	const asOf = Date.parse(
		input.asOf instanceof Date ? input.asOf.toISOString() : input.asOf,
	);
	const candidates: LearningCandidate[] = [];

	for (const prompt of newestPrompts(input.corpus)) {
		const target: LearningTarget = {
			id: prompt.id,
			revision: prompt.revision,
			type: "prompt",
		};
		const latest = latestRepetition(input.corpus, prompt.id);
		const dueAt = latest?.scheduler?.dueAt;
		const due = !latest || dueAt === undefined || Date.parse(dueAt) <= asOf;
		const rationales: CandidateRationale[] = [
			{
				code: !latest
					? "candidate.new"
					: due
						? "candidate.due"
						: "candidate.not-due",
			},
		];
		if (prompt.status !== "active")
			rationales.push({ code: "candidate.suspended" });
		candidates.push(
			makeCandidate(
				input,
				target,
				"recall",
				rationales,
				due && prompt.status === "active",
			),
		);

		if (prompt.materials.length > 0)
			candidates.push(
				makeCandidate(
					input,
					target,
					"practice",
					[],
					prompt.status === "active",
				),
			);
	}

	for (const segment of input.corpus.readingSegments) {
		const target: LearningTarget = {
			id: segment.target.id,
			revision: segment.target.revision,
			segmentId: segment.id,
			type:
				segment.target.type === "source"
					? "source-segment"
					: "material-segment",
		};
		const position =
			input.state.readingPositions[
				readingOwnerKey(
					segment.target.type,
					segment.target.id,
					segment.target.revision,
				)
			];
		candidates.push(
			makeCandidate(input, target, "read", [
				{
					code: "candidate.reading-continuity",
					detail:
						position?.currentSegmentId === segment.id ? "current" : "available",
				},
			]),
		);
	}

	for (const material of newestMaterials(input.corpus)) {
		const target: LearningTarget = {
			id: material.id,
			revision: material.revision,
			type: "material",
		};
		candidates.push(makeCandidate(input, target, "lesson", []));
	}

	return Object.freeze(
		candidates.sort((left, right) =>
			left.activity.id.localeCompare(right.activity.id),
		),
	);
}
