// Generated from Lineage.Specification.CorpusWireV1. Do not edit.
export type LineageResponse = "text" | { mode: "self-check"; capture: "none" }
export type LineagePromptKind = "basic" | "cloze" | "image-occlusion"
export type LineageClozeTarget = { id: string; answer: string; hints?: string[] }
export type LineagePoint = { x: number; y: number }
export type LineageGeometry =
  | { type: "rectangle"; x: number; y: number; width: number; height: number }
  | { type: "polygon"; points: LineagePoint[] }
export type LineageOcclusionRegion = {
  id: string
  label: string
  geometry: LineageGeometry
  accessibleDescription: string
}
export type LineageAsset = {
  id: string
  mediaType: string
  byteSize: number
  sha256: string
  path: string
}
export type LineagePrompt = {
  id: string
  revision: number
  kind: LineagePromptKind
  challenge: string[]
  withheld: string[]
  resolution: string[]
  response: LineageResponse
  clozeTargets?: LineageClozeTarget[]
  sourceAsset?: string
  occlusionRegions?: LineageOcclusionRegion[]
}
export type LineageCorpusV1 = {
  format: "lineage.corpus"
  formatVersion: 1
  corpusId: string
  prompts: LineagePrompt[]
  assets?: LineageAsset[]
}
export type LineageDiagnostic = {
  code: string
  path: string
  message: string
  relatedPath?: string
  severity: "error" | "warning" | "information"
}
