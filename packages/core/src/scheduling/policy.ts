export type RecallAssessment = "again" | "easy" | "good" | "hard";

export type RecallHistoryState = Readonly<{
	difficulty?: number | null;
	dueAt?: Date | null;
	elapsedDays?: number | null;
	lapses?: number | null;
	lastReviewedAt: Date;
	learningSteps?: number | null;
	nextIntervalMinutes: number;
	reps?: number | null;
	scheduledDays?: number | null;
	stability?: number | null;
	state?: number | null;
	scheduler: string;
}>;

export type RecallPolicyIdentity = Readonly<{
	family: string;
	implementation: string;
	parameterSet: string;
	profile: string;
	version: string;
}>;

export type RecallIntervalPreview = Readonly<Record<RecallAssessment, number>>;

export type RecallTransition = RecallPolicyIdentity &
	Readonly<{
		difficulty: number;
		dueAt: Date;
		elapsedDays: number;
		lapses: number;
		learningSteps: number;
		nextIntervalMinutes: number;
		previousIntervalMinutes: number;
		reps: number;
		scheduledDays: number;
		stability: number;
		state: number;
	}>;

export type RecallPolicy = Readonly<{
	dueAt(previous: RecallHistoryState | null): Date | null;
	identity: RecallPolicyIdentity;
	isDue(previous: RecallHistoryState | null, asOf: Date): boolean;
	preview(
		previous: RecallHistoryState | null,
		reviewedAt: Date,
	): RecallIntervalPreview;
	transition(
		assessment: RecallAssessment,
		previous: RecallHistoryState | null,
		reviewedAt: Date,
	): RecallTransition;
}>;
