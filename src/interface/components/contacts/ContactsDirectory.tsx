import React, { useMemo, useState } from "react"
import { Briefcase, CreditCard, UserRound } from "lucide-react"
import { ContactsEmptyState } from "./ContactsEmptyState"
import { ContactsFilters, type ContactTab } from "./ContactsFilters"
import { ProviderContactCard } from "./ProviderContactCard"
import { StaffContactCard } from "./StaffContactCard"
import type { ContactView } from "@interface/store/contactStore"

interface ContactsDirectoryProps {
  contacts: ContactView[]
  isLoading?: boolean
  onCreate: () => void
  onEdit: (contact: ContactView) => void
  onDelete: (contact: ContactView) => void
}

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  contacts,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
}) => {
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
  }, [contacts, activeTab, searchTerm])

  return (
    <section className="rounded-xl border bg-card p-6 text-card-foreground">
      <ContactsFilters
        activeTab={activeTab}
        searchTerm={searchTerm}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
        onCreate={onCreate}
      />

      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando contactos...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredContacts.map((contact) =>
            contact.category === "providers" ? (
              <ProviderContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => onEdit(contact)}
                onDelete={() => onDelete(contact)}
              />
            ) : (
              <StaffContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => onEdit(contact)}
                onDelete={() => onDelete(contact)}
              />
            )
          )}
        </div>
      )}

      {!isLoading && filteredContacts.length === 0 && <ContactsEmptyState />}

      <footer className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Briefcase className="h-4 w-4" />
        <UserRound className="h-4 w-4" />
        <CreditCard className="h-4 w-4" />
        Directorio de proveedores y usuarios.
      </footer>
    </section>
  )
}
