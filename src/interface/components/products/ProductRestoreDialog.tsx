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
import { Input } from "@interface/components/ui/input"

interface ProductRestoreDialogProps {
  open: boolean
  product: ProductProps | null
  onClose: () => void
  onConfirm: (stock: number) => Promise<void>
}

export const ProductRestoreDialog: React.FC<ProductRestoreDialogProps> = ({
  open,
  product,
  onClose,
  onConfirm,
}) => {
  const [isRestoring, setIsRestoring] = React.useState(false)
  const [stockInput, setStockInput] = React.useState("0")

  React.useEffect(() => {
    if (!open) return
    const nextValue = product ? String(product.stock) : "0"
    setStockInput(nextValue)
  }, [open, product])

  const parsedStock = Number(stockInput)
  const isStockValid = Number.isInteger(parsedStock) && parsedStock >= 0

  const handleConfirm = async () => {
    if (!isStockValid) return

    setIsRestoring(true)
    try {
      await onConfirm(parsedStock)
      onClose()
    } catch {
      // El error se maneja en el store/hook
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurar producto</AlertDialogTitle>
          <AlertDialogDescription>
            {product ? (
              <>
                Vas a restaurar <span className="font-semibold text-foreground">{product.name}</span>{" "}
                (SKU: <span className="font-mono">{product.sku}</span>).
              </>
            ) : (
              "Selecciona un producto para restaurar."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="restore-stock">
            Stock al restaurar
          </label>
          <Input
            id="restore-stock"
            type="number"
            min={0}
            step={1}
            value={stockInput}
            onChange={(event) => setStockInput(event.target.value)}
            disabled={isRestoring}
          />
          {!isStockValid && (
            <p className="text-xs text-destructive">Ingresa un numero entero mayor o igual a 0.</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isRestoring || !isStockValid}>
            {isRestoring ? "Restaurando..." : "Restaurar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
