import React, { useMemo, useState } from "react"
import {
  Bell,
  Briefcase,
  Clock3,
  CreditCard,
  IdCard,
  MessageSquare,
  Moon,
  MoreVertical,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react"
import { cn } from "@interface/lib/utils"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import type { ContactBaseView, ContactView, ProviderContactView, StaffContactView } from "@interface/store/contactStore"

type ContactTab = "all" | ContactView["category"]

const tabs: Array<{ id: ContactTab; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "providers", label: "Proveedores" },
  { id: "staff", label: "Staff" },
]

const statusToneStyles: Record<ContactBaseView["statusTone"], string> = {
  success: "text-emerald-600",
  warning: "text-amber-500",
  danger: "text-red-500",
  neutral: "text-slate-500",
}

const ContactStatus: React.FC<{
  tone: ContactBaseView["statusTone"]
  children: React.ReactNode
}> = ({ tone, children }) => (
  <p className={cn("mt-1 flex items-center gap-2 text-xs font-medium", statusToneStyles[tone])}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </p>
)

const ProviderCard: React.FC<{ contact: ProviderContactView }> = ({ contact }) => (
  <article className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white", contact.avatarColor)}>
          {contact.avatarText}
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.subtitle}</p>
          <ContactStatus tone={contact.statusTone}>{contact.statusText}</ContactStatus>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Mas acciones para ${contact.name}`}
        className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        <Clock3 className="h-4 w-4" />
        {contact.metricLabel}: {contact.metricValue}
      </p>
      <p className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4" />
        Pedidos mensuales: {contact.monthlyOrders}
      </p>
    </div>

    <div className="mt-5 flex gap-2">
      <Button variant="outline" className="flex-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
        <Phone className="mr-2 h-4 w-4" />
        Llamar
      </Button>
      <Button variant="secondary" className="flex-1">
        <MessageSquare className="mr-2 h-4 w-4" />
        Mensaje
      </Button>
    </div>
  </article>
)

const StaffCard: React.FC<{ contact: StaffContactView }> = ({ contact }) => (
  <article className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-lg ring-2 ring-emerald-500/80">
          <span className="text-sm font-semibold text-emerald-700">{contact.avatarText}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.subtitle}</p>
          <ContactStatus tone={contact.statusTone}>{contact.statusText}</ContactStatus>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Mas acciones para ${contact.name}`}
        className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        <IdCard className="h-4 w-4" />
        ID: {contact.employeeId}
      </p>
      <p className="flex items-center gap-2">
        <Clock3 className="h-4 w-4" />
        {contact.schedule}
      </p>
    </div>

    <div className="mt-5 flex gap-2">
      <Button variant="outline" className="flex-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
        <Phone className="mr-2 h-4 w-4" />
        Llamar
      </Button>
      <Button variant="secondary" className="flex-1">
        <MessageSquare className="mr-2 h-4 w-4" />
        Mensaje
      </Button>
    </div>
  </article>
)

interface ContactsDirectoryProps {
  contacts: ContactView[]
  isLoading?: boolean
}

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({ contacts, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<ContactTab>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesTab = activeTab === "all" || contact.category === activeTab
      const matchesSearch =
        term.length === 0 ||
        contact.name.toLowerCase().includes(term) ||
        contact.subtitle.toLowerCase().includes(term)

      return matchesTab && matchesSearch
    })
  }, [activeTab, searchTerm])

  return (
    <section className="rounded-xl border bg-slate-50/70 p-6">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar proveedor (ej. Bimbo)..."
            className="bg-white pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border bg-white p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="bg-white">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-white">
            <Moon className="h-4 w-4" />
          </Button>
          <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
            + Nuevo Contacto
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm text-muted-foreground">
          Cargando contactos...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredContacts.map((contact) =>
            contact.category === "providers" ? (
              <ProviderCard key={contact.id} contact={contact} />
            ) : (
              <StaffCard key={contact.id} contact={contact} />
            )
          )}
        </div>
      )}

      {!isLoading && filteredContacts.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
          No hay contactos que coincidan con tu busqueda.
        </div>
      )}

      <footer className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Briefcase className="h-4 w-4" />
        <UserRound className="h-4 w-4" />
        <CreditCard className="h-4 w-4" />
        Directorio listo para integrarse a datos reales cuando se conecte el modulo de contactos.
      </footer>
    </section>
  )
}
