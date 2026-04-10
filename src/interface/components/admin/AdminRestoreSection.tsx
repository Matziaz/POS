import React from "react"
import type { ProductProps } from "@core/entities"
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
  search: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  isLoading: boolean
  products: ProductProps[]
  onRestoreClick: (product: ProductProps) => void
}

export const AdminRestoreSection: React.FC<AdminRestoreSectionProps> = ({
  search,
  onSearchChange,
  onRefresh,
  isLoading,
  products,
  onRestoreClick,
}) => (
  <>
    <div className="mb-4 flex items-center gap-2">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nombre o SKU"
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
          ) : products.length === 0 ? (
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
          )}
        </TableBody>
      </Table>
    </div>
  </>
)
