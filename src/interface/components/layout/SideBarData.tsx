import type { LucideIcon } from "lucide-react"
import { BarChart3, Package, ScanLine, ShoppingCart, Contact, ArchiveRestore } from "lucide-react"

export interface SidebarMenuItem {
	to: string
	label: string
	icon: LucideIcon
	end?: boolean
}

export const sidebarMenuItems: SidebarMenuItem[] = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: BarChart3,
	},
	{
		to: "/inventario",
		label: "Inventario",
		icon: Package,
	},
	{
		to: "/inventario/restaurar",
		label: "Restaurar",
		icon: ArchiveRestore,
	},
	{
		to: "/ventas/terminal",
		label: "Terminal",
		icon: ScanLine,
	},
	{
		to: "/ventas",
		label: "Historial",
		icon: ShoppingCart,
		end: true,
	},
	{
		to: "/contactos",
		label: "Contactos",
		icon: Contact,
	},
]
