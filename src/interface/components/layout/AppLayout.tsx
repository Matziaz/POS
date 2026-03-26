import React from "react"
import { NavLink } from "react-router-dom"
import { Package, ShoppingCart, ScanLine } from "lucide-react"
import { cn } from "@interface/lib/utils"
import { APP_NAME } from "@shared/constants"

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
)

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <span className="font-bold text-lg">{APP_NAME}</span>
          <nav className="flex items-center gap-1">
            <NavItem
              to="/inventario"
              icon={<Package className="h-4 w-4" />}
              label="Inventario"
            />
            <NavItem
              to="/ventas/terminal"
              icon={<ScanLine className="h-4 w-4" />}
              label="Terminal"
            />
            <NavItem
              to="/ventas"
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Historial"
              end
            />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
