import type { ComponentProps, ReactNode } from "react"

import * as s from "./page-header.css"
import { cx } from "~/utils/class-name"

type PageHeaderProps = ComponentProps<"header"> & {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}

function PageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cx(s.root, className)} {...props}>
      <div className={s.content}>
        {eyebrow ? <div className={s.eyebrow}>{eyebrow}</div> : null}
        <h1 className={s.title}>{title}</h1>
        {description ? <p className={s.description}>{description}</p> : null}
      </div>
      {actions ? <div className={s.actions}>{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
