import { style } from "@vanilla-extract/css"

export const root = style({
  minWidth: 0,
})

export const inlineMath = style({
  display: "inline-block",
  maxWidth: "100%",
  verticalAlign: "baseline",
  whiteSpace: "nowrap",
})

export const displayMath = style({
  display: "block",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  paddingBlock: "0.2em",
})
