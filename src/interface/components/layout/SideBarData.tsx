import type { LucideIcon } from "lucide-react"
import { Package, ShoppingCart } from "lucide-react"

export interface SidebarMenuItem {
	to: string
	label: string
	icon: LucideIcon
}

export const sidebarMenuItems: SidebarMenuItem[] = [
	{
		to: "/inventario",
		label: "Inventario",
		icon: Package,
	},
	{
		to: "/ventas",
		label: "Ventas",
		icon: ShoppingCart,
	},
]
