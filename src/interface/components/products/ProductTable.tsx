import React from "react"
import { Pencil, Trash2, Package } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { DEFAULT_PRODUCT_IMAGE } from "@shared/constants/constants"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { Button } from "@interface/components/ui/button"
import { Badge } from "@interface/components/ui/badge"

interface ProductTableProps {
  products: ProductProps[]
  isLoading: boolean
  typeNameById?: Record<string, string>
  providerNameById?: Record<string, string>
  onEdit: (product: ProductProps) => void
  onDelete: (product: ProductProps) => void
  onCreate?: () => void
}

function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(DECIMAL_PLACES)}`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge variant="destructive">Sin stock</Badge>
  }
  if (stock <= 5) {
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Stock bajo: {stock}</Badge>
  }
  return <Badge variant="secondary">{stock}</Badge>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Package className="h-12 w-12 mb-4" />
      <p className="text-lg font-medium">No hay productos registrados</p>
      <p className="text-sm mt-1">Agrega tu primer producto para comenzar</p>
      {onCreate && (
        <Button className="mt-4" onClick={onCreate}>
          Crear primer producto
        </Button>
      )}
    </div>
  )
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = React.useState(false)

  if (!src || hasError) {
    return <img src={DEFAULT_PRODUCT_IMAGE} className="h-10 w-10 object-cover rounded-md" alt={alt} loading="lazy" />
  }

  return (
    <img
      src={src}
      className="h-10 w-10 object-cover rounded-md"
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  typeNameById = {},
  providerNameById = {},
  onEdit,
  onDelete,
  onCreate,
}) => {
  if (isLoading && products.length === 0) {
    return <LoadingSkeleton />
  }

  if (products.length === 0) {
    return <EmptyState onCreate={onCreate} />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Proveedor</TableHead>
            <TableHead className="hidden xl:table-cell">Fecha de creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-sm hidden sm:table-cell">{product.sku}</TableCell>
              <TableCell>
                <ProductImage src={product.image} alt={product.name} />
              </TableCell>
              <TableCell className="font-medium">
                <p>{product.name}</p>
                <p className="text-xs text-muted-foreground sm:hidden">{product.sku}</p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                {typeNameById[product.typeId] ?? `Tipo ${product.typeId}`}
              </TableCell>
              <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
              <TableCell className="text-center">
                <StockBadge stock={product.stock} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                {providerNameById[product.providerId] ?? product.providerId}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
                {formatDate(product.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    title="Editar producto"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    title="Eliminar producto"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
