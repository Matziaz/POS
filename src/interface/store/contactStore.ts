import { create } from "zustand"

export type ContactCategory = "providers" | "staff"

export interface ContactBaseView {
  id: string
  name: string
  subtitle: string
  statusText: string
  statusTone: "success" | "warning" | "danger" | "neutral"
  category: ContactCategory
}

export interface ProviderContactView extends ContactBaseView {
  category: "providers"
  metricLabel: string
  metricValue: string
  monthlyOrders: number
  avatarText: string
  avatarColor: string
}

export interface StaffContactView extends ContactBaseView {
  category: "staff"
  employeeId: string
  schedule: string
  avatarText: string
}

export type ContactView = ProviderContactView | StaffContactView

interface ContactState {
  contacts: ContactView[]
  isLoading: boolean
  error: string | null
  fetchContacts: () => Promise<void>
  clearError: () => void
}

const providerAvatarColors = [
  "bg-red-600",
  "bg-blue-600",
  "bg-cyan-600",
  "bg-amber-500",
  "bg-emerald-600",
]

function initials(input: string): string {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "NA"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function pickProviderColor(id: string): string {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return providerAvatarColors[sum % providerAvatarColors.length]
}

function roleToSubtitle(roleType: string): string {
  const normalized = roleType.trim().toUpperCase()
  if (normalized === "ADMIN") return "Gerente"
  if (normalized === "CASHIER") return "Cajero"
  return roleType
}

function formatCreatedAtLabel(createdAt: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return "Alta: fecha no disponible"
  return `Alta: ${date.toLocaleDateString("es-MX")}`
}

function fallbackContacts(): ContactView[] {
  return [
    {
      id: "provider_default",
      category: "providers",
      name: "Proveedor General",
      subtitle: "Proveedor",
      statusText: "Contacto disponible",
      statusTone: "success",
      metricLabel: "Telefono",
      metricValue: "555-0000",
      monthlyOrders: 0,
      avatarText: "PG",
      avatarColor: "bg-blue-600",
    },
    {
      id: "user_admin_001",
      category: "staff",
      name: "admin",
      subtitle: "Gerente",
      statusText: "Activo",
      statusTone: "success",
      employeeId: "user_admin_001",
      schedule: "Alta: no disponible",
      avatarText: "AD",
    },
  ]
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.electronAPI) {
        set({ contacts: fallbackContacts(), isLoading: false })
        return
      }

      const [providers, users] = await Promise.all([
        window.electronAPI.providerList(),
        window.electronAPI.userList(),
      ])

      const providerContacts: ProviderContactView[] = providers.map((provider) => {
        const contactValue = provider.telephone || provider.email || "Sin dato"
        const contactLabel = provider.telephone
          ? "Telefono"
          : provider.email
            ? "Email"
            : "Contacto"

        return {
          id: provider.id,
          category: "providers",
          name: provider.name,
          subtitle: "Proveedor",
          statusText: provider.telephone || provider.email ? "Contacto disponible" : "Sin contacto",
          statusTone: provider.telephone || provider.email ? "success" : "neutral",
          metricLabel: contactLabel,
          metricValue: contactValue,
          monthlyOrders: provider.productCount,
          avatarText: initials(provider.name),
          avatarColor: pickProviderColor(provider.id),
        }
      })

      const staffContacts: StaffContactView[] = users.map((user) => ({
        id: user.id,
        category: "staff",
        name: user.username,
        subtitle: roleToSubtitle(user.roleType),
        statusText: "Activo",
        statusTone: "success",
        employeeId: user.id,
        schedule: formatCreatedAtLabel(user.createdAt),
        avatarText: initials(user.username),
      }))

      set({ contacts: [...providerContacts, ...staffContacts], isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al cargar contactos",
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))
