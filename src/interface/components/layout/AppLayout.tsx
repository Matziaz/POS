import React, { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { Menu, Moon, Store, Sun, X } from "lucide-react"
import { cn } from "@interface/lib/utils"
import { APP_NAME } from "@shared/constants"
import { sidebarMenuItems } from "./SideBarData"

type ThemeMode = "light" | "dark"

const THEME_STORAGE_KEY = "pos-theme"

function resolveInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

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
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())

  useEffect(() => {
    const root = window.document.documentElement
    const isDark = theme === "dark"

    root.classList.toggle("dark", isDark)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-3 md:px-4">
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              aria-label={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
              title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <span className="inline-flex items-center gap-2 font-semibold md:font-bold">
              <Store className="h-5 w-5" />
              {APP_NAME}
            </span>
          </div>

          <button
            type="button"
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="relative md:flex md:min-h-[calc(100vh-3.5rem)]">
        {/* Backdrop (mobile) */}
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Side nav */}
        <aside
          className={cn(
            "fixed bottom-0 left-0 top-14 z-40 border-r bg-card transition-all duration-200 md:static md:top-auto md:h-[calc(100vh-3.5rem)] md:translate-x-0",
            isSidebarOpen ? "translate-x-0 w-64 md:w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"
          )}
        >
          <div className="h-full flex flex-col p-3">
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
    </div>
  )
}
