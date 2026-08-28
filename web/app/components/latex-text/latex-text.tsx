import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

import * as s from "./latex-text.css"

export function LatexText({ children }: { children: string }) {
  return (
    <span className={s.root}>
      <ReactMarkdown
        components={{
          p: ({ children: content }) => <>{content}</>,
        }}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              output: "htmlAndMathml",
              strict: "warn",
              throwOnError: false,
              trust: false,
            },
          ],
        ]}
        remarkPlugins={[remarkMath]}
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </span>
  )
}
