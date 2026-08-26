const isClassName = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0

const cx = (...values: unknown[]) => values.filter(isClassName).join(" ")

export { cx }
