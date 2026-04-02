import React, { useState } from "react"
import { ContactCreateDialog, ContactsDirectory } from "@interface/components/contacts"
import { Button } from "@interface/components/ui/button"
import { useContacts } from "@interface/hooks/useContacts"

export const ContactsPage: React.FC = () => {
  const { contacts, isLoading, error, clearError, refetch, createContact } = useContacts()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleCreateContact = async (...args: Parameters<typeof createContact>) => {
    await createContact(...args)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Directorio de Contactos</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona proveedores y personal de tienda desde un solo lugar.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearError}>
              Cerrar
            </Button>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <ContactsDirectory
        contacts={contacts}
        isLoading={isLoading}
        onCreate={() => setIsCreateOpen(true)}
      />

      <ContactCreateDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateContact}
      />
    </div>
  )
}
