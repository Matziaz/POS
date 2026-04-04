import React, { useState } from "react"
import { ContactCreateDialog, ContactsDirectory } from "@interface/components/contacts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@interface/components/ui/alert-dialog"
import { Button } from "@interface/components/ui/button"
import { useContacts } from "@interface/hooks/useContacts"
import type { ContactView, UpdateContactInput } from "@interface/store/contactStore"

export const ContactsPage: React.FC = () => {
  const {
    contacts,
    isLoading,
    error,
    clearError,
    refetch,
    createContact,
    updateContact,
    deleteContact,
  } = useContacts()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactView | null>(null)
  const [deletingContact, setDeletingContact] = useState<ContactView | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateContact = async (...args: Parameters<typeof createContact>) => {
    await createContact(...args)
  }

  const handleEditContact = async (...args: Parameters<typeof updateContact>) => {
    await updateContact(...args)
  }

  const handleConfirmDelete = async () => {
    if (!deletingContact) return

    setIsDeleting(true)
    try {
      await deleteContact({ id: deletingContact.id, category: deletingContact.category })
      setDeletingContact(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const editingInitialData: UpdateContactInput | null = editingContact
    ? editingContact.category === "providers"
      ? {
          category: "providers",
          id: editingContact.id,
          name: editingContact.name,
          telephone: editingContact.metricLabel === "Telefono" ? editingContact.metricValue : "",
          email: editingContact.email ?? "",
        }
      : {
          category: "staff",
          id: editingContact.id,
          username: editingContact.name,
          roleType: editingContact.subtitle === "Gerente" ? "ADMIN" : "CASHIER",
        }
    : null

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
        onEdit={setEditingContact}
        onDelete={setDeletingContact}
      />

      <ContactCreateDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateContact}
      />

      <ContactCreateDialog
        open={Boolean(editingContact)}
        mode="edit"
        initialData={editingInitialData}
        onClose={() => setEditingContact(null)}
        onCreate={handleCreateContact}
        onUpdate={handleEditContact}
      />

      <AlertDialog open={Boolean(deletingContact)} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contacto</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingContact
                ? `Esta accion eliminara a ${deletingContact.name}. Esta accion no se puede deshacer.`
                : "Esta accion no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
