import type { ReviewContract } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"

type RawReviewContract = unknown

type CompiledLineageApi = {
  isValidReviewContract(raw: RawReviewContract): boolean
  rawReviewContract(
    challenge: string[],
  ): (
    resolution: string[],
  ) => (response: string) => (withheld: string[]) => RawReviewContract
}

export function createCompiledCoreValidator(
  api: CompiledLineageApi,
): ReviewContractValidator {
  return {
    isValid(contract: ReviewContract) {
      const raw = api.rawReviewContract(contract.challenge)(
        contract.resolution,
      )(contract.response)(contract.withheld)
      return api.isValidReviewContract(raw)
    },
  }
}
