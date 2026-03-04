import React, { useState, useEffect, useCallback } from "react"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { Badge } from "@interface/components/ui/badge"

// --- Types ---

export interface SaleLine {
  productSku: string
  productName: string
  price: number
  stock: number
  qty: number
}

interface SaleFormProps {
  open: boolean
  products: ProductProps[]
  onClose: () => void
  onSubmit: (lines: { productSku: string; qty: number }[]) => Promise<void>
}

// --- Helpers ---

function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(DECIMAL_PLACES)}`
}

// --- Component ---

export const SaleForm: React.FC<SaleFormProps> = ({
  open,
  products,
  onClose,
  onSubmit,
}) => {
  const [lines, setLines] = useState<SaleLine[]>([])
  const [search, setSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLines([])
      setSearch("")
      setIsSaving(false)
      setServerError(null)
    }
  }, [open])

  // Productos disponibles (con stock > 0 y que no estén ya en la lista)
  const availableProducts = products.filter(
    (p) =>
      p.stock > 0 &&
      !lines.some((l) => l.productSku === p.sku)
  )

  // Filtrar por búsqueda
  const filteredProducts = search.trim()
    ? availableProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : availableProducts

  // --- Handlers ---

  const addProduct = useCallback((product: ProductProps) => {
    setLines((prev) => [
      ...prev,
      {
        productSku: product.sku,
        productName: product.name,
        price: product.price,
        stock: product.stock,
        qty: 1,
      },
    ])
    setSearch("")
  }, [])

  const updateQty = useCallback((sku: string, newQty: number) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.productSku !== sku) return line
        const clampedQty = Math.max(1, Math.min(newQty, line.stock))
        return { ...line, qty: clampedQty }
      })
    )
  }, [])

  const removeLine = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.productSku !== sku))
  }, [])

  const total = lines.reduce((acc, l) => acc + l.price * l.qty, 0)
  const totalItems = lines.reduce((acc, l) => acc + l.qty, 0)

  const handleSubmit = async () => {
    if (lines.length === 0) return
    setIsSaving(true)
    setServerError(null)
    try {
      await onSubmit(lines.map((l) => ({ productSku: l.productSku, qty: l.qty })))
      onClose()
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Error al registrar la venta"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nueva Venta
          </DialogTitle>
          <DialogDescription>
            Agrega productos a la venta y confirma el registro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Buscador de productos */}
          <div className="space-y-2">
            <Label htmlFor="product-search">Agregar producto</Label>
            <Input
              id="product-search"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            {/* Dropdown de resultados */}
            {search.trim() && (
              <div className="rounded-md border max-h-40 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-left text-sm transition-colors"
                      onClick={() => addProduct(product)}
                    >
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({product.sku})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                        <span className="font-medium">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Tabla de líneas de venta */}
          {lines.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center w-[160px]">Cantidad</TableHead>
                    <TableHead className="text-right">P. Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.productSku}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{line.productName}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            {line.productSku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(line.productSku, line.qty - 1)}
                            disabled={line.qty <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            className="w-14 h-7 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={line.qty}
                            min={1}
                            max={line.stock}
                            onChange={(e) =>
                              updateQty(line.productSku, parseInt(e.target.value) || 1)
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(line.productSku, line.qty + 1)}
                            disabled={line.qty >= line.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground ml-1">
                            / {line.stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(line.price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(line.price * line.qty)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeLine(line.productSku)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-md">
              <ShoppingCart className="h-10 w-10 mb-3" />
              <p className="text-sm">Busca y agrega productos para iniciar la venta</p>
            </div>
          )}

          {/* Resumen */}
          {lines.length > 0 && (
            <div className="flex items-center justify-between px-2 py-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  en {lines.length} {lines.length === 1 ? "producto" : "productos"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground mr-2">Total:</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          {/* Error del servidor */}
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={lines.length === 0 || isSaving}
          >
            {isSaving ? "Registrando..." : `Cobrar ${formatPrice(total)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
