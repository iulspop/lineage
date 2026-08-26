import { globalFontFace, globalStyle } from "@vanilla-extract/css"

import { darkThemeClass, lightThemeClass, theme } from "./theme.css"

globalFontFace("Inter", {
  fontDisplay: "swap",
  fontStyle: "normal",
  fontWeight: "400 700",
  src: 'url("/fonts/inter/Inter-Regular.woff2") format("woff2")',
})

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
})

globalStyle("*", {
  margin: 0,
  scrollbarColor: `${theme.color.border.strong} transparent`,
  scrollbarWidth: "thin",
})

globalStyle("html", {
  background: theme.color.background.canvas,
  color: theme.color.text.primary,
  fontFamily: theme.font.family.sans,
  fontSize: "100%",
  lineHeight: theme.font.lineHeight.normal,
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
})

globalStyle(`html.${lightThemeClass}`, {
  colorScheme: "light",
})

globalStyle(`html.${darkThemeClass}`, {
  colorScheme: "dark",
})

globalStyle("body", {
  background: theme.color.background.canvas,
  color: theme.color.text.primary,
  fontSize: theme.font.role.body,
  minHeight: "100vh",
})

globalStyle("::selection", {
  background: theme.color.accent.subtle,
  color: theme.color.text.primary,
})

globalStyle("button, input, textarea, select", {
  font: "inherit",
})

globalStyle("button", {
  cursor: "pointer",
})

globalStyle("button:disabled", {
  cursor: "not-allowed",
})

globalStyle("a", {
  color: "inherit",
  textDecoration: "none",
})

globalStyle("a:focus-visible", {
  borderRadius: theme.radius.xs,
  boxShadow: theme.shadow.focus,
  outline: "none",
})

globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
})

globalStyle("ul, ol", {
  listStyle: "none",
  padding: 0,
})

globalStyle("code, pre, kbd, samp", {
  fontFamily: theme.font.family.mono,
})

globalStyle("kbd", {
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.xs,
  boxShadow: theme.shadow.xs,
  fontSize: "0.85em",
  padding: `0 ${theme.space[1]}`,
})

globalStyle("h1, h2, h3", {
  letterSpacing: theme.font.letterSpacing.tight,
  textWrap: "balance",
})

globalStyle("p", {
  textWrap: "pretty",
})

globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      scrollBehavior: "auto",
      transitionDuration: "0.01ms !important",
    },
  },
})
