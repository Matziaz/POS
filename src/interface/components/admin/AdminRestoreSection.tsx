import React from "react"
import type { ProductProps } from "@core/entities"
import type { AdminDeletedProductType } from "@interface/components/admin/types"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"

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

interface AdminRestoreSectionProps {
  restoreTarget: "products" | "productTypes"
  onRestoreTargetChange: (target: "products" | "productTypes") => void
  search: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  isLoading: boolean
  products: ProductProps[]
  deletedProductTypes: AdminDeletedProductType[]
  onRestoreClick: (product: ProductProps) => void
  onRestoreProductTypeClick: (productType: AdminDeletedProductType) => void
}

export const AdminRestoreSection: React.FC<AdminRestoreSectionProps> = ({
  restoreTarget,
  onRestoreTargetChange,
  search,
  onSearchChange,
  onRefresh,
  isLoading,
  products,
  deletedProductTypes,
  onRestoreClick,
  onRestoreProductTypeClick,
}) => (
  <>
    <div className="mb-4 flex items-center gap-2">
      <Button
        type="button"
        variant={restoreTarget === "products" ? "default" : "outline"}
        onClick={() => onRestoreTargetChange("products")}
      >
        Productos
      </Button>
      <Button
        type="button"
        variant={restoreTarget === "productTypes" ? "default" : "outline"}
        onClick={() => onRestoreTargetChange("productTypes")}
      >
        Tipos de producto
      </Button>
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={
          restoreTarget === "products"
            ? "Buscar por nombre o SKU"
            : "Buscar tipo de producto por nombre"
        }
        className="max-w-md"
      />
      <Button variant="outline" onClick={onRefresh}>
        Actualizar
      </Button>
    </div>

    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {restoreTarget === "products" && <TableHead>SKU</TableHead>}
            <TableHead>{restoreTarget === "products" ? "Nombre" : "Tipo"}</TableHead>
            {restoreTarget === "products" && <TableHead>Stock previo</TableHead>}
            <TableHead>Eliminado el</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={restoreTarget === "products" ? 5 : 3}
                className="text-center text-muted-foreground py-8"
              >
                {restoreTarget === "products"
                  ? "Cargando productos eliminados..."
                  : "Cargando tipos de producto eliminados..."}
              </TableCell>
            </TableRow>
          ) : restoreTarget === "products" ? (
            products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay productos eliminados para restaurar.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{formatDate(product.deletedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => onRestoreClick(product)}>
                      Restaurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )
          ) : deletedProductTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No hay tipos de producto eliminados para restaurar.
              </TableCell>
            </TableRow>
          ) : (
            deletedProductTypes.map((productType) => (
              <TableRow key={productType.id}>
                <TableCell className="font-medium">{productType.name}</TableCell>
                <TableCell>{formatDate(productType.deletedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => onRestoreProductTypeClick(productType)}>
                    Restaurar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </>
)
