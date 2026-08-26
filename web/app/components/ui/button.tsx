import { Button as ButtonPrimitive } from "@base-ui/react/button"

import * as s from "./button.css"
import { cx } from "~/utils/class-name"

type ButtonVariant = keyof typeof s.variant
type ButtonSize = keyof typeof s.size

type ButtonProps = ButtonPrimitive.Props & {
  size?: ButtonSize
  variant?: ButtonVariant
}

function Button({
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cx(s.button, s.variant[variant], s.size[size], className)}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  )
}

export { Button }
