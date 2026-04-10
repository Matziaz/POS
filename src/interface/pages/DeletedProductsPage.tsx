import React, { useEffect, useMemo, useState } from "react"
import type { ProductProps } from "@core/entities"
import { useProducts } from "@interface/hooks/useProducts"
import { ProductRestoreDialog } from "@interface/components/products"
import { Button } from "@interface/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { Input } from "@interface/components/ui/input"

function formatDate(value: string | null): string {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const DeletedProductsPage: React.FC = () => {
  const {
    deletedProducts,
    isLoading,
    error,
    clearError,
    fetchDeletedProducts,
    restoreProduct,
  } = useProducts()

  const [search, setSearch] = useState("")
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [selected, setSelected] = useState<ProductProps | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  useEffect(() => {
    fetchDeletedProducts()
    // Solo al montar la vista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return deletedProducts
    return deletedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
    )
  }, [deletedProducts, search])

  const handleOpenRestore = (product: ProductProps) => {
    setSelected(product)
    setRestoreOpen(true)
  }

  const handleCloseRestore = () => {
    setSelected(null)
    setRestoreOpen(false)
  }

  const handleRestore = async (stock: number) => {
    if (!selected) return

    try {
      await restoreProduct(selected.id, stock)
      setNotification({
        type: "success",
        message: `"${selected.name}" restaurado correctamente.`,
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "No se pudo restaurar el producto",
      })
      setTimeout(() => setNotification(null), 4000)
      throw err
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Productos Eliminados</h1>
        <p className="text-muted-foreground mt-1">
          Restaura productos y define el stock con el que regresaran al inventario.
        </p>
      </div>

      {notification && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {notification.message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o SKU"
          className="max-w-md"
        />
        <Button variant="outline" onClick={() => void fetchDeletedProducts()}>
          Actualizar
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Stock previo</TableHead>
              <TableHead>Eliminado el</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Cargando productos eliminados...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay productos eliminados para restaurar.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{formatDate(product.deletedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleOpenRestore(product)}>
                      Restaurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductRestoreDialog
        open={restoreOpen}
        product={selected}
        onClose={handleCloseRestore}
        onConfirm={handleRestore}
      />
    </div>
  )
}
