import React, { useMemo, useState } from "react"
import { Pencil, Plus, ShieldCheck, Tag, Trash2, Users } from "lucide-react"
import { Badge } from "@interface/components/ui/badge"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { Label } from "@interface/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@interface/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
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
import type { AdminProductType, AdminRole, AdminUser } from "@interface/components/admin/types"

interface AdminSetupSectionProps {
  productTypes: AdminProductType[]
  roles: AdminRole[]
  users: AdminUser[]
  onCreateProductType: (name: string) => Promise<void>
  onUpdateProductType: (id: string, name: string) => Promise<void>
  onDeleteProductType: (id: string) => Promise<void>
  onCreateRole: (type: string) => Promise<void>
  onUpdateRole: (id: string, type: string) => Promise<void>
  onDeleteRole: (id: string) => Promise<void>
}

export const AdminSetupSection: React.FC<AdminSetupSectionProps> = ({
  productTypes,
  roles,
  users,
  onCreateProductType,
  onUpdateProductType,
  onDeleteProductType,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}) => {
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [typeDialogMode, setTypeDialogMode] = useState<"create" | "edit">("create")
  const [roleDialogMode, setRoleDialogMode] = useState<"create" | "edit">("create")
  const [editingProductTypeId, setEditingProductTypeId] = useState<string | null>(null)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [typeDraft, setTypeDraft] = useState("")
  const [roleDraft, setRoleDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<
    | {
        kind: "type" | "role"
        id: string
        label: string
      }
    | null
  >(null)

  const adminCount = users.filter((user) => user.roleType === "ADMIN").length
  const cashierCount = users.filter((user) => user.roleType === "CASHIER").length
  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.type.localeCompare(b.type)),
    [roles]
  )
  const canSubmitType = typeDraft.trim().length > 0
  const canSubmitRole = roleDraft.trim().length > 0

  const runAction = async (action: () => Promise<void>) => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await action()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo completar la accion")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const openTypeCreateDialog = () => {
    setSubmitError(null)
    setTypeDialogMode("create")
    setEditingProductTypeId(null)
    setTypeDraft("")
    setTypeDialogOpen(true)
  }

  const openTypeEditDialog = (type: AdminProductType) => {
    setSubmitError(null)
    setTypeDialogMode("edit")
    setEditingProductTypeId(type.id)
    setTypeDraft(type.name)
    setTypeDialogOpen(true)
  }

  const openRoleCreateDialog = () => {
    setSubmitError(null)
    setRoleDialogMode("create")
    setEditingRoleId(null)
    setRoleDraft("")
    setRoleDialogOpen(true)
  }

  const openRoleEditDialog = (role: AdminRole) => {
    setSubmitError(null)
    setRoleDialogMode("edit")
    setEditingRoleId(role.id)
    setRoleDraft(role.type)
    setRoleDialogOpen(true)
  }

  const handleSubmitType = async (event: React.FormEvent) => {
    event.preventDefault()
    const name = typeDraft.trim()
    if (!name) return

    await runAction(async () => {
      if (typeDialogMode === "create") {
        await onCreateProductType(name)
      } else {
        if (!editingProductTypeId) throw new Error("No se encontro el tipo a editar")
        await onUpdateProductType(editingProductTypeId, name)
      }
      setTypeDialogOpen(false)
      setTypeDraft("")
      setEditingProductTypeId(null)
    })
  }

  const handleSubmitRole = async (event: React.FormEvent) => {
    event.preventDefault()
    const type = roleDraft.trim().toUpperCase()
    if (!type) return

    await runAction(async () => {
      if (roleDialogMode === "create") {
        await onCreateRole(type)
      } else {
        if (!editingRoleId) throw new Error("No se encontro el rol a editar")
        await onUpdateRole(editingRoleId, type)
      }
      setRoleDialogOpen(false)
      setRoleDraft("")
      setEditingRoleId(null)
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    await runAction(async () => {
      if (deleteTarget.kind === "type") {
        await onDeleteProductType(deleteTarget.id)
      } else {
        await onDeleteRole(deleteTarget.id)
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Tipos de producto</p>
        <p className="mt-2 text-2xl font-semibold">{productTypes.length}</p>
        <p className="mt-1 text-xs text-muted-foreground">Categorias disponibles en el catalogo.</p>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Roles</p>
        <p className="mt-2 text-2xl font-semibold">{sortedRoles.length}</p>
        <p className="mt-1 text-xs text-muted-foreground">Perfiles para permisos de usuarios.</p>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </p>
        <p className="mt-2 text-2xl font-semibold">{users.length}</p>
        <p className="mt-1 text-xs text-muted-foreground">{adminCount} admin · {cashierCount} cajeros</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-3 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Gestion de tipos de producto
          </h3>
          <Badge variant="outline">{productTypes.length} registros</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Crea y modifica categorias mediante un formulario emergente.
        </p>

        <div className="mt-4 flex justify-end">
          <Button onClick={openTypeCreateDialog} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo tipo
          </Button>
        </div>

        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                    Sin tipos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                productTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <span className="font-medium">{type.name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTypeEditDialog(type)}
                          disabled={isSubmitting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({ kind: "type", id: type.id, label: type.name })
                          }}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-3 lg:col-span-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Gestion de roles
          </h3>
          <Badge variant="outline">{sortedRoles.length} registros</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Administra perfiles con una experiencia compacta y clara.
        </p>

        <div className="mt-4 flex justify-end">
          <Button onClick={openRoleCreateDialog} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo rol
          </Button>
        </div>

        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                    Sin roles registrados.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className="font-medium">{role.type}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleEditDialog(role)}
                          disabled={isSubmitting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({ kind: "role", id: role.id, label: role.type })
                          }}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {submitError && (
        <div className="md:col-span-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <Dialog open={typeDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setTypeDialogOpen(isOpen)}>
        <DialogContent>
          <form onSubmit={handleSubmitType}>
            <DialogHeader>
              <DialogTitle>
                {typeDialogMode === "create" ? "Nuevo tipo de producto" : "Editar tipo de producto"}
              </DialogTitle>
              <DialogDescription>
                {typeDialogMode === "create"
                  ? "Crea una nueva categoria para el inventario."
                  : "Actualiza el nombre del tipo seleccionado."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="type-draft">Nombre del tipo</Label>
              <Input
                id="type-draft"
                value={typeDraft}
                onChange={(event) => setTypeDraft(event.target.value)}
                placeholder="Ej: BOTANAS"
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTypeDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !canSubmitType}>
                {isSubmitting
                  ? "Guardando..."
                  : typeDialogMode === "create"
                    ? "Crear tipo"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setRoleDialogOpen(isOpen)}>
        <DialogContent>
          <form onSubmit={handleSubmitRole}>
            <DialogHeader>
              <DialogTitle>{roleDialogMode === "create" ? "Nuevo rol" : "Editar rol"}</DialogTitle>
              <DialogDescription>
                {roleDialogMode === "create"
                  ? "Define un nuevo perfil para permisos del sistema."
                  : "Actualiza el nombre del rol seleccionado."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="role-draft">Nombre del rol</Label>
              <Input
                id="role-draft"
                value={roleDraft}
                onChange={(event) => setRoleDraft(event.target.value.toUpperCase())}
                placeholder="Ej: SUPERVISOR"
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !canSubmitRole}>
                {isSubmitting
                  ? "Guardando..."
                  : roleDialogMode === "create"
                    ? "Crear rol"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Se eliminara ${deleteTarget.kind === "type" ? "el tipo" : "el rol"} "${deleteTarget.label}". Esta accion no se puede deshacer.`
                : "Esta accion no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleConfirmDelete()
              }}
              disabled={isSubmitting || !deleteTarget}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
