/** biome-ignore-all lint/a11y/useSemanticElements: Field groups intentionally avoid fieldset semantics. */

import { useMemo } from "react"

import * as s from "./field.css"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { cx } from "~/utils/class-name"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      className={cx(s.fieldSet, className)}
      data-slot="field-set"
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & {
  variant?: keyof typeof s.fieldLegendVariant
}) {
  return (
    <legend
      className={cx(s.fieldLegend, s.fieldLegendVariant[variant], className)}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx(s.fieldGroup, className)}
      data-slot="field-group"
      {...props}
    />
  )
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: keyof typeof s.fieldOrientation
}) {
  return (
    <div
      className={cx(s.field, s.fieldOrientation[orientation], className)}
      data-orientation={orientation}
      data-slot="field"
      role="group"
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx(s.fieldContent, className)}
      data-slot="field-content"
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cx(s.fieldLabel, className)}
      data-slot="field-label"
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx(s.fieldTitle, className)}
      data-slot="field-label"
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cx(s.fieldDescription, className)}
      data-slot="field-description"
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      className={cx(s.fieldSeparator, className)}
      data-content={!!children}
      data-slot="field-separator"
      {...props}
    >
      <Separator className={s.fieldSeparatorLine} />
      {children && (
        <span
          className={s.fieldSeparatorContent}
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined> | string[]
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    if (errors?.length === 1) {
      return typeof errors[0] === "string" ? errors[0] : errors[0]?.message
    }

    return (
      <ul className={s.fieldErrorList}>
        {errors.map((error) =>
          typeof error === "string" ? (
            <li key={error}>{error}</li>
          ) : error?.message ? (
            <li key={error.message}>{error.message}</li>
          ) : null,
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      className={cx(s.fieldError, className)}
      data-slot="field-error"
      role="alert"
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
