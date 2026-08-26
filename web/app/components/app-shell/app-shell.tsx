import {
  IconBooks,
  IconBrain,
  IconChartBar,
  IconHelpCircle,
  IconHome2,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import { Form, NavLink } from "react-router"

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
  canClaimOwner = false,
  chatUnreadCount = 0,
  children,
  isOwner = false,
  userEmail,
}: AppShellProps) {
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
        <div className={s.account}>
          <span className={s.accountEmail} title={userEmail}>
            {userEmail}
          </span>
          <SupportLink chatUnreadCount={chatUnreadCount} isOwner={isOwner} />
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
            <SupportLink chatUnreadCount={chatUnreadCount} isOwner={isOwner} />
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
      {canClaimOwner ? (
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
