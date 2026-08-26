import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import * as s from "./separator.css"
import { cx } from "~/utils/class-name"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      className={cx(s.separator, className)}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  )
}

export { Separator }
