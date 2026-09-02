export type SessionConstraints = Readonly<{
	availableMinutes: number;
	maximumActivities: number;
}>;

export function sessionBudgetMilliseconds(constraints: SessionConstraints) {
	return Math.max(0, constraints.availableMinutes) * 60_000;
}

export function fitsSessionBudget(input: {
	activityCount: number;
	constraints: SessionConstraints;
	durationMilliseconds: number;
	nextDurationMilliseconds: number;
}) {
	return (
		input.activityCount < Math.max(0, input.constraints.maximumActivities) &&
		input.durationMilliseconds + input.nextDurationMilliseconds <=
			sessionBudgetMilliseconds(input.constraints)
	);
}
