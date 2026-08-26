import type { ComponentProps } from "react"

import * as s from "./status-dot.css"
import { cx } from "~/utils/class-name"

type StatusDotProps = ComponentProps<"span"> & {
  status?: keyof typeof s.status
}

function StatusDot({
  className,
  status = "neutral",
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(s.dot, s.status[status], className)}
      {...props}
    />
  )
}

export { StatusDot }
