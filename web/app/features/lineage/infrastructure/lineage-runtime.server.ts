import api from "../generated/lineage-core.mjs"
import { createCompiledCoreValidator } from "./compiled-core"

export const lineageRuntime = createCompiledCoreValidator(api)
