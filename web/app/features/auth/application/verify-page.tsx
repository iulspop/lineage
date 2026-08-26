import { IconMailCheck } from "@tabler/icons-react"
import { Form, Link } from "react-router"

import { VERIFY_CODE_INTENT } from "../domain/auth-constants"
import * as pageStyles from "./auth-page.css"
import { Button } from "~/components/ui/button"
import { FieldError } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

type VerifyPageActionData =
  | { error: string; success: false }
  | { error: null; success: true }
  | undefined

const validationMessages: Record<string, string> = {
  codeExpired: "Code expired. Please request a new one.",
  codeRequired: "Please enter your verification code.",
  emailInvalid: "Please enter a valid email address.",
  emailRequired: "Email is required.",
  invalidCode: "Invalid code. Please try again.",
}

export function VerifyPageComponent({
  actionData,
  target,
  type,
}: {
  actionData?: VerifyPageActionData
  target: string
  type: string
}) {
  return (
    <main className={pageStyles.page}>
      <section className={pageStyles.panel}>
        <Link className={pageStyles.brand} to="/">
          <img
            alt=""
            className={pageStyles.logo}
            height={28}
            src="/images/logo.png"
            width={28}
          />
          Todo
        </Link>
        <h1 className={pageStyles.heading}>Check your email</h1>
        <p className={pageStyles.subcopy}>
          We sent a 6-character code to {target}. Enter it below to continue.
        </p>

        <Form className={pageStyles.form} method="post">
          <input name="type" type="hidden" value={type} />
          <input name="target" type="hidden" value={target} />
          <div className={pageStyles.field}>
            <label className={pageStyles.label} htmlFor="verification-code">
              Verification code
            </label>
            <Input
              autoCapitalize="characters"
              autoComplete="one-time-code"
              className={pageStyles.codeInput}
              id="verification-code"
              inputMode="text"
              maxLength={6}
              name="code"
              placeholder="ABC123"
              type="text"
            />
          </div>
          <Button
            className={pageStyles.fullWidth}
            name="intent"
            type="submit"
            value={VERIFY_CODE_INTENT}
          >
            <IconMailCheck aria-hidden="true" className={pageStyles.icon} />
            Verify code
          </Button>
          {actionData?.success === false && (
            <FieldError>
              {validationMessages[actionData.error] ?? actionData.error}
            </FieldError>
          )}
        </Form>

        <p className={pageStyles.footer}>
          Used the wrong email?{" "}
          <Link className={pageStyles.footerLink} to="/auth/signin">
            Go back
          </Link>
        </p>
      </section>
    </main>
  )
}
