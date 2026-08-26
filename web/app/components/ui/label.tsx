/** biome-ignore-all lint/a11y/noLabelWithoutControl: Will be used with input */

import type { ComponentProps } from "react"

import * as s from "./label.css"
import { cx } from "~/utils/class-name"

function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cx(s.label, className)} data-slot="label" {...props} />
  )
}

export { Label }
