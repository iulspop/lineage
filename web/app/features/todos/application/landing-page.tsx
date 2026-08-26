import { IconArrowRight, IconCheck } from "@tabler/icons-react"
import { Link } from "react-router"

import * as s from "./landing-page.css"
import { cx } from "~/utils/class-name"

const demoTasks = [
  ["Plan the weekly reset", "Today"],
  ["Review project notes", "Next"],
  ["Send the grocery list", "Later"],
] as const

const benefits = [
  [
    "Capture without friction",
    "Add a task now and shape the details when they matter.",
  ],
  [
    "Keep the queue readable",
    "Filter active and completed work without managing a complex system.",
  ],
  ["Talk to the founder", "Get direct help inside the same focused workspace."],
] as const

export function LandingPageComponent() {
  return (
    <main className={s.page}>
      <div className={s.shell}>
        <nav aria-label="Main" className={s.nav}>
          <Link className={s.brand} to="/">
            <span aria-hidden="true" className={s.brandMark} />
            Todo
          </Link>
          <div className={s.navActions}>
            <Link className={s.linkButton.ghost} to="/auth/signin">
              Sign in
            </Link>
            <Link className={s.linkButton.default} to="/auth/signup">
              Start free
            </Link>
          </div>
        </nav>

        <section className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>
              A quieter place for the work in front of you
            </p>
            <h1 className={s.title}>Turn scattered tasks into a clear plan.</h1>
            <p className={s.lead}>
              Capture what needs attention, keep the list focused, and move work
              forward without configuring another productivity system.
            </p>
            <div className={s.ctaRow}>
              <Link
                className={cx(s.linkButton.default, s.largeLinkButton)}
                to="/auth/signup"
              >
                Create your todo list
                <IconArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                className={cx(s.linkButton.ghost, s.largeLinkButton)}
                to="/auth/signin"
              >
                I already have an account
              </Link>
            </div>
            <p className={s.reassurance}>
              Email-first setup. Add a passkey later if you want one.
            </p>
          </div>

          <section aria-label="Todo list preview" className={s.preview}>
            <div aria-hidden="true" className={s.previewRail}>
              <span className={s.previewBrand}>Todo</span>
              <span className={s.previewNavActive}>Todos</span>
              <span className={s.previewNav}>Chat with founder</span>
            </div>
            <div className={s.previewWorkspace}>
              <div className={s.previewHeader}>
                <div>
                  <p className={s.previewTitle}>Todos</p>
                  <p className={s.previewMeta}>
                    Keep track of what happens next.
                  </p>
                </div>
                <span className={s.previewCount}>3 open</span>
              </div>
              <div className={s.capture}>Add a task…</div>
              <div className={s.taskList}>
                {demoTasks.map(([task, status], index) => (
                  <div className={s.task} key={task}>
                    <span className={s.checkbox}>
                      {index === 0 && (
                        <IconCheck aria-hidden="true" size={12} />
                      )}
                    </span>
                    <span className={s.taskText}>{task}</span>
                    <span className={s.taskStatus}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section aria-label="Why use Todo" className={s.sections}>
          {benefits.map(([title, copy]) => (
            <article className={s.section} key={title}>
              <h2 className={s.sectionTitle}>{title}</h2>
              <p className={s.sectionCopy}>{copy}</p>
            </article>
          ))}
        </section>

        <footer className={s.footer}>
          <span>A focused personal workspace.</span>
          <Link className={s.footerLink} to="/auth/signup">
            Create an account
          </Link>
        </footer>
      </div>
    </main>
  )
}
