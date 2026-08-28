import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, test } from "vitest"

import {
  formatDate,
  formatDateTime,
  formatTime,
  TimeZoneProvider,
  useTimeZone,
} from "./time-zone"

describe("time-zone formatting", () => {
  const instant = "2026-08-27T14:30:00.000Z"

  test("formats the same instant in the client-hinted time zone", () => {
    expect(formatDateTime(instant, "America/New_York")).toContain("10:30 AM")
    expect(formatTime(instant, "America/Los_Angeles")).toEqual("7:30 AM")
  })

  test("renders calendar dates in the requested zone", () => {
    expect(
      formatDate("2026-08-27T01:00:00.000Z", "America/Los_Angeles"),
    ).toContain("Aug 26, 2026")
  })

  test("provides the server-resolved time zone during SSR", () => {
    function Probe() {
      return createElement("span", null, formatTime(instant, useTimeZone()))
    }

    const html = renderToString(
      createElement(
        TimeZoneProvider,
        { value: "America/New_York" },
        createElement(Probe),
      ),
    )

    expect(html).toContain("10:30 AM")
  })
})
