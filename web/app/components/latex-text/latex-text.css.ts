import { globalStyle, style } from "@vanilla-extract/css"

export const root = style({
  minWidth: 0,
})

globalStyle(`${root} .katex`, {
  whiteSpace: "nowrap",
})

globalStyle(`${root} .katex-display`, {
  marginBlock: "0.35em",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
})
