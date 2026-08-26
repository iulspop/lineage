import type { ComponentProps, ReactNode } from "react"

import * as s from "./empty-state.css"
import { cx } from "~/utils/class-name"

type EmptyStateProps = ComponentProps<"div"> & {
  action?: ReactNode
  description: ReactNode
  icon?: ReactNode
  title: ReactNode
}

function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx(s.root, className)} {...props}>
      {icon ? <div className={s.icon}>{icon}</div> : null}
      <div className={s.copy}>
        <h2 className={s.title}>{title}</h2>
        <p className={s.description}>{description}</p>
      </div>
      {action}
    </div>
  )
}

export { EmptyState }
