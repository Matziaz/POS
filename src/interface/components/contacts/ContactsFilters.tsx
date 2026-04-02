import React from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { cn } from "@interface/lib/utils"
import type { ContactView } from "@interface/store/contactStore"

export type ContactTab = "all" | ContactView["category"]

const tabs: Array<{ id: ContactTab; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "providers", label: "Proveedores" },
  { id: "staff", label: "Staff" },
]

interface ContactsFiltersProps {
  activeTab: ContactTab
  searchTerm: string
  onTabChange: (tab: ContactTab) => void
  onSearchChange: (value: string) => void
  onCreate: () => void
}

export const ContactsFilters: React.FC<ContactsFiltersProps> = ({
  activeTab,
  searchTerm,
  onTabChange,
  onSearchChange,
  onCreate,
}) => (
  <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="relative w-full lg:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar contacto (ej. Bimbo, admin)..."
        className="bg-card pl-9"
      />
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-lg border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Contacto
      </Button>
    </div>
  </header>
)
