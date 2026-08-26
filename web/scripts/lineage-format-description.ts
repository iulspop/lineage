type AgdaValue = (
  visitor: Record<string, (...args: unknown[]) => unknown>,
) => unknown

type Constructor = { args: unknown[]; kind: string }

export type Shape = Constructor
export type Field = {
  constraints: Constructor[]
  defaultValue: Constructor
  explanation: string
  name: string
  requirement: "optional" | "required"
  shape: Shape
  summary: string
}
export type ObjectDescription = {
  fields: Field[]
  name: string
  summary: string
}
export type RuleDescription = {
  appliesTo: string
  code: string
  explanation: string
  severity: "error" | "information" | "warning"
  summary: string
}
export type ExampleDescription = {
  fileName: string
  kind: string
  summary: string
}
export type FormatDescription = {
  examples: ExampleDescription[]
  formatName: string
  objects: ObjectDescription[]
  roots: string[]
  rules: RuleDescription[]
  summary: string
  version: number
}

const visit = <T>(
  value: unknown,
  visitor: Record<string, (...args: unknown[]) => T>,
): T => {
  if (typeof value === "function") return (value as AgdaValue)(visitor) as T
  const record = value as Record<string, AgdaValue>
  const constructorName = Object.keys(record)[0]
  if (!constructorName) throw new Error("Agda value has no constructor")
  return record[constructorName](visitor) as T
}

const decodeConstructor = (value: unknown): Constructor =>
  visit(
    value,
    new Proxy(
      {},
      {
        get:
          (_, kind: string) =>
          (...args: unknown[]): Constructor => ({ args, kind }),
      },
    ),
  )

const decodeShape = (value: unknown): Shape => {
  const decoded = decodeConstructor(value)
  if (["array", "nullable"].includes(decoded.kind)) {
    return { ...decoded, args: [decodeShape(decoded.args[0])] }
  }
  if (decoded.kind === "alternatives") {
    return {
      ...decoded,
      args: [(decoded.args[0] as unknown[]).map(decodeShape)],
    }
  }
  return decoded
}

const decodeField = (value: unknown): Field => {
  const [
    name,
    requirement,
    shape,
    constraints,
    defaultValue,
    summary,
    explanation,
  ] = visit(value, { fieldDescription: (...args) => args })
  return {
    constraints: (constraints as unknown[]).map(decodeConstructor),
    defaultValue: decodeConstructor(defaultValue),
    explanation: explanation as string,
    name: name as string,
    requirement: decodeConstructor(requirement).kind as Field["requirement"],
    shape: decodeShape(shape),
    summary: summary as string,
  }
}

export const decodeFormatDescription = (value: unknown): FormatDescription => {
  const [formatName, version, summary, roots, objects, rules, examples] = visit(
    value,
    { format: (...args) => args },
  )
  return {
    examples: (examples as unknown[]).map((exampleValue) => {
      const [fileName, exampleSummary, kind] = visit(exampleValue, {
        example: (...args) => args,
      })
      return {
        fileName: fileName as string,
        kind: kind as string,
        summary: exampleSummary as string,
      }
    }),
    formatName: formatName as string,
    objects: (objects as unknown[]).map((objectValue) => {
      const [name, objectSummary, fields] = visit(objectValue, {
        object: (...args) => args,
      })
      return {
        fields: (fields as unknown[]).map(decodeField),
        name: name as string,
        summary: objectSummary as string,
      }
    }),
    roots: roots as string[],
    rules: (rules as unknown[]).map((ruleValue) => {
      const [code, severity, ruleSummary, explanation, appliesTo] = visit(
        ruleValue,
        { rule: (...args) => args },
      )
      return {
        appliesTo: appliesTo as string,
        code: code as string,
        explanation: explanation as string,
        severity: decodeConstructor(severity)
          .kind as RuleDescription["severity"],
        summary: ruleSummary as string,
      }
    }),
    summary: summary as string,
    version: Number(version),
  }
}

