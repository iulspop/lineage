import { IconLoader2 } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useNavigation } from "react-router"
import { useSpinDelay } from "spin-delay"

import * as s from "./progress-bar.css"
import { cx } from "~/utils/class-name"

export function ProgressBarComponent() {
  const transition = useNavigation()
  const busy = transition.state !== "idle"
  const delayedPending = useSpinDelay(busy, {
    delay: 600,
    minDuration: 400,
  })
  const ref = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(true)

  useEffect(() => {
    if (!ref.current) return
    if (delayedPending) setAnimationComplete(false)

    const animationPromises = ref.current
      .getAnimations()
      .map(({ finished }) => finished)

    void Promise.allSettled(animationPromises).then(() => {
      if (!delayedPending) setAnimationComplete(true)
    })
  }, [delayedPending])

  return (
    <div
      aria-hidden={delayedPending ? undefined : true}
      aria-valuetext={delayedPending ? "Loading" : undefined}
      className={s.root}
      role="progressbar"
    >
      <div
        className={cx(
          s.bar,
          transition.state === "idle" &&
            (animationComplete ? s.barIdle : s.barComplete),
          delayedPending &&
            transition.state === "submitting" &&
            s.barSubmitting,
          delayedPending && transition.state === "loading" && s.barLoading,
        )}
        ref={ref}
      />
      {delayedPending && (
        <div className={s.spinnerContainer}>
          <IconLoader2 aria-hidden className={s.spinner} size={16} />
        </div>
      )}
    </div>
  )
}
