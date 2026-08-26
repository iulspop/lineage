import type { ComponentProps } from "react"

import * as s from "./skeleton.css"
import { cx } from "~/utils/class-name"

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div aria-hidden="true" className={cx(s.skeleton, className)} {...props} />
  )
}

export { Skeleton }
