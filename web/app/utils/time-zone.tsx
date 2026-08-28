import { createContext, useContext } from "react"

const TimeZoneContext = createContext("UTC")

export const TimeZoneProvider = TimeZoneContext.Provider

export function useTimeZone() {
  return useContext(TimeZoneContext)
}

export function formatDateTime(value: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value))
}

export function formatTime(value: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value))
}

export function formatDate(value: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone,
  }).format(new Date(value))
}