const parseLiteral = (value: unknown) => {
  if (typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const constraintsToSchema = (constraints: Constructor[]) =>
  Object.fromEntries(
    constraints.flatMap(({ args, kind }) => {
      if (kind === "nonEmpty") return [["minLength", 1]]
      if (["minimum", "maximum", "minItems", "maxItems"].includes(kind)) {
        return [[kind, Number(args[0])]]
      }
      if (kind === "uniqueItems") return [["uniqueItems", true]]
      if (kind === "regexPattern") return [["pattern", args[0]]]
      if (kind === "semanticFormat") return [["format", args[0]]]
      if (["requiresWhen", "forbidsWhen", "resolvesTo"].includes(kind)) {
        return [[`x-lineage-${kind}`, args.length === 1 ? args[0] : args]]
      }
      return []
    }),
  )

const shapeToSchema = (shape: Shape): Record<string, unknown> => {
  if (shape.kind === "scalar") {
    const scalar = decodeConstructor(shape.args[0]).kind
    if (scalar === "boolean") return { type: "boolean" }
    if (scalar === "integer") return { type: "integer" }
    if (scalar === "natural") return { minimum: 0, type: "integer" }
    if (scalar === "normalizedCoordinate") {
      return { maximum: 1, minimum: 0, type: "number" }
    }
    if (scalar === "timestamp") return { format: "date-time", type: "string" }
    return { type: "string" }
  }
  if (shape.kind === "literal") {
    const value = parseLiteral(shape.args[0])
    return {
      const: value,
      type:
        typeof value === "number"
          ? Number.isInteger(value)
            ? "integer"
            : "number"
          : typeof value,
    }
  }
  if (shape.kind === "objectRef") {
    return { $ref: `#/$defs/${shape.args[0]}` }
  }
  if (shape.kind === "reference") {
    return {
      minLength: 1,
      type: "string",
      "x-lineage-reference": shape.args[0],
    }
  }
  if (shape.kind === "enumeration") return { enum: shape.args[0] }
  if (shape.kind === "array") {
    return { items: shapeToSchema(shape.args[0] as Shape), type: "array" }
  }
  if (shape.kind === "alternatives") {
    return { oneOf: (shape.args[0] as Shape[]).map(shapeToSchema) }
  }
  if (shape.kind === "taggedChoice") {
    return {
      oneOf: (shape.args[1] as string[]).map((name) => ({
        $ref: `#/$defs/${name}`,
      })),
      "x-lineage-discriminator": shape.args[0],
    }
  }
  if (shape.kind === "nullable") {
    return {
      anyOf: [shapeToSchema(shape.args[0] as Shape), { type: "null" }],
    }
  }
  throw new Error(`Unsupported Agda shape: ${shape.kind}`)
}

const objectToSchema = (description: ObjectDescription) => ({
  additionalProperties: false,
  description: description.summary,
  properties: Object.fromEntries(
    description.fields.map((field) => [
      field.name,
      {
        ...shapeToSchema(field.shape),
        ...constraintsToSchema(field.constraints),
        description: `${field.summary} ${field.explanation}`,
        ...(field.defaultValue.kind === "defaultEmptyArray"
          ? { default: [] }
          : {}),
        ...(field.defaultValue.kind === "defaultLiteral"
          ? { default: parseLiteral(field.defaultValue.args[0]) }
          : {}),
      },
    ]),
  ),
  required: description.fields
    .filter((field) => field.requirement === "required")
    .map((field) => field.name),
  type: "object",
})

export const toJsonSchema = (
  description: FormatDescription,
  root: string,
  id: string,
  title: string,
) => ({
  $defs: Object.fromEntries(
    description.objects.map((object) => [object.name, objectToSchema(object)]),
  ),
  $id: id,
  $ref: `#/$defs/${root}`,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title,
})

const shapeToTypeScript = (shape: Shape): string => {
  if (shape.kind === "scalar") {
    const scalar = decodeConstructor(shape.args[0]).kind
    return ["natural", "integer", "normalizedCoordinate"].includes(scalar)
      ? "number"
      : scalar === "boolean"
        ? "boolean"
        : "string"
  }
  if (shape.kind === "literal")
    return JSON.stringify(parseLiteral(shape.args[0]))
  if (["objectRef", "reference"].includes(shape.kind)) {
    return shape.kind === "reference" ? "string" : (shape.args[0] as string)
  }
  if (shape.kind === "enumeration") {
    return (shape.args[0] as string[])
      .map((value) => JSON.stringify(value))
      .join(" | ")
  }
  if (shape.kind === "array")
    return `Array<${shapeToTypeScript(shape.args[0] as Shape)}>`
  if (shape.kind === "alternatives") {
    return (shape.args[0] as Shape[]).map(shapeToTypeScript).join(" | ")
  }
  if (shape.kind === "taggedChoice")
    return (shape.args[1] as string[]).join(" | ")
  if (shape.kind === "nullable")
    return `${shapeToTypeScript(shape.args[0] as Shape)} | null`
  throw new Error(`Unsupported Agda shape: ${shape.kind}`)
}

export const toTypeScript = (description: FormatDescription) =>
  `// Generated from Lineage.Specification.CorpusWireV1. Do not edit.\n\n${description.objects
    .map(
      (object) =>
        `/** ${object.summary} */\nexport interface ${object.name} {\n${object.fields
          .map(
            (field) =>
              `  /** ${field.summary} ${field.explanation} */\n  ${JSON.stringify(field.name)}${field.requirement === "optional" ? "?" : ""}: ${shapeToTypeScript(field.shape)}\n`,
          )
          .join("")}\n}`,
    )
    .join("\n\n")}\n`

const fieldLine = (field: Field) => {
  const constraints = field.constraints.map(({ kind }) => kind).join(", ")
  return `- \`${field.name}\` (${field.requirement}; ${field.shape.kind}${constraints ? `; ${constraints}` : ""}): ${field.summary} ${field.explanation}`
}

export const toFullSpec = (description: FormatDescription) =>
  `# Lineage corpus v${description.version}: full AI reference\n\n## 1. Scope and authority\n\n${description.summary}\n\nJSON Schema enforces structural constraints. Authoritative semantic validation remains mandatory.\n\n## 2. Wire entities\n\n${description.objects
    .map(
      (object, index) =>
        `### 2.${index + 1} ${object.name}\n\n${object.summary}\n\n${object.fields.map(fieldLine).join("\n")}`,
    )
    .join(
      "\n\n",
    )}\n\n## 3. Semantic diagnostics and invariants\n\n${description.rules
    .map(
      (rule, index) =>
        `### 3.${index + 1} \`${rule.code}\`\n\n**Severity:** ${rule.severity}. **Applies to:** ${rule.appliesTo}.\n\n${rule.summary} ${rule.explanation}`,
    )
    .join(
      "\n\n",
    )}\n\n## 4. Generated examples\n\n${description.examples.map((example) => `- \`${example.fileName}\`: ${example.summary} (${example.kind})`).join("\n")}\n`

