import type { ComponentProps } from "react"

import * as s from "./card.css"
import { cx } from "~/utils/class-name"

function Card({
  className,
  size = "default",
  ...props
}: ComponentProps<"div"> & { size?: keyof typeof s.cardSize }) {
  return (
    <div
      className={cx(s.card, s.cardSize[size], className)}
      data-size={size}
      data-slot="card"
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(s.header, className)}
      data-slot="card-header"
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cx(s.title, className)} data-slot="card-title" {...props} />
  )
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(s.description, className)}
      data-slot="card-description"
      {...props}
    />
  )
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(s.action, className)}
      data-slot="card-action"
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(s.content, className)}
      data-slot="card-content"
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(s.footer, className)}
      data-slot="card-footer"
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
