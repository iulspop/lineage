import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { LatexText } from "./latex-text"

describe("LatexText", () => {
  test("renders inline and display math with the standard Markdown pipeline", () => {
    const { container } = render(
      <LatexText>
        {"Solve $x^2 = 4$, then\n\n$$\nx = \\pm 2\n$$\n\n."}
      </LatexText>,
    )

    expect(screen.getByText(/Solve/)).toBeInTheDocument()
    expect(container.querySelectorAll(".katex")).toHaveLength(2)
    expect(container.querySelector(".katex-display")).toBeInTheDocument()
  })

  test("keeps an inline exponent attached to its formula in mixed prose", () => {
    const { container } = render(
      <LatexText>
        {"In the expansion of $(a+b)^2$, what is the middle term?"}
      </LatexText>,
    )

    const formula = container.querySelector(".katex")
    expect(formula).toBeInTheDocument()
    expect(formula).toHaveTextContent("(a+b)2")
    expect(screen.getByText(/what is the middle term/)).toBeInTheDocument()
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
  })

  test("keeps malformed expressions visible instead of crashing", () => {
    render(<LatexText>{"Value: $\\notacommand{x}$"}</LatexText>)

    expect(screen.getByText(/Value:/)).toBeInTheDocument()
    expect(screen.getAllByText(/\\notacommand/)).not.toHaveLength(0)
  })
})
