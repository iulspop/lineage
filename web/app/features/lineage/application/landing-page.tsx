import {
  IconArrowRight,
  IconBrain,
  IconDatabase,
  IconHistory,
} from "@tabler/icons-react"
import { Link } from "react-router"

import * as s from "./landing-page.css"
import { cx } from "~/utils/class-name"

const benefits = [
  {
    copy: "Keep prompts, revisions, and review history in a corpus you can inspect and carry forward.",
    icon: IconDatabase,
    title: "Own the corpus",
  },
  {
    copy: "Practice from a deterministic queue derived from durable review history.",
    icon: IconBrain,
    title: "Recall deliberately",
  },
  {
    copy: "Preserve what was reviewed and when without tying your knowledge to one scheduler or app.",
    icon: IconHistory,
    title: "Keep the lineage",
  },
] as const

const reviewSteps = [
  ["Challenge", "Recall the value of i³."],
  ["Reveal", "i³ = -i"],
  ["Assess", "Again · Hard · Good · Easy"],
] as const

export function LandingPageComponent() {
  return (
    <main className={s.page}>
      <div className={s.shell}>
        <nav aria-label="Main" className={s.nav}>
          <Link className={s.brand} to="/">
            <IconBrain aria-hidden="true" className={s.brandMark} />
            Lineage
          </Link>
          <div className={s.navActions}>
            <Link className={s.linkButton.ghost} to="/auth/signin">
              Sign in
            </Link>
            <Link className={s.linkButton.default} to="/auth/signup">
              Create account
            </Link>
          </div>
        </nav>

        <section className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>Durable memory, deliberate recall</p>
            <h1 className={s.title}>Your knowledge should outlive the app.</h1>
            <p className={s.lead}>
              Lineage is a spaced-repetition workspace built around portable
              corpora, explicit review history, and prompts that remain yours.
            </p>
            <div className={s.ctaRow}>
              <Link
                className={cx(s.linkButton.default, s.largeLinkButton)}
                to="/auth/signup"
              >
                Start building your corpus
                <IconArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                className={cx(s.linkButton.ghost, s.largeLinkButton)}
                to="/auth/signin"
              >
                Continue reviewing
              </Link>
            </div>
            <p className={s.reassurance}>
              Import a corpus, review offline-ready prompts, and retain the
              history behind every repetition.
            </p>
          </div>

          <section aria-label="Lineage review preview" className={s.preview}>
            <div className={s.previewHeader}>
              <div>
                <p className={s.previewEyebrow}>Powers of i</p>
                <p className={s.previewTitle}>One review, fully traceable</p>
              </div>
              <span className={s.previewCount}>4 prompts</span>
            </div>
            <div className={s.reviewFlow}>
              {reviewSteps.map(([label, content], index) => (
                <article className={s.reviewStep} key={label}>
                  <span className={s.stepNumber}>{index + 1}</span>
                  <div>
                    <p className={s.stepLabel}>{label}</p>
                    <p className={s.stepContent}>{content}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className={s.previewFootnote}>
              Prompt identity, exact revision, and assessment stay attached to
              the durable review record.
            </p>
          </section>
        </section>

        <section aria-label="Why use Lineage" className={s.sections}>
          {benefits.map(({ copy, icon: Icon, title }) => (
            <article className={s.section} key={title}>
              <Icon aria-hidden="true" className={s.sectionIcon} />
              <h2 className={s.sectionTitle}>{title}</h2>
              <p className={s.sectionCopy}>{copy}</p>
            </article>
          ))}
        </section>

        <footer className={s.footer}>
          <span>Portable knowledge. Durable review history.</span>
          <Link className={s.footerLink} to="/auth/signup">
            Create an account
          </Link>
        </footer>
      </div>
    </main>
  )
}
