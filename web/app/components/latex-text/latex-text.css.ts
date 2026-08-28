import { style } from "@vanilla-extract/css"

export const root = style({
  minWidth: 0,
})

export const inlineMath = style({
  display: "inline",
})

export const displayMath = style({
  display: "block",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  paddingBlock: "0.2em",
})
