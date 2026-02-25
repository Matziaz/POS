import React from "react"
import type { ProductProps } from "@core/entities"
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

interface ProductDeleteDialogProps {
  open: boolean
  product: ProductProps | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export const ProductDeleteDialog: React.FC<ProductDeleteDialogProps> = ({
  open,
  product,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // El error se maneja en el store/hook
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
          <AlertDialogDescription>
            {product ? (
              <>
                ¿Estás seguro de que deseas eliminar{" "}
                <span className="font-semibold text-foreground">
                  {product.name}
                </span>{" "}
                (SKU: <span className="font-mono">{product.sku}</span>)?
                <br />
                <br />
                Esta acción no se puede deshacer.
              </>
            ) : (
              "¿Estás seguro de que deseas eliminar este producto?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
