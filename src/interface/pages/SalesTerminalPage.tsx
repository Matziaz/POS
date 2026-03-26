import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { Button } from "@interface/components/ui/button"
import { useProducts } from "@interface/hooks/useProducts"
import { useSales } from "@interface/hooks/useSales"
import { useSaleSessionStore } from "@interface/store/saleSessionStore"
import {
  CategoryTabs,
  ProductGrid,
  SearchBar,
  TicketSummary,
} from "@interface/components/sales/terminal"

function normalizeText(value: string): string {
  return value.toLowerCase().trim()
}

function inferCategory(product: ProductProps): string {
  const text = normalizeText(`${product.name} ${product.sku}`)

  if (text.includes("leche") || text.includes("queso") || text.includes("yogur") || text.includes("lact")) {
    return "Lacteos"
  }

  if (text.includes("agua") || text.includes("jugo") || text.includes("coca") || text.includes("refresco") || text.includes("cerveza")) {
    return "Bebidas"
  }

  if (text.includes("papas") || text.includes("botana") || text.includes("sabritas") || text.includes("galleta")) {
    return "Botanas"
  }

  if (text.includes("jabon") || text.includes("detergente") || text.includes("limpieza") || text.includes("cloro")) {
    return "Limpieza"
  }

  return "General"
}

export const SalesTerminalPage: React.FC = () => {
  const { products, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useProducts()
  const { registerSale, isLoading: isRegisteringSale, error: salesError, clearError } = useSales()

  const lines = useSaleSessionStore((state) => state.lines)
  const addProduct = useSaleSessionStore((state) => state.addProduct)
  const incrementQty = useSaleSessionStore((state) => state.incrementQty)
  const decrementQty = useSaleSessionStore((state) => state.decrementQty)
  const removeLine = useSaleSessionStore((state) => state.removeLine)
  const clearSession = useSaleSessionStore((state) => state.clear)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todo")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((product) => inferCategory(product)))).sort()
    return ["Todo", ...values]
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = normalizeText(search)

    return products.filter((product) => {
      const categoryMatches =
        selectedCategory === "Todo" || inferCategory(product) === selectedCategory

      if (!categoryMatches) return false
      if (!query) return true

      const searchableText = normalizeText(`${product.name} ${product.sku}`)
      return searchableText.includes(query)
    })
  }, [products, search, selectedCategory])

  const ticketSkus = useMemo(() => new Set(lines.map((line) => line.productSku)), [lines])

  const handleCheckout = async () => {
    if (lines.length === 0) return

    setCheckoutError(null)

    try {
      await registerSale(
        lines.map((line) => ({
          productSku: line.productSku,
          qty: line.qty,
        }))
      )

      clearSession()
      await refetchProducts()
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No fue posible registrar la venta")
    }
  }

  const handleClearError = () => {
    setCheckoutError(null)
    clearError()
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1400px] flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Terminal de venta</h1>
          <p className="text-sm text-muted-foreground">
            Agrega productos al ticket y registra la venta en tiempo real.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/ventas">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Ver historial
          </Link>
        </Button>
      </header>

      {(productsError || salesError || checkoutError) && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{checkoutError ?? salesError ?? productsError}</span>
            <Button variant="ghost" size="sm" onClick={handleClearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="flex min-h-0 flex-col gap-4 rounded-xl border bg-card p-4">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoadingProducts ? (
              <div className="rounded-lg border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
                Cargando productos...
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                ticketSkus={ticketSkus}
                onAddProduct={addProduct}
              />
            )}
          </div>
        </section>

        <TicketSummary
          lines={lines}
          isSubmitting={isRegisteringSale}
          onIncrement={incrementQty}
          onDecrement={decrementQty}
          onRemove={removeLine}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}
