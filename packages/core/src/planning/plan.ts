import type { CorpusDocument } from "../corpus/schema.js";
import type { DerivedLearnerState } from "../evidence/index.js";
import type { SessionConstraints } from "./budget.js";
import { fitsSessionBudget } from "./budget.js";
import type { InterleavingPolicy } from "./interleave.js";
import { deterministicTieBreak, semanticInterleaving } from "./interleave.js";
import type { CandidateScorePolicy, ScoreComponent } from "./score.js";
import { baselineCandidateScoring } from "./score.js";
import type { LearningActivity, LearningCandidate } from "./types.js";

export type PlannedActivity = Readonly<{
	activity: LearningActivity;
	interleavingAdjustment: number;
	interleavingReasons: readonly string[];
	score: number;
	scoreComponents: readonly ScoreComponent[];
	tieBreak: number;
}>;

export type DeferredCandidate = Readonly<{
	candidate: LearningCandidate;
	reason: "budget" | "ineligible" | "limit";
}>;

export type SessionPlan = Readonly<{
	activities: readonly PlannedActivity[];
	constraints: SessionConstraints;
	deferred: readonly DeferredCandidate[];
	estimatedDurationMilliseconds: number;
	policyIdentities: Readonly<{
		interleaving: string;
		scoring: string;
	}>;
	seed: string;
}>;

export function planSession(input: {
	candidates: readonly LearningCandidate[];
	constraints: SessionConstraints;
	corpus: CorpusDocument;
	interleavingPolicy?: InterleavingPolicy;
	scoringPolicy?: CandidateScorePolicy;
	seed?: string;
	state: DerivedLearnerState;
}): SessionPlan {
	const scoring = input.scoringPolicy ?? baselineCandidateScoring();
	const interleaving = input.interleavingPolicy ?? semanticInterleaving();
	const seed = input.seed ?? "";
	const deferred: DeferredCandidate[] = input.candidates
		.filter((candidate) => !candidate.eligible)
		.map((candidate) => Object.freeze({ candidate, reason: "ineligible" }));
	const remaining = input.candidates
		.filter((candidate) => candidate.eligible)
		.map((candidate) => scoring.score(candidate, input.state));
	const activities: PlannedActivity[] = [];
	let estimatedDurationMilliseconds = 0;

	while (remaining.length > 0) {
		const previous = activities.at(-1)?.activity;
		const ranked = remaining
			.map((scored, index) => {
				const adjustment = interleaving.adjust({
					candidate: scored.candidate.activity,
					corpus: input.corpus,
					previous,
					score: scored.score,
				});
				return {
					adjustment,
					index,
					scored,
					tieBreak: deterministicTieBreak(scored.candidate.activity.id, seed),
				};
			})
			.sort(
				(left, right) =>
					right.scored.score +
						right.adjustment.adjustment -
						(left.scored.score + left.adjustment.adjustment) ||
					left.tieBreak - right.tieBreak ||
					left.scored.candidate.activity.id.localeCompare(
						right.scored.candidate.activity.id,
					),
			);

		const next = ranked[0];
		if (!next) break;
		remaining.splice(next.index, 1);
		const activity = next.scored.candidate.activity;
		if (
			!fitsSessionBudget({
				activityCount: activities.length,
				constraints: input.constraints,
				durationMilliseconds: estimatedDurationMilliseconds,
				nextDurationMilliseconds: activity.estimatedDurationMilliseconds,
			})
		) {
			deferred.push(
				Object.freeze({
					candidate: next.scored.candidate,
					reason:
						activities.length >= input.constraints.maximumActivities
							? "limit"
							: "budget",
				}),
			);
			continue;
		}

		activities.push(
			Object.freeze({
				activity,
				interleavingAdjustment: next.adjustment.adjustment,
				interleavingReasons: next.adjustment.reasons,
				score: next.scored.score + next.adjustment.adjustment,
				scoreComponents: next.scored.components,
				tieBreak: next.tieBreak,
			}),
		);
		estimatedDurationMilliseconds += activity.estimatedDurationMilliseconds;
	}

	return Object.freeze({
		activities: Object.freeze(activities),
		constraints: Object.freeze({ ...input.constraints }),
		deferred: Object.freeze(deferred),
		estimatedDurationMilliseconds,
		policyIdentities: Object.freeze({
			interleaving: `${interleaving.id}@${interleaving.version}`,
			scoring: `${scoring.id}@${scoring.version}`,
		}),
		seed,
	});
}
