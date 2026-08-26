import { mkdir } from "node:fs/promises"
import path from "node:path"
import { build } from "vite"

const [inputDirectory, outputDirectory] = process.argv.slice(2)
if (!inputDirectory || !outputDirectory) {
  throw new Error(
    "Usage: bundle-lineage-api <Agda output directory> <output directory>",
  )
}

await mkdir(outputDirectory, { recursive: true })
await build({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.join(inputDirectory, "jAgda.Lineage.API.JavaScript.js"),
      fileName: () => "lineage-core.mjs",
      formats: ["es"],
    },
    minify: true,
    outDir: outputDirectory,
  },
  configFile: false,
  logLevel: "warn",
  publicDir: false,
  resolve: {
    alias: [
      {
        find: "agda-rts",
        replacement: path.join(inputDirectory, "agda-rts.js"),
      },
      {
        find: /^(jAgda\..*)$/,
        replacement: path.join(inputDirectory, "$1.js"),
      },
    ],
  },
})
