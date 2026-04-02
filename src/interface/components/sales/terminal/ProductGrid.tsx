import React from "react"
import type { ProductProps } from "@core/entities"
import { ProductCard } from "./ProductCard"

interface ProductGridProps {
  products: ProductProps[]
  ticketSkus: Set<string>
  onAddProduct: (product: ProductProps) => void
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  ticketSkus,
  onAddProduct,
}) => {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        No hay productos para los filtros seleccionados.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          inTicket={ticketSkus.has(product.sku)}
          onAdd={onAddProduct}
        />
      ))}
    </div>
  )
}
