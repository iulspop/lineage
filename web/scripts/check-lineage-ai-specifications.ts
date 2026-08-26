import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import Ajv2020 from "ajv/dist/2020.js"

import {
  lineageManifestSchema,
  parseCorpusDocument,
  serializeCorpusDocument,
} from "../app/features/lineage/domain/corpus"
import lineageCore from "../app/features/lineage/generated/lineage-core.mjs"
import { createCompiledCoreValidator } from "../app/features/lineage/infrastructure/compiled-core"
import {
  decodeFormatDescription,
  toSerializableDescription,
} from "./lineage-format-description"

const root = path.resolve(process.argv[2] ?? "../generated/lineage-ai")
const readJson = async (relativePath: string) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"))
const ajv = new Ajv2020({ allErrors: true, strict: true })
for (const keyword of [
  "x-lineage-discriminator",
  "x-lineage-reference",
  "x-lineage-requiresWhen",
  "x-lineage-forbidsWhen",
  "x-lineage-resolvesTo",
])
  ajv.addKeyword({ keyword })
ajv.addFormat("date-time", {
  type: "string",
  validate: (value: string) => !Number.isNaN(Date.parse(value)),
})
const corpusSchema = await readJson("schema/lineage-corpus.schema.json")
const manifestSchema = await readJson("schema/lineage-manifest.schema.json")
const validateCorpusSchema = ajv.compile(corpusSchema)
const validateManifestSchema = ajv.compile(manifestSchema)
const validator = createCompiledCoreValidator(lineageCore)

for (const name of await readdir(path.join(root, "examples"))) {
  const document = await readJson(`examples/${name}`)
  const hostMediaMissing = document.assets?.some(
    (asset: { byteSize: unknown; sha256: unknown }) =>
      typeof asset.byteSize !== "number" ||
      typeof asset.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(asset.sha256),
  )
  if (hostMediaMissing) {
    if (validateCorpusSchema(document))
      throw new Error(
        `${name} must remain invalid until host media integrity is supplied`,
      )
    continue
  }
  if (!validateCorpusSchema(document))
    throw new Error(
      `${name} violates the corpus schema: ${ajv.errorsText(validateCorpusSchema.errors)}`,
    )
  if (!validator.validateCorpus?.(document).valid)
    throw new Error(`${name} does not pass semantic validation`)
  const canonical = serializeCorpusDocument(parseCorpusDocument(document))
  if (
    serializeCorpusDocument(parseCorpusDocument(JSON.parse(canonical))) !==
    canonical
  )
    throw new Error(`${name} does not have an idempotent canonical encoding`)
}

for (const name of await readdir(path.join(root, "conformance/valid"))) {
  const fixture = await readJson(`conformance/valid/${name}`)
  if (!validateCorpusSchema(fixture.document))
    throw new Error(`${name} valid fixture violates the corpus schema`)
  if (!validator.validateCorpus?.(fixture.document).valid)
    throw new Error(`${name} valid fixture failed semantic validation`)
  const canonical = serializeCorpusDocument(
    parseCorpusDocument(fixture.document),
  )
  if (
    serializeCorpusDocument(parseCorpusDocument(JSON.parse(canonical))) !==
    canonical
  )
    throw new Error(`${name} valid fixture failed canonical round-trip`)
}
for (const name of await readdir(path.join(root, "conformance/invalid"))) {
  const fixture = await readJson(`conformance/invalid/${name}`)
  const result = validator.validateCorpus?.(fixture.document)
  if (!result || result.valid)
    throw new Error(`${name} unexpectedly passed validation`)
  if (
    !result.diagnostics.some(
      (item) =>
        item.code === fixture.expectedDiagnostic.code &&
        item.path === fixture.expectedDiagnostic.path,
    )
  )
    throw new Error(
      `${name} did not produce ${fixture.expectedDiagnostic.code} at ${fixture.expectedDiagnostic.path}`,
    )
}

const manifestExample = {
  corpus: "corpus.json",
  corpusId: "example-basic",
  corpusSha256: "0".repeat(64),
  createdAt: "2026-08-26T12:00:00Z",
  entries: [
    {
      byteSize: 1,
      mediaType: "application/json",
      path: "corpus.json",
      required: true,
      role: "corpus",
      sha256: "0".repeat(64),
    },
  ],
  format: "lineage.manifest",
  formatVersion: 1,
  modifiedAt: "2026-08-26T12:00:00Z",
  optionalExtensions: [],
  requiredExtensions: [],
  requiredProfiles: ["lineage.review/1"],
}
if (!validateManifestSchema(manifestExample))
  throw new Error(
    `Generated manifest schema rejected a valid manifest: ${ajv.errorsText(validateManifestSchema.errors)}`,
  )
if (!lineageManifestSchema.safeParse(manifestExample).success)
  throw new Error(
    "Production manifest decoder rejected a schema-valid manifest",
  )
const formatDescription = await readJson("format-description.json")
const runtimeDescription = toSerializableDescription(
  decodeFormatDescription(lineageCore.formatDescription),
)
if (JSON.stringify(formatDescription) !== JSON.stringify(runtimeDescription))
  throw new Error(
    "Generated format-description.json drifted from the Agda runtime",
  )
if (formatDescription.objects.length < 15)
  throw new Error(
    "Format description does not cover the complete v1 entity set",
  )
console.log(
  "Lineage AI specifications, schemas, examples, fixtures, and manifest conform",
)
