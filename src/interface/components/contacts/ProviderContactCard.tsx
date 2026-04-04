import React from "react"
import { Phone, Mail, Pencil, Trash2 } from "lucide-react"
import type { ProviderContactView } from "@interface/store/contactStore"
import { ContactStatus } from "./ContactStatus"

interface ProviderContactCardProps {
  contact: ProviderContactView
  onEdit: (contact: ProviderContactView) => void
  onDelete: (contact: ProviderContactView) => void
}

export const ProviderContactCard: React.FC<ProviderContactCardProps> = ({ contact, onEdit, onDelete }) => (
  <article className="relative rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start gap-3 pr-20">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {contact.avatarText}
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.subtitle}</p>
          <ContactStatus tone={contact.statusTone}>{contact.statusText}</ContactStatus>
        </div>
      </div>
    </div>
    <div className="absolute right-3 top-3 flex items-center gap-1">
      <button
        type="button"
        aria-label={`Editar ${contact.name}`}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        onClick={() => onEdit(contact)}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${contact.name}`}
        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(contact)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        {contact.metricLabel}: {contact.metricValue}
      </p>
      <p className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        {contact.email || "Sin email"}
      </p>
    </div>
  </article>
)
