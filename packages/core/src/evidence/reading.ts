import type { CorpusDocument, LearningObservation } from "../corpus/schema.js";
import type { ReadingPosition } from "./types.js";
import { readingOwnerKey, targetKey } from "./types.js";

export function foldReadingPositions(
	corpus: CorpusDocument,
	observations: readonly LearningObservation[],
): Readonly<Record<string, ReadingPosition>> {
	const segmentsByOwner = new Map<
		string,
		Array<CorpusDocument["readingSegments"][number]>
	>();

	for (const segment of corpus.readingSegments) {
		const key = readingOwnerKey(
			segment.target.type,
			segment.target.id,
			segment.target.revision,
		);
		const segments = segmentsByOwner.get(key) ?? [];
		segments.push(segment);
		segmentsByOwner.set(key, segments);
	}

	const observationsByTarget = new Map<string, LearningObservation[]>();
	for (const observation of observations) {
		if (
			observation.target.type !== "source-segment" &&
			observation.target.type !== "material-segment"
		)
			continue;
		const key = targetKey(observation.target);
		const targetObservations = observationsByTarget.get(key) ?? [];
		targetObservations.push(observation);
		observationsByTarget.set(key, targetObservations);
	}

	const positions: Record<string, ReadingPosition> = {};
	for (const [ownerKey, unsortedSegments] of segmentsByOwner) {
		const segments = [...unsortedSegments].sort(
			(left, right) =>
				left.ordinal - right.ordinal || left.id.localeCompare(right.id),
		);
		const completedSegmentIds: string[] = [];
		const deferredSegmentIds: string[] = [];
		let nextOrdinal = segments[0]?.ordinal ?? 0;

		for (const segment of segments) {
			const targetType =
				segment.target.type === "source"
					? "source-segment"
					: "material-segment";
			const observationsForSegment = observationsByTarget.get(
				targetKey({
					id: segment.target.id,
					revision: segment.target.revision,
					segmentId: segment.id,
					type: targetType,
				}),
			);
			const latest = observationsForSegment?.at(-1);
			if (latest?.observationKind === "completed")
				completedSegmentIds.push(segment.id);
			if (latest?.observationKind === "deferred")
				deferredSegmentIds.push(segment.id);
		}

		for (const segment of segments) {
			if (!completedSegmentIds.includes(segment.id)) {
				nextOrdinal = segment.ordinal;
				break;
			}
			nextOrdinal = segment.ordinal + 1;
		}

		const [ownerType, ownerIdentity] = ownerKey.split(":") as [
			"material" | "source",
			string,
		];
		const separator = ownerIdentity.lastIndexOf("@");
		const ownerId = ownerIdentity.slice(0, separator);
		const ownerRevision = Number(ownerIdentity.slice(separator + 1));
		const currentSegmentId =
			deferredSegmentIds[0] ??
			segments.find((segment) => segment.ordinal === nextOrdinal)?.id;

		positions[ownerKey] = Object.freeze({
			completedSegmentIds: Object.freeze(completedSegmentIds),
			currentSegmentId,
			deferredSegmentIds: Object.freeze(deferredSegmentIds),
			nextOrdinal,
			ownerId,
			ownerRevision,
			ownerType,
		});
	}

	return Object.freeze(positions);
}
