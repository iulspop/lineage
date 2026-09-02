import type { LearningObservation } from "../corpus/schema.js";
import type { Repetition, TargetEvidenceSummary } from "./types.js";
import { targetKey } from "./types.js";

type MutableSummary = {
	assessmentCount: number;
	attemptedCount: number;
	completedCount: number;
	deferredCount: number;
	durations: number[];
	exposureCount: number;
	latestObservationAt?: string;
	presentedCount: number;
	skippedCount: number;
};

const emptySummary = (): MutableSummary => ({
	assessmentCount: 0,
	attemptedCount: 0,
	completedCount: 0,
	deferredCount: 0,
	durations: [],
	exposureCount: 0,
	presentedCount: 0,
	skippedCount: 0,
});

export function summarizeEvidence(
	observations: readonly LearningObservation[],
	repetitions: readonly Repetition[] = [],
): Readonly<Record<string, TargetEvidenceSummary>> {
	const mutable: Record<string, MutableSummary> = {};

	for (const repetition of repetitions) {
		const key = targetKey({
			id: repetition.promptId,
			revision: repetition.promptRevision,
			type: "prompt",
		});
		const summary = mutable[key] ?? emptySummary();
		summary.assessmentCount += 1;
		summary.exposureCount += 1;
		summary.latestObservationAt = repetition.reviewedAt;
		if (repetition.durationMilliseconds !== undefined)
			summary.durations.push(repetition.durationMilliseconds);
		mutable[key] = summary;
	}

	for (const observation of observations) {
		const key = targetKey(observation.target);
		const summary = mutable[key] ?? { ...emptySummary(), durations: [] };
		summary.latestObservationAt = observation.observedAt;
		summary.exposureCount += 1;
		if (observation.durationMilliseconds !== undefined)
			summary.durations.push(observation.durationMilliseconds);

		switch (observation.observationKind) {
			case "presented":
				summary.presentedCount += 1;
				break;
			case "attempted":
				summary.attemptedCount += 1;
				break;
			case "completed":
				summary.completedCount += 1;
				break;
			case "skipped":
				summary.skippedCount += 1;
				break;
			case "assessed":
				summary.assessmentCount += 1;
				break;
			case "deferred":
				summary.deferredCount += 1;
				break;
		}

		mutable[key] = summary;
	}

	return Object.freeze(
		Object.fromEntries(
			Object.entries(mutable).map(([key, { durations, ...summary }]) => [
				key,
				Object.freeze({
					...summary,
					estimatedDurationMilliseconds:
						durations.length === 0
							? undefined
							: Math.round(
									durations.reduce((total, duration) => total + duration, 0) /
										durations.length,
								),
				}),
			]),
		),
	);
}
