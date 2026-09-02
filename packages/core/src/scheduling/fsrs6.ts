import type { Card, Grade, State } from "ts-fsrs";
import { createEmptyCard, fsrs, generatorParameters, Rating } from "ts-fsrs";

import type {
	RecallAssessment,
	RecallHistoryState,
	RecallPolicy,
	RecallPolicyIdentity,
} from "./policy.js";

export const FSRS6_IDENTITY: RecallPolicyIdentity = Object.freeze({
	family: "fsrs",
	implementation: "ts-fsrs@5.4.1",
	parameterSet:
		"sha256:68ec99cf2c9d3129f7e81f0ad77aaf08892e68417f3809d85c37442708dc6732",
	profile: "fsrs-6-default-r90-v1",
	version: "6",
});

export const FSRS6_PARAMETERS = generatorParameters({
	enable_fuzz: true,
	enable_short_term: true,
	learning_steps: ["1m", "10m"],
	maximum_interval: 36_500,
	relearning_steps: ["10m"],
	request_retention: 0.9,
});

const ratings: Record<RecallAssessment, Grade> = {
	again: Rating.Again,
	easy: Rating.Easy,
	good: Rating.Good,
	hard: Rating.Hard,
};

function previousCard(previous: RecallHistoryState | null, now: Date): Card {
	if (
		previous?.scheduler === FSRS6_IDENTITY.family &&
		previous.dueAt &&
		previous.state != null &&
		previous.stability != null &&
		previous.difficulty != null &&
		previous.elapsedDays != null &&
		previous.scheduledDays != null &&
		previous.learningSteps != null &&
		previous.reps != null &&
		previous.lapses != null
	) {
		return {
			difficulty: previous.difficulty,
			due: previous.dueAt,
			elapsed_days: previous.elapsedDays,
			lapses: previous.lapses,
			last_review: previous.lastReviewedAt,
			learning_steps: previous.learningSteps,
			reps: previous.reps,
			scheduled_days: previous.scheduledDays,
			stability: previous.stability,
			state: previous.state as State,
		};
	}

	return createEmptyCard(now);
}

function intervalMinutes(due: Date, reviewedAt: Date) {
	return Math.max(
		1,
		Math.round((due.getTime() - reviewedAt.getTime()) / 60_000),
	);
}

export function fsrs6(): RecallPolicy {
	const scheduler = fsrs(FSRS6_PARAMETERS);

	return Object.freeze({
		dueAt(previous) {
			if (!previous) return null;
			return (
				previous.dueAt ??
				new Date(
					previous.lastReviewedAt.getTime() +
						previous.nextIntervalMinutes * 60_000,
				)
			);
		},
		identity: FSRS6_IDENTITY,
		isDue(previous, asOf) {
			const due = this.dueAt(previous);
			return !due || due <= asOf;
		},
		preview(previous, reviewedAt) {
			const preview = scheduler.repeat(
				previousCard(previous, reviewedAt),
				reviewedAt,
			);
			return Object.freeze({
				again: intervalMinutes(preview[Rating.Again].card.due, reviewedAt),
				easy: intervalMinutes(preview[Rating.Easy].card.due, reviewedAt),
				good: intervalMinutes(preview[Rating.Good].card.due, reviewedAt),
				hard: intervalMinutes(preview[Rating.Hard].card.due, reviewedAt),
			});
		},
		transition(assessment, previous, reviewedAt) {
			const result = scheduler.next(
				previousCard(previous, reviewedAt),
				reviewedAt,
				ratings[assessment],
			);
			const card = result.card;
			return Object.freeze({
				difficulty: card.difficulty,
				dueAt: card.due,
				elapsedDays: card.elapsed_days,
				family: FSRS6_IDENTITY.family,
				implementation: FSRS6_IDENTITY.implementation,
				lapses: card.lapses,
				learningSteps: card.learning_steps,
				nextIntervalMinutes: intervalMinutes(card.due, reviewedAt),
				parameterSet: FSRS6_IDENTITY.parameterSet,
				previousIntervalMinutes: previous?.nextIntervalMinutes ?? 0,
				profile: FSRS6_IDENTITY.profile,
				reps: card.reps,
				scheduledDays: card.scheduled_days,
				stability: card.stability,
				state: card.state,
				version: FSRS6_IDENTITY.version,
			});
		},
	});
}
