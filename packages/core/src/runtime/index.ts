import api from "../generated/lineage-core.mjs";
import { createCompiledCoreValidator } from "./compiled-core.js";

export type { ReviewContractValidator } from "./compiled-core.js";
export { createCompiledCoreValidator } from "./compiled-core.js";

export const compiledLineageApi = api;
export const lineageRuntime = createCompiledCoreValidator(api);
