import { z } from "zod"

import {
  SEND_MAGIC_LINK_INTENT,
  VERIFY_CODE_INTENT,
} from "../domain/auth-constants"

export const sendMagicLinkSchema = z.object({
  email: z.string().trim().min(1, { message: "auth:validation.emailRequired" }),
  intent: z.literal(SEND_MAGIC_LINK_INTENT),
})

export const verifyCodeSchema = z.object({
  code: z.string().trim().min(1, { message: "auth:validation.codeRequired" }),
  intent: z.literal(VERIFY_CODE_INTENT),
  target: z.string().min(1),
  type: z.string().min(1),
})

export const authActionSchema = z.discriminatedUnion("intent", [
  sendMagicLinkSchema,
  verifyCodeSchema,
])

export type AuthActionSchema = z.infer<typeof authActionSchema>
export type SendMagicLinkSchema = z.infer<typeof sendMagicLinkSchema>
export type VerifyCodeSchema = z.infer<typeof verifyCodeSchema>
