import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { Menu, X, Store } from "lucide-react"
import { cn } from "@interface/lib/utils"
import { APP_NAME } from "@shared/constants"
import { sidebarMenuItems } from "./SideBarData"

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
  collapsed?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end = false, collapsed = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center" : "gap-2",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )
    }
    title={collapsed ? label : undefined}
  >
    {icon}
    {!collapsed && label}
  </NavLink>
)

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Backdrop (mobile) */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Side nav */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r bg-card transition-all duration-200 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        )}
      >
        <div className="h-full flex flex-col p-3">
          <div className="mb-4 flex items-center justify-between">
            <span className={cn("inline-flex items-center gap-2 font-bold text-lg", !isSidebarOpen && "md:hidden")}>
              <Store className="h-5 w-5" />
              {APP_NAME}
            </span>
            <button
              type="button"
              aria-label={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon

              return (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={<Icon className="h-4 w-4" />}
                  label={item.label}
                  end={item.end}
                  collapsed={!isSidebarOpen}
                />
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
