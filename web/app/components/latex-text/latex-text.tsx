import katex from "katex"
import { Fragment } from "react"

import * as s from "./latex-text.css"

type Segment =
  | { content: string; type: "text" }
  | { content: string; displayMode: boolean; type: "math" }

const delimiters = [
  { close: "$$", displayMode: true, open: "$$" },
  { close: "\\]", displayMode: true, open: "\\[" },
  { close: "\\)", displayMode: false, open: "\\(" },
  { close: "$", displayMode: false, open: "$" },
] as const

function isEscaped(value: string, index: number) {
  let slashCount = 0
  for (
    let cursor = index - 1;
    cursor >= 0 && value[cursor] === "\\";
    cursor -= 1
  ) {
    slashCount += 1
  }
  return slashCount % 2 === 1
}

export function parseLatexText(value: string): Segment[] {
  const segments: Segment[] = []
  let textStart = 0
  let cursor = 0

  while (cursor < value.length) {
    const delimiter = delimiters.find(
      ({ open }) => value.startsWith(open, cursor) && !isEscaped(value, cursor),
    )

    if (!delimiter) {
      cursor += 1
      continue
    }

    const contentStart = cursor + delimiter.open.length
    let closeIndex = value.indexOf(delimiter.close, contentStart)
    while (closeIndex >= 0 && isEscaped(value, closeIndex)) {
      closeIndex = value.indexOf(
        delimiter.close,
        closeIndex + delimiter.close.length,
      )
    }

    if (closeIndex < 0) {
      cursor += delimiter.open.length
      continue
    }

    const content = value.slice(contentStart, closeIndex)
    if (!content.trim()) {
      cursor = closeIndex + delimiter.close.length
      continue
    }

    if (cursor > textStart) {
      segments.push({ content: value.slice(textStart, cursor), type: "text" })
    }
    segments.push({ content, displayMode: delimiter.displayMode, type: "math" })
    cursor = closeIndex + delimiter.close.length
    textStart = cursor
  }

  if (textStart < value.length) {
    segments.push({ content: value.slice(textStart), type: "text" })
  }

  return segments.length > 0 ? segments : [{ content: value, type: "text" }]
}

export function LatexText({ children }: { children: string }) {
  const occurrences = new Map<string, number>()
  const keyFor = (segment: Segment) => {
    const base = `${segment.type}:${segment.content}`
    const occurrence = occurrences.get(base) ?? 0
    occurrences.set(base, occurrence + 1)
    return `${base}:${occurrence}`
  }

  return (
    <span className={s.root}>
      {parseLatexText(children).map((segment) => {
        if (segment.type === "text") {
          return <Fragment key={keyFor(segment)}>{segment.content}</Fragment>
        }

        const html = katex.renderToString(segment.content, {
          displayMode: segment.displayMode,
          output: "htmlAndMathml",
          strict: "warn",
          throwOnError: false,
          trust: false,
        })

        return (
          <span
            className={segment.displayMode ? s.displayMath : s.inlineMath}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX produces inert markup with trust disabled.
            dangerouslySetInnerHTML={{ __html: html }}
            key={keyFor(segment)}
          />
        )
      })}
    </span>
  )
}
