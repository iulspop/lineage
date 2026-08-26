export type AuthoringIntent =
  | "topic"
  | "source"
  | "expand-corpus"
  | "improve-memory"

export type AuthoringMemoryKind = "basic" | "cloze"

export type AuthoringRequest = {
  authoringSpecification: string
  corpusId: string
  depth: "introductory" | "intermediate" | "advanced"
  desiredCount: number
  intent: AuthoringIntent
  memoryKinds: AuthoringMemoryKind[]
  promptId?: string
  source?: string
  topic: string
}

export type AuthoringProviderResult = {
  candidateJson: string
  model: string
  provider: string
  requestId: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

export interface AuthoringProvider {
  generate(
    request: AuthoringRequest,
    signal?: AbortSignal,
  ): Promise<AuthoringProviderResult>
}

export class AuthoringProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthoringProviderError"
  }
}
