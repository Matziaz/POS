import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@interface/components/ui/dialog"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { Label } from "@interface/components/ui/label"
import type { CreateContactInput, UpdateContactInput } from "@interface/store/contactStore"

type ContactKind = "providers" | "staff"

interface ContactCreateDialogProps {
  open: boolean
  mode?: "create" | "edit"
  initialData?: UpdateContactInput | null
  onClose: () => void
  onCreate: (input: CreateContactInput) => Promise<void>
  onUpdate?: (input: UpdateContactInput) => Promise<void>
}

export const ContactCreateDialog: React.FC<ContactCreateDialogProps> = ({
  open,
  mode = "create",
  initialData,
  onClose,
  onCreate,
  onUpdate,
}) => {
  const [kind, setKind] = useState<ContactKind>("providers")
  const [name, setName] = useState("")
  const [telephone, setTelephone] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [roleType, setRoleType] = useState<"ADMIN" | "CASHIER">("CASHIER")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && initialData) {
      setKind(initialData.category)

      if (initialData.category === "providers") {
        setName(initialData.name)
        setTelephone(initialData.telephone ?? "")
        setEmail(initialData.email ?? "")
        setUsername("")
        setPassword("")
        setRoleType("CASHIER")
      } else {
        setUsername(initialData.username)
        setRoleType(initialData.roleType)
        setPassword("")
        setName("")
        setTelephone("")
        setEmail("")
      }
    } else if (mode === "create") {
      resetForm()
    }
  }, [open, mode, initialData])

  const canSubmit = useMemo(() => {
    if (kind === "providers") {
      return name.trim().length > 0
    }

    if (mode === "edit") {
      return username.trim().length > 0 && (password.trim().length === 0 || password.trim().length >= 4)
    }

    return username.trim().length > 0 && password.trim().length >= 4
  }, [kind, name, username, password, mode])

  const resetForm = () => {
    setKind("providers")
    setName("")
    setTelephone("")
    setEmail("")
    setUsername("")
    setPassword("")
    setRoleType("CASHIER")
    setSubmitError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (mode === "edit" && initialData) {
        if (!onUpdate) {
          throw new Error("No se encontro la operacion para editar")
        }

        if (initialData.category === "providers") {
          await onUpdate({
            category: "providers",
            id: initialData.id,
            name: name.trim(),
            telephone: telephone.trim() || undefined,
            email: email.trim() || undefined,
          })
        } else {
          await onUpdate({
            category: "staff",
            id: initialData.id,
            username: username.trim(),
            password: password.trim() || undefined,
            roleType,
          })
        }
      } else if (kind === "providers") {
        await onCreate({
          category: "providers",
          name: name.trim(),
          telephone: telephone.trim() || undefined,
          email: email.trim() || undefined,
        })
      } else {
        await onCreate({
          category: "staff",
          username: username.trim(),
          password,
          roleType,
        })
      }

      handleClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? "No se pudo actualizar el contacto"
            : "No se pudo crear el contacto"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Actualiza la informacion de un proveedor o integrante del staff."
                : "Registra un proveedor o integrante del staff."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-kind">Tipo de contacto</Label>
              <select
                id="contact-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as ContactKind)}
                disabled={isSubmitting || mode === "edit"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="providers">Proveedor</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            {kind === "providers" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="provider-name">Nombre</Label>
                  <Input
                    id="provider-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Distribuidora del Centro"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="provider-telephone">Telefono</Label>
                    <Input
                      id="provider-telephone"
                      value={telephone}
                      onChange={(event) => setTelephone(event.target.value)}
                      placeholder="Ej: 555-123-4567"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <Input
                      id="provider-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ventas@proveedor.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="staff-username">Usuario</Label>
                  <Input
                    id="staff-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Ej: cajero2"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="staff-password">Password</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={mode === "edit" ? "Dejar vacio para mantener password" : "Minimo 4 caracteres"}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="staff-role">Rol</Label>
                    <select
                      id="staff-role"
                      value={roleType}
                      onChange={(event) => setRoleType(event.target.value as "ADMIN" | "CASHIER")}
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="CASHIER">Cajero</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {submitError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting
                ? mode === "edit"
                  ? "Actualizando..."
                  : "Guardando..."
                : mode === "edit"
                  ? "Guardar cambios"
                  : "Guardar contacto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