export const toBriefSpec = (description: FormatDescription) => {
  const prompt = description.objects.find(({ name }) => name === "Prompt")
  const corpus = description.objects.find(
    ({ name }) => name === "CorpusDocument",
  )
  if (!(prompt && corpus))
    throw new Error("Agda description lacks corpus roots")
  return `# Lineage corpus v${description.version}: AI brief\n\nProduce only a candidate \`${description.formatName}\` document.\n\n## Minimal corpus fields\n\n${corpus.fields
    .filter(({ requirement }) => requirement === "required")
    .map(fieldLine)
    .join(
      "\n",
    )}\n\n## Prompt fields\n\n${prompt.fields.map(fieldLine).join("\n")}\n\n## Critical invariants\n\n${description.rules
    .slice(0, 14)
    .map((rule) => `- \`${rule.code}\`: ${rule.summary}`)
    .join(
      "\n",
    )}\n\nNever invent asset bytes, sizes, paths, or digests. Preserve unrelated identities and revisions during repair. Require human preview and explicit acceptance before persistence.\n`
}

export const toAuthoringSpec = (description: FormatDescription) => {
  const relevant = new Set([
    "Prompt",
    "ClozeTarget",
    "OcclusionRegion",
    "RectangleGeometry",
    "PolygonGeometry",
    "Asset",
    "Source",
    "Material",
    "Provenance",
  ])
  return `# Lineage corpus v${description.version}: AI authoring specification\n\n${description.summary}\n\n${description.objects
    .filter(({ name }) => relevant.has(name))
    .map(
      (object) =>
        `## ${object.name}\n\n${object.summary}\n\n${object.fields.map(fieldLine).join("\n")}`,
    )
    .join(
      "\n\n",
    )}\n\n## Repair protocol\n\nUse stable diagnostic code/path pairs. Modify only named paths, preserve unrelated IDs, revisions, and history, revalidate after every attempt, stop at the configured limit, and surface unresolved failures for human action. Media integrity is always computed by the host from actual bytes.\n`
}

export const toSerializableDescription = (description: FormatDescription) =>
  JSON.parse(
    JSON.stringify(description, (_, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  ) as FormatDescription
