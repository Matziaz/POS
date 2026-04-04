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
  email: string | null
  avatarText: string
}

export interface StaffContactView extends ContactBaseView {
  category: "staff"
  employeeId: string
  schedule: string
  avatarText: string
}

export type ContactView = ProviderContactView | StaffContactView

export interface CreateProviderContactInput {
  category: "providers"
  name: string
  telephone?: string
  email?: string
}

export interface CreateStaffContactInput {
  category: "staff"
  username: string
  password: string
  roleType: "ADMIN" | "CASHIER"
}

export type CreateContactInput = CreateProviderContactInput | CreateStaffContactInput

export interface UpdateProviderContactInput {
  category: "providers"
  id: string
  name: string
  telephone?: string
  email?: string
}

export interface UpdateStaffContactInput {
  category: "staff"
  id: string
  username: string
  password?: string
  roleType: "ADMIN" | "CASHIER"
}

export type UpdateContactInput = UpdateProviderContactInput | UpdateStaffContactInput

export interface DeleteContactInput {
  id: string
  category: ContactCategory
}

interface ContactState {
  contacts: ContactView[]
  isLoading: boolean
  error: string | null
  fetchContacts: () => Promise<void>
  createContact: (input: CreateContactInput) => Promise<void>
  updateContact: (input: UpdateContactInput) => Promise<void>
  deleteContact: (input: DeleteContactInput) => Promise<void>
  clearError: () => void
}

interface ProviderRow {
  id: string
  name: string
  telephone: string | null
  email: string | null
  productCount: number
}

interface UserRow {
  id: string
  username: string
  roleType: string
  createdAt: string
}

function initials(input: string): string {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "NA"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
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
      email: "proveedor@general.com",
      avatarText: "PG",
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

export const useContactStore = create<ContactState>((set, get) => ({
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

      const api = window.electronAPI as NonNullable<typeof window.electronAPI> & {
        providerList?: () => Promise<ProviderRow[]>
        userList?: () => Promise<UserRow[]>
      }

      if (!api.providerList || !api.userList) {
        set({ contacts: fallbackContacts(), isLoading: false })
        return
      }

      const [providers, users] = await Promise.all([
        api.providerList(),
        api.userList(),
      ])

      const providerContacts: ProviderContactView[] = providers.map((provider: ProviderRow) => {
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
          email: provider.email,
          avatarText: initials(provider.name),
        }
      })

      const staffContacts: StaffContactView[] = users.map((user: UserRow) => ({
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

  createContact: async (input) => {
    const api = window.electronAPI

    if (!api) {
      throw new Error("La API de escritorio no esta disponible")
    }

    try {
      if (input.category === "providers") {
        if (!api.providerSave) {
          throw new Error("No se encontro la operacion para guardar proveedores")
        }

        await api.providerSave({
          name: input.name,
          telephone: input.telephone?.trim() || null,
          email: input.email?.trim() || null,
        })
      } else {
        if (!api.userSave) {
          throw new Error("No se encontro la operacion para guardar usuarios")
        }

        await api.userSave({
          username: input.username,
          password: input.password,
          roleType: input.roleType,
        })
      }

      await get().fetchContacts()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear contacto"
      set({ error: message })
      throw err
    }
  },

  updateContact: async (input) => {
    const api = window.electronAPI

    if (!api) {
      throw new Error("La API de escritorio no esta disponible")
    }

    try {
      if (input.category === "providers") {
        if (!api.providerUpdate) {
          throw new Error("No se encontro la operacion para actualizar proveedores")
        }

        await api.providerUpdate({
          id: input.id,
          name: input.name,
          telephone: input.telephone?.trim() || null,
          email: input.email?.trim() || null,
        })
      } else {
        if (!api.userUpdate) {
          throw new Error("No se encontro la operacion para actualizar usuarios")
        }

        await api.userUpdate({
          id: input.id,
          username: input.username,
          password: input.password?.trim() || undefined,
          roleType: input.roleType,
        })
      }

      await get().fetchContacts()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar contacto"
      set({ error: message })
      throw err
    }
  },

  deleteContact: async (input) => {
    const api = window.electronAPI

    if (!api) {
      throw new Error("La API de escritorio no esta disponible")
    }

    try {
      if (input.category === "providers") {
        if (!api.providerDelete) {
          throw new Error("No se encontro la operacion para eliminar proveedores")
        }

        await api.providerDelete(input.id)
      } else {
        if (!api.userDelete) {
          throw new Error("No se encontro la operacion para eliminar usuarios")
        }

        await api.userDelete(input.id)
      }

      await get().fetchContacts()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar contacto"
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
