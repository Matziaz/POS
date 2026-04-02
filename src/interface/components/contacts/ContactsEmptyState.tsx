import React from "react"

export const ContactsEmptyState: React.FC = () => (
  <div className="mt-6 rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
    No hay contactos que coincidan con tu busqueda.
  </div>
)
