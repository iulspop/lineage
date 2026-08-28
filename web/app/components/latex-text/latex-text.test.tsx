import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { LatexText, parseLatexText } from "./latex-text"

describe("LatexText", () => {
  test("parses inline and display LaTeX while preserving surrounding text", () => {
    expect(parseLatexText("Solve $x^2 = 4$, then $$x = \\pm 2$$.")).toEqual([
      { content: "Solve ", type: "text" },
      { content: "x^2 = 4", displayMode: false, type: "math" },
      { content: ", then ", type: "text" },
      { content: "x = \\pm 2", displayMode: true, type: "math" },
      { content: ".", type: "text" },
    ])
  })

  test("supports slash delimiters and leaves escaped currency untouched", () => {
    expect(parseLatexText("Cost: \\$5; solve \\(a+b\\) and \\[c=d\\]")).toEqual(
      [
        { content: "Cost: \\$5; solve ", type: "text" },
        { content: "a+b", displayMode: false, type: "math" },
        { content: " and ", type: "text" },
        { content: "c=d", displayMode: true, type: "math" },
      ],
    )
  })

  test("renders accessible KaTeX without interpreting HTML", () => {
    const { container } = render(
      <LatexText>
        {"Euler: $e^{i\\pi}+1=0$ <script>alert(1)</script>"}
      </LatexText>,
    )

    expect(screen.getByText(/Euler:/)).toBeInTheDocument()
    expect(container.querySelector(".katex-mathml")).toBeInTheDocument()
    expect(container.querySelector("script")).not.toBeInTheDocument()
    expect(container).toHaveTextContent("<script>alert(1)</script>")
  })

  test("keeps malformed expressions visible instead of crashing", () => {
    render(<LatexText>{"Value: $\\notacommand{x}$"}</LatexText>)

    expect(screen.getByText(/Value:/)).toBeInTheDocument()
    expect(screen.getAllByText(/\\notacommand/)).not.toHaveLength(0)
  })
})
