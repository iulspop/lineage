import type { ReviewContract } from "../corpus/index.js";
import { responseDescriptor } from "../corpus/index.js";
import { compiledLineageApi as api } from "../runtime/index.js";

export type ReviewAssessment = "again" | "easy" | "good" | "hard";
export type ReviewResolution = Readonly<{
	attempt: string | null;
	presentation: string[];
}>;
export type CompletedReview = ReviewResolution &
	Readonly<{ assessment: ReviewAssessment }>;
export type ReviewCore = Readonly<{
	begin(contract: ReviewContract): string[];
	complete(
		contract: ReviewContract,
		attempt: string | null,
		assessment: ReviewAssessment,
	): CompletedReview;
	resolve(contract: ReviewContract, attempt: string | null): ReviewResolution;
}>;

type Eliminator<T> = (visitor: {
	just: (value: T) => T;
	nothing: () => null;
}) => T | null;

type CoreContract = unknown;
type ChallengeSession = unknown;
type ResolutionSession = unknown;

function contractFrom(document: ReviewContract): CoreContract {
	const raw = api.rawReviewContract(document.challenge)(document.resolution)(
		responseDescriptor(document),
	)(document.withheld);
	const contract = api.validateReviewContract(raw)({
		just: (value: CoreContract) => value,
		nothing: () => null,
	});
	if (!contract) throw new Error(`Invalid Lineage Prompt ${document.id}`);
	return contract;
}

function resolveSession(
	contract: ReviewContract,
	attempt: string | null,
): ResolutionSession {
	const session = api.beginReview(contractFrom(contract)) as ChallengeSession;
	return attempt
		? api.submitResponse(attempt)(session)
		: api.revealResolution(session);
}

function optionalValue<T>(value: Eliminator<T>): T | null {
	return value({ just: (item) => item, nothing: () => null });
}

export const reviewCore: ReviewCore = Object.freeze({
	begin(contract) {
		return api.presentChallenge(api.beginReview(contractFrom(contract)));
	},
	complete(contract, attempt, assessment) {
		const session = resolveSession(contract, attempt);
		const completed = api.recordAssessment(assessment)(session);
		return Object.freeze({
			assessment,
			attempt: optionalValue(api.capturedCompletedAttempt(completed)),
			presentation: api.presentCompleted(completed),
		});
	},
	resolve(contract, attempt) {
		const session = resolveSession(contract, attempt);
		return Object.freeze({
			attempt: optionalValue(api.capturedResolutionAttempt(session)),
			presentation: api.presentResolution(session),
		});
	},
});
