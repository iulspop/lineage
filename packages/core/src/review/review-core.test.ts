import { describe, expect, it } from "vitest";

import type { ReviewContract } from "../corpus/index.js";
import { reviewCore } from "./review-core.js";

const prompt: ReviewContract = {
	assets: [],
	challenge: ["Question"],
	extensions: { optional: [], required: [] },
	id: "prompt",
	kind: "basic",
	materials: [],
	presentationProfile: "lineage.review/1",
	provenance: [],
	resolution: ["Answer"],
	response: { capture: "none", mode: "self-check" },
	revision: 1,
	sources: [],
	status: "active",
	withheld: ["Answer"],
};

describe("reviewCore", () => {
	it("preserves the disclosure boundary until explicit resolution", () => {
		expect(reviewCore.begin(prompt)).toEqual(["Question"]);
		expect(reviewCore.begin(prompt)).not.toContain("Answer");
		expect(reviewCore.resolve(prompt, "attempt")).toEqual({
			attempt: "attempt",
			presentation: ["Answer"],
		});
	});

	it("records assessment only after resolution", () => {
		expect(reviewCore.complete(prompt, null, "good")).toEqual({
			assessment: "good",
			attempt: null,
			presentation: ["Answer"],
		});
	});
});
