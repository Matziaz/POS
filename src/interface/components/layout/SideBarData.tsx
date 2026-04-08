import type { LucideIcon } from "lucide-react"
import { BarChart3, Package, ScanLine, ShoppingCart, Contact,  ChartNoAxesCombined, ShieldCheck} from "lucide-react"

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
		to: "/reportes",
		label: "Reportes",
		icon: ChartNoAxesCombined,
	},
	{
		to: "/inventario",
		label: "Inventario",
		icon: Package,
	},
	{
		to: "/admin",
		label: "Admin",
		icon: ShieldCheck,
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
