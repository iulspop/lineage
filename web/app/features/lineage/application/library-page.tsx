import {
  IconArrowRight,
  IconBooks,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"
import { Form, Link } from "react-router"

import * as s from "./library-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

export type LibraryPageProps = {
  corpora: Array<{ corpusId: string; dueCount: number; promptCount: number }>
  query: string
  userEmail: string
}

function corpusName(corpusId: string) {
  return corpusId.replaceAll(/[-_]+/g, " ")
}

export function LibraryPage({ corpora, query, userEmail }: LibraryPageProps) {
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          actions={
            <Link className={s.primaryAction} to="/create">
              <IconPlus aria-hidden="true" />
              Create
            </Link>
          }
          description="Browse durable corpora and the memories they contain."
          eyebrow="Library"
          title="Your knowledge, organized"
        />

        <Form className={s.search} method="get" role="search">
          <IconSearch aria-hidden="true" />
          <input
            aria-label="Search library"
            defaultValue={query}
            name="q"
            placeholder="Search corpora"
            type="search"
          />
        </Form>

        {corpora.length === 0 ? (
          <section className={s.empty}>
            <IconBooks aria-hidden="true" />
            <h2>{query ? "No matching corpora" : "Your library is empty"}</h2>
            <p>
              {query
                ? "Try a different search term."
                : "Create or import your first corpus to begin building durable memory."}
            </p>
            {!query && (
              <Link className={s.primaryAction} to="/create/archive">
                Import a corpus
              </Link>
            )}
          </section>
        ) : (
          <section aria-label="Corpora" className={s.grid}>
            {corpora.map((corpus) => (
              <Link
                className={s.card}
                key={corpus.corpusId}
                to={`/library/${encodeURIComponent(corpus.corpusId)}`}
              >
                <div className={s.cardTopline}>
                  <span>{corpus.dueCount} due</span>
                  <IconArrowRight aria-hidden="true" />
                </div>
                <h2>{corpusName(corpus.corpusId)}</h2>
                <p>{corpus.promptCount} active memories</p>
                <code>{corpus.corpusId}</code>
              </Link>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  )
}
