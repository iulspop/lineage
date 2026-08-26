import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { IconCheck } from "@tabler/icons-react"

import * as s from "./checkbox.css"
import { cx } from "~/utils/class-name"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      className={cx(s.root, className)}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={s.indicator}
        data-slot="checkbox-indicator"
      >
        <IconCheck />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
