import type { CorpusDocument } from "../corpus/schema.js";
import type { LearningActivity } from "./types.js";

export type InterleavingPolicy = Readonly<{
	adjust(input: {
		candidate: LearningActivity;
		corpus: CorpusDocument;
		previous?: LearningActivity;
		score: number;
	}): Readonly<{ adjustment: number; reasons: readonly string[] }>;
	id: string;
	version: string;
}>;

function promptCollections(corpus: CorpusDocument, promptId: string) {
	return new Set(
		corpus.collectionMemberships
			.filter((membership) => membership.promptId === promptId)
			.map((membership) => membership.collectionId),
	);
}

function semanticallyRelated(
	corpus: CorpusDocument,
	left: LearningActivity,
	right: LearningActivity,
) {
	if (left.target.id === right.target.id) return true;
	const leftCollections = promptCollections(corpus, left.target.id);
	const rightCollections = promptCollections(corpus, right.target.id);
	if ([...leftCollections].some((id) => rightCollections.has(id))) return true;
	return corpus.relationships.some(
		(relationship) =>
			(relationship.source.id === left.target.id &&
				relationship.target.id === right.target.id) ||
			(relationship.source.id === right.target.id &&
				relationship.target.id === left.target.id),
	);
}

export function semanticInterleaving(options?: {
	urgencyOverrideScore?: number;
}): InterleavingPolicy {
	const urgencyOverrideScore = options?.urgencyOverrideScore ?? 175;
	return Object.freeze({
		adjust({ candidate, corpus, previous, score }) {
			if (!previous) return Object.freeze({ adjustment: 0, reasons: [] });
			if (score >= urgencyOverrideScore)
				return Object.freeze({
					adjustment: 0,
					reasons: Object.freeze(["interleave.urgency-override"]),
				});

			let adjustment = 0;
			const reasons: string[] = [];
			if (candidate.target.id === previous.target.id) {
				adjustment -= 1000;
				reasons.push("interleave.same-target");
			}
			if (candidate.kind === previous.kind) {
				adjustment -= 15;
				reasons.push("interleave.same-activity-kind");
			}
			if (semanticallyRelated(corpus, candidate, previous)) {
				adjustment -= 25;
				reasons.push("interleave.related-target");
			}
			return Object.freeze({ adjustment, reasons: Object.freeze(reasons) });
		},
		id: "lineage.semantic-interleaving",
		version: "1",
	});
}

export function deterministicTieBreak(id: string, seed = "") {
	let hash = 2_166_136_261;
	for (const character of `${seed}\0${id}`) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 16_777_619);
	}
	return hash >>> 0;
}
