import type { RenderOptions } from "@testing-library/react"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, options)

export * from "@testing-library/react"
export { default as userEvent } from "@testing-library/user-event"

export { customRender as render }
