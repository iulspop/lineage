import { Link } from "react-router"

import type { TodoFilter } from "../domain/todos-domain"
import * as s from "./filter-tabs.css"
import { cx } from "~/utils/class-name"

const filters: TodoFilter[] = ["all", "active", "completed"]

const filterLabels: Record<TodoFilter, string> = {
  active: "Active",
  all: "All",
  completed: "Completed",
}

export function FilterTabsComponent({
  counts,
  currentFilter,
}: {
  counts?: { active: number; completed: number; total: number }
  currentFilter: TodoFilter
}) {
  return (
    <nav aria-label="Filter todos" className={s.nav}>
      {filters.map((filter) => (
        <Link
          aria-current={filter === currentFilter ? "page" : undefined}
          className={cx(s.link, filter === currentFilter && s.activeLink)}
          key={filter}
          to={`/?filter=${filter}`}
        >
          <span>{filterLabels[filter]}</span>
          {counts ? (
            <span aria-hidden="true" className={s.count}>
              {filter === "all"
                ? counts.total
                : filter === "active"
                  ? counts.active
                  : counts.completed}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  )
}
