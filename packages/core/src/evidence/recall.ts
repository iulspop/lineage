import type { RecallObservation, Repetition } from "./types.js";

function repetitionKey(repetition: Repetition) {
	return `prompt:${repetition.promptId}@${repetition.promptRevision}`;
}

export function foldLatestRecall(
	repetitions: readonly Repetition[],
): Readonly<Record<string, RecallObservation>> {
	const latest: Record<string, RecallObservation> = {};

	for (const repetition of repetitions) {
		const key = repetitionKey(repetition);
		const current = latest[key];
		if (
			current &&
			(Date.parse(current.observedAt) > Date.parse(repetition.reviewedAt) ||
				(Date.parse(current.observedAt) === Date.parse(repetition.reviewedAt) &&
					current.id >= repetition.id))
		)
			continue;

		latest[key] = Object.freeze({
			assessment: repetition.assessment,
			durationMilliseconds: repetition.durationMilliseconds,
			id: repetition.id,
			observedAt: repetition.reviewedAt,
			promptId: repetition.promptId,
			promptRevision: repetition.promptRevision,
		});
	}

	return Object.freeze(latest);
}
