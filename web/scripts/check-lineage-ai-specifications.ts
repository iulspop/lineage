import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import Ajv2020 from "ajv/dist/2020.js"

import lineageCore from "../app/features/lineage/generated/lineage-core.mjs"
import { createCompiledCoreValidator } from "../app/features/lineage/infrastructure/compiled-core"

const root = path.resolve(process.argv[2] ?? "../generated/lineage-ai")
const readJson = async (relativePath: string) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"))

const schema = await readJson("schemas/lineage-corpus-v1.schema.json")
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateSchema = ajv.compile(schema)
const validator = createCompiledCoreValidator(lineageCore)

for (const name of await readdir(path.join(root, "examples"))) {
  const document = await readJson(`examples/${name}`)
  const requiresHostMedia = document.assets?.some(
    (asset: { byteSize: unknown; sha256: unknown }) =>
      typeof asset.byteSize !== "number" ||
      typeof asset.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(asset.sha256),
  )
  if (requiresHostMedia) {
    if (validateSchema(document))
      throw new Error(
        `${name} must remain invalid until the host supplies media integrity data`,
      )
    continue
  }
  if (!validateSchema(document))
    throw new Error(
      `${name} does not conform to the generated schema: ${ajv.errorsText(validateSchema.errors)}`,
    )
  const result = validator.validateCorpus?.(document)
  if (!result?.valid)
    throw new Error(`${name} does not pass Lineage semantic validation`)
}

const validFixture = await readJson("fixtures/valid/basic.json")
if (!validateSchema(validFixture.document))
  throw new Error("The valid fixture does not conform to the generated schema")
if (!validator.validateCorpus?.(validFixture.document).valid)
  throw new Error("The valid fixture does not pass semantic validation")

for (const name of await readdir(path.join(root, "fixtures/invalid"))) {
  const fixture = await readJson(`fixtures/invalid/${name}`)
  const result = validator.validateCorpus?.(fixture.document)
  if (!result || result.valid)
    throw new Error(`${name} unexpectedly passed corpus validation`)
  if (
    !result.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === fixture.expectedDiagnostic.code &&
        diagnostic.path === fixture.expectedDiagnostic.path &&
        (fixture.expectedDiagnostic.relatedPath === undefined ||
          diagnostic.relatedPath === fixture.expectedDiagnostic.relatedPath),
    )
  )
    throw new Error(`${name} did not produce its expected stable diagnostic`)
}

const description = await readJson("format-description.json")
if (JSON.stringify(description) !== lineageCore.formatDescriptionJson)
  throw new Error(
    "Generated format-description.json drifted from the Agda runtime",
  )

console.log(
  "Lineage AI specifications, schemas, examples, and fixtures conform",
)
