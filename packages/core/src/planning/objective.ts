import type { CorpusDocument, LearningTarget } from "../corpus/schema.js";
import type { PlanningObjective } from "./types.js";

export function targetMatchesObjective(
	corpus: CorpusDocument,
	target: LearningTarget,
	objective: PlanningObjective,
) {
	switch (objective.type) {
		case "all":
			return true;
		case "prompt":
			return target.type === "prompt" && target.id === objective.promptId;
		case "source":
			if (
				(target.type === "source" || target.type === "source-segment") &&
				target.id === objective.sourceId
			)
				return true;
			return (
				target.type === "prompt" &&
				corpus.prompts.some(
					(prompt) =>
						prompt.id === target.id &&
						prompt.sources.includes(objective.sourceId),
				)
			);
		case "material":
			if (
				(target.type === "material" || target.type === "material-segment") &&
				target.id === objective.materialId
			)
				return true;
			return (
				target.type === "prompt" &&
				corpus.prompts.some(
					(prompt) =>
						prompt.id === target.id &&
						prompt.materials.includes(objective.materialId),
				)
			);
		case "collection": {
			const collectionIds = new Set([objective.collectionId]);
			let changed = true;
			while (changed) {
				changed = false;
				for (const collection of corpus.collections) {
					if (
						collection.parentId &&
						collectionIds.has(collection.parentId) &&
						!collectionIds.has(collection.id)
					) {
						collectionIds.add(collection.id);
						changed = true;
					}
				}
			}
			if (target.type === "collection") return collectionIds.has(target.id);
			if (target.type !== "prompt") return false;
			return corpus.collectionMemberships.some(
				(membership) =>
					collectionIds.has(membership.collectionId) &&
					membership.promptId === target.id,
			);
		}
	}
}
