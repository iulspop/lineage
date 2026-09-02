import type { ReviewContract } from "../corpus/index.js";
import type { RecallHistoryState, RecallPolicy } from "../scheduling/index.js";
import { fsrs6 } from "../scheduling/index.js";

export type RecallQueueReview = Readonly<{ promptId: string }>;
export type QueuedRecall<T extends RecallQueueReview = RecallQueueReview> =
	Readonly<{
		dueAt: Date | null;
		latest: T | null;
		prompt: ReviewContract;
		reviewed: boolean;
	}>;

export type RecallQueueInput<T extends RecallQueueReview> = Readonly<{
	asOf: Date;
	latestReviews: readonly T[];
	policy?: RecallPolicy;
	prompts: readonly ReviewContract[];
	toRecallState(review: T): RecallHistoryState;
}>;

export function selectNextRecall<T extends RecallQueueReview>(
	input: RecallQueueInput<T>,
): QueuedRecall<T> | null {
	const policy = input.policy ?? fsrs6();
	const reviewsByPrompt = new Map(
		input.latestReviews.map((review) => [review.promptId, review]),
	);
	const queue = input.prompts.map((prompt, corpusOrder) => {
		const latest = reviewsByPrompt.get(prompt.id) ?? null;
		const promptDueAt = latest
			? policy.dueAt(input.toRecallState(latest))
			: null;
		const priority = !latest
			? 1
			: promptDueAt && promptDueAt <= input.asOf
				? 0
				: 2;
		return {
			corpusOrder,
			dueAt: promptDueAt,
			latest,
			priority,
			prompt,
			reviewed: latest !== null,
		};
	});
	queue.sort((left, right) => {
		if (left.priority !== right.priority) return left.priority - right.priority;
		if (left.priority !== 1) {
			const dueDifference =
				(left.dueAt?.getTime() ?? 0) - (right.dueAt?.getTime() ?? 0);
			if (dueDifference !== 0) return dueDifference;
		}
		return left.corpusOrder - right.corpusOrder;
	});
	return queue.find(({ priority }) => priority < 2) ?? null;
}

export function countDueRecalls<T extends RecallQueueReview>(
	input: RecallQueueInput<T>,
) {
	const policy = input.policy ?? fsrs6();
	const reviewsByPrompt = new Map(
		input.latestReviews.map((review) => [review.promptId, review]),
	);
	return input.prompts.filter((prompt) => {
		const latest = reviewsByPrompt.get(prompt.id) ?? null;
		const promptDueAt = latest
			? policy.dueAt(input.toRecallState(latest))
			: null;
		return !latest || (promptDueAt !== null && promptDueAt <= input.asOf);
	}).length;
}

export function findNextRecallAt<T extends RecallQueueReview>(input: {
	latestReviews: readonly T[];
	policy?: RecallPolicy;
	toRecallState(review: T): RecallHistoryState;
}) {
	const policy = input.policy ?? fsrs6();
	return (
		input.latestReviews
			.map((review) => policy.dueAt(input.toRecallState(review)))
			.filter((date): date is Date => date !== null)
			.sort((left, right) => left.getTime() - right.getTime())[0] ?? null
	);
}
