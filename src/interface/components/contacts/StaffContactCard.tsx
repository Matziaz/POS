import React from "react"
import { Clock3, IdCard} from "lucide-react"
import type { StaffContactView } from "@interface/store/contactStore"
import { ContactStatus } from "./ContactStatus"

interface StaffContactCardProps {
  contact: StaffContactView
}

export const StaffContactCard: React.FC<StaffContactCardProps> = ({ contact }) => (
  <article className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between">
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
      <button
        type="button"
        aria-label={`Mas acciones para ${contact.name}`}
        className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
      >
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
