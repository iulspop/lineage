import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../src");
const forbidden = [
	/^react(?:\/|$)/,
	/^react-router(?:\/|$)/,
	/^@prisma\//,
	/^node:/,
	/(?:^|\/)web(?:\/|$)/,
];
const importPattern =
	/(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

async function files(directory) {
	return (
		await Promise.all(
			(
				await readdir(directory, { withFileTypes: true })
			).map((entry) => {
				const path = resolve(directory, entry.name);
				if (entry.isDirectory()) return files(path);
				return entry.name.endsWith(".ts") && !entry.name.includes(".test.")
					? [path]
					: [];
			}),
		)
	).flat();
}

const violations = [];
for (const path of await files(root)) {
	const source = await readFile(path, "utf8");
	for (const match of source.matchAll(importPattern)) {
		const imported = match[1];
		if (imported && forbidden.some((pattern) => pattern.test(imported))) {
			violations.push(`${relative(root, path)} imports ${imported}`);
		}
	}
}

if (violations.length > 0) {
	console.error(violations.join("\n"));
	process.exitCode = 1;
} else {
	console.log("Core architecture boundaries passed.");
}
