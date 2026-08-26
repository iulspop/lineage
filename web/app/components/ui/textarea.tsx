import type { ComponentProps } from "react"

import * as s from "./input.css"
import { cx } from "~/utils/class-name"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(s.textarea, className)}
      data-slot="textarea"
      {...props}
    />
  )
}

export { Textarea }
