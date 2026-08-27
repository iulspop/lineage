import {
  IconBooks,
  IconBrain,
  IconChartBar,
  IconHelpCircle,
  IconHome2,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { Form, NavLink, useNavigate, useRouteLoaderData } from "react-router"

import * as s from "./app-shell.css"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { cx } from "~/utils/class-name"

type AppShellProps = {
  canClaimOwner?: boolean
  children: ReactNode
  chatUnreadCount?: number
  isOwner?: boolean
  userEmail: string
}

const navItems = [
  { icon: IconHome2, label: "Today", to: "/today" },
  { icon: IconBooks, label: "Library", to: "/library" },
  { icon: IconPlus, label: "Create", to: "/create" },
  { icon: IconChartBar, label: "Insights", to: "/insights" },
] as const

const navClassName = ({ isActive }: { isActive: boolean }) =>
  cx(s.navLink, isActive && s.navLinkActive)

const commands = [
  ...navItems,
  { icon: IconPlus, label: "Create memory", to: "/create/manual" },
  { icon: IconBrain, label: "Generate with AI", to: "/create/ai" },
  { icon: IconSettings, label: "Data portability", to: "/settings/data" },
] as const

function CommandPalette() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])
  const matches = commands.filter(({ label }) =>
    label.toLowerCase().includes(query.toLowerCase()),
  )
  const choose = (to: string) => {
    setOpen(false)
    setQuery("")
    navigate(to)
  }
  return (
    <>
      <button
        aria-label="Open command palette"
        className={s.commandTrigger}
        onClick={() => setOpen(true)}
        type="button"
      >
        <IconSearch aria-hidden="true" />
        <span>Quick actions</span>
        <kbd>⌘K</kbd>
      </button>
      {open ? (
        <div
          aria-label="Quick actions"
          aria-modal="true"
          className={s.commandBackdrop}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false)
          }}
          role="dialog"
        >
          <div className={s.commandPalette}>
            <label>
              <IconSearch aria-hidden="true" />
              <span className={s.visuallyHidden}>Search actions</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Go to a page or start an action…"
                ref={inputRef}
                value={query}
              />
            </label>
            <div className={s.commandList}>
              {matches.map(({ icon: Icon, label, to }) => (
                <button
                  key={`${label}:${to}`}
                  onClick={() => choose(to)}
                  type="button"
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
              {matches.length === 0 ? <p>No matching actions.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function PrimaryNavigation() {
  return (
    <nav aria-label="Primary navigation" className={s.navigation}>
      {navItems.map(({ icon: Icon, label, to }) => (
        <NavLink className={navClassName} key={to} to={to}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function SupportLink({
  chatUnreadCount,
  isOwner,
}: Pick<AppShellProps, "chatUnreadCount" | "isOwner">) {
  return (
    <NavLink className={s.accountLink} to={isOwner ? "/owner/chats" : "/chat"}>
      <IconHelpCircle aria-hidden="true" />
      <span>{isOwner ? "Support inbox" : "Help & feedback"}</span>
      {chatUnreadCount ? <Badge>{chatUnreadCount}</Badge> : null}
    </NavLink>
  )
}

function AppShell({
  canClaimOwner,
  chatUnreadCount = 0,
  children,
  isOwner,
  userEmail,
}: AppShellProps) {
  const rootData = useRouteLoaderData<{
    ownerAccess?: { canClaimOwner: boolean; isOwner: boolean }
  }>("root")
  const effectiveCanClaimOwner =
    canClaimOwner ?? rootData?.ownerAccess?.canClaimOwner ?? false
  const effectiveIsOwner = isOwner ?? rootData?.ownerAccess?.isOwner ?? false

  return (
    <div className={s.shell}>
      <a className={s.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={s.header}>
        <NavLink aria-label="Lineage home" className={s.brand} to="/today">
          <IconBrain aria-hidden="true" className={s.brandMark} />
          <span className={s.brandName}>Lineage</span>
        </NavLink>
        <div className={s.desktopNavigation}>
          <PrimaryNavigation />
        </div>
        <CommandPalette />
        <div className={s.account}>
          <span className={s.accountEmail} title={userEmail}>
            {userEmail}
          </span>
          <SupportLink
            chatUnreadCount={chatUnreadCount}
            isOwner={effectiveIsOwner}
          />
          <NavLink className={s.accountLink} to="/settings">
            <IconSettings aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
          <Form action="/logout" method="post">
            <Button size="sm" type="submit" variant="ghost">
              <IconLogout aria-hidden="true" />
              Log out
            </Button>
          </Form>
        </div>
        <details className={s.mobileAccount}>
          <summary aria-label="Open account menu">
            <IconMenu2 aria-hidden="true" />
          </summary>
          <div className={s.mobileAccountMenu}>
            <span className={s.mobileAccountEmail} title={userEmail}>
              {userEmail}
            </span>
            <SupportLink
              chatUnreadCount={chatUnreadCount}
              isOwner={effectiveIsOwner}
            />
            <NavLink className={s.accountLink} to="/settings">
              <IconSettings aria-hidden="true" />
              <span>Settings</span>
            </NavLink>
            <Form action="/logout" method="post">
              <Button size="sm" type="submit" variant="ghost">
                <IconLogout aria-hidden="true" />
                Log out
              </Button>
            </Form>
          </div>
        </details>
      </header>
      {effectiveCanClaimOwner ? (
        <div className={s.ownerPrompt}>
          <span>Your account can claim the owner support seat.</span>
          <NavLink to="/owner/claim">Set up owner access</NavLink>
        </div>
      ) : null}
      <main className={s.main} id="main-content">
        {children}
      </main>
      <div className={s.mobileNavigation}>
        <PrimaryNavigation />
      </div>
    </div>
  )
}

export { AppShell }
