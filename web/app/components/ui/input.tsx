import { Input as InputPrimitive } from "@base-ui/react/input"
import type { ComponentProps } from "react"

import * as s from "./input.css"
import { cx } from "~/utils/class-name"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <InputPrimitive
      className={cx(s.input, className)}
      data-slot="input"
      type={type}
      {...props}
    />
  )
}

export { Input, s as inputStyles }
