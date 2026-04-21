import React, { useMemo, useState } from "react"
import { CreditCard, Pencil, Plus } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@interface/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import type { AdminPaymentMethod } from "@interface/components/admin/types"

interface AdminPaymentMethodsSectionProps {
  paymentMethods: AdminPaymentMethod[]
  onCreatePaymentMethod: (data: { method: string; isCash: number; displayOrder: number | null }) => Promise<void>
  onUpdatePaymentMethod: (id: string, data: { method: string; displayOrder: number | null }) => Promise<void>
  onTogglePaymentMethod: (id: string) => Promise<void>
}

export const AdminPaymentMethodsSection: React.FC<AdminPaymentMethodsSectionProps> = ({
  paymentMethods,
  onCreatePaymentMethod,
  onUpdatePaymentMethod,
  onTogglePaymentMethod,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [methodDraft, setMethodDraft] = useState("")
  const [isCashDraft, setIsCashDraft] = useState<0 | 1>(0)
  const [orderDraft, setOrderDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toggleTarget, setToggleTarget] = useState<AdminPaymentMethod | null>(null)

  const activeCount = useMemo(
    () => paymentMethods.filter((m) => m.isActive === 1).length,
    [paymentMethods]
  )

  const sorted = useMemo(
    () =>
      [...paymentMethods].sort((a, b) => {
        const ao = a.displayOrder ?? 999
        const bo = b.displayOrder ?? 999
        return ao !== bo ? ao - bo : a.method.localeCompare(b.method)
      }),
    [paymentMethods]
  )

  const canSubmit = methodDraft.trim().length > 0

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

  const openCreateDialog = () => {
    setSubmitError(null)
    setDialogMode("create")
    setEditingId(null)
    setMethodDraft("")
    setIsCashDraft(0)
    setOrderDraft("")
    setDialogOpen(true)
  }

  const openEditDialog = (m: AdminPaymentMethod) => {
    setSubmitError(null)
    setDialogMode("edit")
    setEditingId(m.id)
    setMethodDraft(m.method)
    setOrderDraft(m.displayOrder !== null ? String(m.displayOrder) : "")
    setDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const name = methodDraft.trim()
    if (!name) return

    const displayOrder = orderDraft.trim() !== "" ? Number(orderDraft.trim()) : null

    await runAction(async () => {
      if (dialogMode === "create") {
        await onCreatePaymentMethod({ method: name, isCash: isCashDraft, displayOrder })
      } else {
        if (!editingId) throw new Error("No se encontro el metodo a editar")
        await onUpdatePaymentMethod(editingId, { method: name, displayOrder })
      }
      setDialogOpen(false)
      setMethodDraft("")
      setEditingId(null)
    })
  }

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return
    await runAction(async () => {
      await onTogglePaymentMethod(toggleTarget.id)
      setToggleTarget(null)
    })
  }

  const isDeactivatingLast = toggleTarget?.isActive === 1 && activeCount === 1

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Métodos activos</p>
        <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
        <p className="mt-1 text-xs text-muted-foreground">de {paymentMethods.length} registrados</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Métodos de pago
          </h3>
          <Badge variant="outline">{paymentMethods.length} registros</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Activa o desactiva métodos para controlar cuáles aparecen en el checkout.
        </p>

        <div className="mt-4 flex justify-end">
          <Button onClick={openCreateDialog} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo método
          </Button>
        </div>

        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Sin métodos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className="font-medium">{m.method}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {m.isCash === 1 ? "Efectivo" : "No efectivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {m.displayOrder ?? "—"}
                    </TableCell>
                    <TableCell>
                      {m.isActive === 1 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(m)}
                          disabled={isSubmitting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant={m.isActive === 1 ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => setToggleTarget(m)}
                          disabled={isSubmitting}
                        >
                          {m.isActive === 1 ? "Desactivar" : "Activar"}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => !isSubmitting && setDialogOpen(isOpen)}
      >
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" ? "Nuevo método de pago" : "Editar método de pago"}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === "create"
                  ? "Agrega un nuevo método al checkout."
                  : "Actualiza el nombre u orden del método."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="method-name">Nombre del método</Label>
                <Input
                  id="method-name"
                  value={methodDraft}
                  onChange={(e) => setMethodDraft(e.target.value)}
                  placeholder="Ej: transferencia"
                  disabled={isSubmitting}
                />
              </div>

              {dialogMode === "create" && (
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={isCashDraft === 0 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCashDraft(0)}
                      disabled={isSubmitting}
                    >
                      No efectivo
                    </Button>
                    <Button
                      type="button"
                      variant={isCashDraft === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCashDraft(1)}
                      disabled={isSubmitting}
                    >
                      Efectivo
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="method-order">Orden de visualización (opcional)</Label>
                <Input
                  id="method-order"
                  type="number"
                  min={1}
                  value={orderDraft}
                  onChange={(e) => setOrderDraft(e.target.value)}
                  placeholder="Ej: 1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {submitError && (
              <p className="mt-3 text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting
                  ? "Guardando..."
                  : dialogMode === "create"
                    ? "Crear método"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(isOpen) => !isOpen && setToggleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isActive === 1 ? "Desactivar método" : "Activar método"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isActive === 1
                ? isDeactivatingLast
                  ? `Estás por desactivar "${toggleTarget?.method}". Este es el único método activo — el checkout quedará sin opciones de pago disponibles.`
                  : `El método "${toggleTarget?.method}" dejará de aparecer en el checkout.`
                : `El método "${toggleTarget?.method}" volverá a aparecer en el checkout.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { void handleToggleConfirm() }}
              disabled={isSubmitting}
              className={
                toggleTarget?.isActive === 1
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {isSubmitting
                ? "Aplicando..."
                : toggleTarget?.isActive === 1
                  ? "Desactivar"
                  : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
