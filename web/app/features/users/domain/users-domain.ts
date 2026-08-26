// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Discriminated result union. Defined locally so the domain file
 * remains pure (zero imports).
 */
export type Result<T, E> =
  | { error: E; success: false }
  | { data: T; success: true }

export type UserValidationError = "EMAIL_EMPTY" | "EMAIL_INVALID"

// ─── Constants ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Validates and normalises an email address.
 */
export const validateEmail = (
  email: string,
): Result<string, UserValidationError> => {
  const trimmed = email.trim().toLowerCase()
  if (trimmed.length === 0) return { error: "EMAIL_EMPTY", success: false }
  if (!EMAIL_REGEX.test(trimmed))
    return { error: "EMAIL_INVALID", success: false }
  return { data: trimmed, success: true }
}

/**
 * Maps user validation errors to i18n keys.
 */
const userValidationErrorI18nKeys = {
  EMAIL_EMPTY: "validation.emailRequired",
  EMAIL_INVALID: "validation.emailInvalid",
} as const

export const userValidationErrorToI18nKey = (
  error: UserValidationError,
): (typeof userValidationErrorI18nKeys)[UserValidationError] =>
  userValidationErrorI18nKeys[error]

/**
 * Type guard for UserValidationError.
 */
export const isUserValidationError = (
  value: string,
): value is UserValidationError => value in userValidationErrorI18nKeys
