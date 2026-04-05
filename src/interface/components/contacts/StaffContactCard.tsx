import React from "react"
import { Clock3, IdCard, Pencil, Trash2 } from "lucide-react"
import type { StaffContactView } from "@interface/store/contactStore"
import { ContactStatus } from "./ContactStatus"

interface StaffContactCardProps {
  contact: StaffContactView
  onEdit: (contact: StaffContactView) => void
  onDelete: (contact: StaffContactView) => void
}

export const StaffContactCard: React.FC<StaffContactCardProps> = ({ contact, onEdit, onDelete }) => (
  <article className="relative rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start gap-3 pr-20">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg ring-1 ring-border">
          <span className="text-sm font-semibold text-accent-foreground">{contact.avatarText}</span>
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
        <IdCard className="h-4 w-4" />
        ID: {contact.employeeId}
      </p>
      <p className="flex items-center gap-2">
        <Clock3 className="h-4 w-4" />
        {contact.schedule}
      </p>
    </div>
  </article>
)
