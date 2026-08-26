---
name: tailwind
description: Tailwind CSS patterns for layouts, color schemes, responsive design, and className handling. Use when writing or reviewing component styles.
---

# Tailwind CSS

Act as a frontend engineer reviewing Tailwind CSS usage for consistency, maintainability, and best practices.

Review: $ARGUMENTS

TailwindCSS {
  Layout {
    Use `gap-*` on parent containers instead of margins on children. Gaps are consistent and don't leak spacing.
    Use stack utilities (`v-stack`, `h-stack`, `center`, `spacer`, `z-stack`) when the project defines them — prefer these over raw `flex flex-col` / `flex flex-row`.
    Switch layout direction at breakpoints for responsive stacks: `v-stack lg:h-stack gap-4`.
  }

  ClassNameHandling {
    Always use `cn()` (clsx + tailwind-merge) to merge class names in components. External `className` props go last so consumers can override.
    Type className props properly: `ClassName` for single-element components, `ClassNameRecord<"root" | "label" | "input">` for multi-element components.
  }

  ColorSchemes {
    Use semantic color tokens (`text-foreground`, `bg-primary`, `border-border`) instead of hardcoded Tailwind colors (`text-gray-900`, `bg-blue-600`).
    Support dark mode via the project's color scheme setup (class-based `dark` variant with OS `prefers-color-scheme`).
  }

  ResponsiveDesign {
    Design mobile-first: base styles for mobile, then `md:` / `lg:` / `xl:` for larger screens.
    Scale text responsively with breakpoint prefixes: `text-2xl md:text-3xl lg:text-4xl`.
    Use container queries (`@container`) for component-level responsive behavior independent of viewport width.
  }

  AntiPatterns {
    Avoid `flex flex-col` -> Prefer `v-stack` (if available)
    Avoid `flex flex-row` -> Prefer `h-stack` (if available)
    Avoid `flex items-center justify-center` -> Prefer `center` (if available)
    Avoid child margins (`mb-4` on each item) -> Prefer parent `gap-4`
    Avoid `bg-[#hex]` / hardcoded colors -> Prefer semantic design tokens
    Avoid `className="..."` without `cn()` -> Prefer `cn("...", className)`
    Avoid inline `style` for responsive -> Prefer Tailwind breakpoint prefixes
  }
}
