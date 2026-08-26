import {
  IconChecklist,
  IconLogout,
  IconMenu2,
  IconMessageCircle,
  IconSettings,
  IconSquareCheck,
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

const navClassName = ({ isActive }: { isActive: boolean }) =>
  cx(s.navLink, isActive && s.navLinkActive)

function PrimaryNavigation({
  chatUnreadCount = 0,
  isOwner = false,
}: Pick<AppShellProps, "chatUnreadCount" | "isOwner">) {
  return (
    <nav aria-label="Primary navigation" className={s.navigation}>
      <NavLink className={navClassName} end to="/">
        <IconChecklist aria-hidden="true" />
        <span>Todos</span>
      </NavLink>
      <NavLink className={navClassName} to={isOwner ? "/owner/chats" : "/chat"}>
        <IconMessageCircle aria-hidden="true" />
        <span>{isOwner ? "Chat dashboard" : "Chat with founder"}</span>
        {chatUnreadCount > 0 ? <Badge>{chatUnreadCount}</Badge> : null}
      </NavLink>
    </nav>
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
        <NavLink aria-label="Todo home" className={s.brand} to="/">
          <IconSquareCheck aria-hidden="true" className={s.brandMark} />
          <span className={s.brandName}>Todo</span>
        </NavLink>
        <div className={s.desktopNavigation}>
          <PrimaryNavigation
            chatUnreadCount={chatUnreadCount}
            isOwner={isOwner}
          />
        </div>
        <div className={s.account}>
          <span className={s.accountEmail} title={userEmail}>
            {userEmail}
          </span>
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
          <summary aria-label="Open navigation menu">
            <IconMenu2 aria-hidden="true" />
          </summary>
          <div className={s.mobileAccountMenu}>
            <span className={s.mobileAccountEmail} title={userEmail}>
              {userEmail}
            </span>
            <PrimaryNavigation
              chatUnreadCount={chatUnreadCount}
              isOwner={isOwner}
            />
            <div className={s.mobileMenuSeparator} />
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
          <span>Your account can claim the owner chat seat.</span>
          <NavLink to="/owner/claim">Set up owner access</NavLink>
        </div>
      ) : null}
      <main className={s.main} id="main-content">
        {children}
      </main>
    </div>
  )
}

export { AppShell }
