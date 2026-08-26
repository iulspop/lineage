import { startAuthentication } from "@simplewebauthn/browser"
import {
  IconBrandAppleFilled,
  IconBrandGoogleFilled,
  IconFingerprint,
  IconMail,
} from "@tabler/icons-react"
import { Img } from "openimg/react"
import { useState } from "react"
import { Form, Link } from "react-router"

import { SEND_MAGIC_LINK_INTENT } from "../domain/auth-constants"
import * as pageStyles from "./auth-page.css"
import { Button } from "~/components/ui/button"
import { FieldError } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import type { UserValidationError } from "~/features/users/domain/users-domain"
import {
  isUserValidationError,
  userValidationErrorToI18nKey,
} from "~/features/users/domain/users-domain"

export type SignInPageActionData =
  | { error: string; success: false }
  | { error: null; success: true }
  | undefined

export function SignInPageComponent({
  actionData,
}: {
  actionData?: SignInPageActionData
}) {
  const [passkeyLoginState, setPasskeyLoginState] = useState<
    "idle" | "checking" | "error"
  >("idle")
  const [isMagicLinkFormVisible, setIsMagicLinkFormVisible] = useState(
    actionData?.success === false,
  )

  const loginWithPasskey = async () => {
    setPasskeyLoginState("checking")

    try {
      const optionsJSON = await fetch("/auth/passkey/login").then((res) =>
        res.json(),
      )
      const credential = await startAuthentication({ optionsJSON })
      const result = await fetch("/auth/passkey/login", {
        body: JSON.stringify(credential),
        headers: { "Content-Type": "application/json" },
        method: "post",
      })

      if (!result.ok) {
        setPasskeyLoginState("error")
        return
      }

      window.location.assign("/")
    } catch {
      setPasskeyLoginState("error")
    }
  }

  return (
    <main className={pageStyles.page}>
      <section className={pageStyles.panel}>
        <Link className={pageStyles.brand} to="/">
          <Img
            alt=""
            className={pageStyles.logo}
            height={28}
            src="/images/logo.png"
            width={28}
          />
          Todo
        </Link>
        <h1 className={pageStyles.heading}>Sign in</h1>
        <p className={pageStyles.subcopy}>Sign in to your account.</p>

        <div className={pageStyles.stack}>
          <Button
            className={pageStyles.fullWidth}
            disabled={passkeyLoginState === "checking"}
            onClick={loginWithPasskey}
            type="button"
          >
            <IconFingerprint aria-hidden="true" className={pageStyles.icon} />
            {passkeyLoginState === "checking"
              ? "Checking passkey…"
              : "Sign in with Passkey"}
          </Button>
          {passkeyLoginState === "error" && (
            <FieldError>Passkey sign in failed.</FieldError>
          )}

          <div className={pageStyles.divider}>
            <div className={pageStyles.dividerLine} />
            <span>OR</span>
            <div className={pageStyles.dividerLine} />
          </div>

          <Button
            className={pageStyles.fullWidth}
            disabled
            type="button"
            variant="outline"
          >
            <IconBrandGoogleFilled aria-hidden="true" />
            Continue with Google
          </Button>
          <Button
            className={pageStyles.fullWidth}
            disabled
            type="button"
            variant="outline"
          >
            <IconBrandAppleFilled aria-hidden="true" />
            Continue with Apple
          </Button>

          {isMagicLinkFormVisible ? (
            <Form className={pageStyles.form} method="post">
              <div className={pageStyles.field}>
                <label className={pageStyles.label} htmlFor="signin-email">
                  Email
                </label>
                <Input
                  autoComplete="email"
                  id="signin-email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
              <Button
                className={pageStyles.fullWidth}
                name="intent"
                type="submit"
                value={SEND_MAGIC_LINK_INTENT}
                variant="outline"
              >
                Send magic link
              </Button>
              {actionData?.success === false && (
                <FieldError>
                  {isUserValidationError(actionData.error)
                    ? userValidationErrorToI18nKey(
                        actionData.error as UserValidationError,
                      )
                    : actionData.error}
                </FieldError>
              )}
            </Form>
          ) : (
            <Button
              className={pageStyles.textAction}
              onClick={() => setIsMagicLinkFormVisible(true)}
              type="button"
              variant="ghost"
            >
              <IconMail aria-hidden="true" className={pageStyles.icon} />
              Email me a sign-in link
            </Button>
          )}
        </div>

        <p className={pageStyles.footer}>
          Don&apos;t have an account?{" "}
          <Link className={pageStyles.footerLink} to="/auth/signup">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
