import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { useProducts } from "@interface/hooks/useProducts"
import { useSales } from "@interface/hooks/useSales"
import { useCashRegister } from "@interface/hooks/useCashRegister"
import type { RegisterSalePaymentInput } from "@interface/store/salesStore"
import { useSaleSessionStore } from "@interface/store/saleSessionStore"
import {
  CategoryTabs,
  CheckoutModal,
  ProductGrid,
  SearchBar,
  TicketSummary,
} from "@interface/components/sales/terminal"

function normalizeText(value: string): string {
  return value.toLowerCase().trim()
}

interface ProductTypeOption {
  id: string
  name: string
}

export const SalesTerminalPage: React.FC = () => {
  const { products, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useProducts()
  const { registerSale, isLoading: isRegisteringSale, error: salesError, clearError } = useSales()
  const {
    cashRegister,
    isLoading: isLoadingCashRegister,
    error: cashRegisterError,
    clearError: clearCashRegisterError,
  } = useCashRegister()

  const lines = useSaleSessionStore((state) => state.lines)
  const addProduct = useSaleSessionStore((state) => state.addProduct)
  const incrementQty = useSaleSessionStore((state) => state.incrementQty)
  const decrementQty = useSaleSessionStore((state) => state.decrementQty)
  const removeLine = useSaleSessionStore((state) => state.removeLine)
  const clearSession = useSaleSessionStore((state) => state.clear)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todo")
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([])
  const [productTypeError, setProductTypeError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadProductTypes = async () => {
      try {
        const rows = await window.electronAPI?.productTypeList?.()
        if (!isMounted || !rows) return

        setProductTypes(rows)
      } catch (error) {
        if (!isMounted) return
        setProductTypeError(error instanceof Error ? error.message : "No fue posible cargar categorias")
      }
    }

    loadProductTypes()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    return ["Todo", ...productTypes.map((productType) => productType.name)]
  }, [productTypes])

  const categoryIdByName = useMemo(() => {
    return new Map(productTypes.map((productType) => [productType.name, productType.id]))
  }, [productTypes])

  const filteredProducts = useMemo(() => {
    const query = normalizeText(search)

    return products.filter((product) => {
      const categoryMatches =
        selectedCategory === "Todo" || product.typeId === categoryIdByName.get(selectedCategory)

      if (!categoryMatches) return false
      if (!query) return true

      const searchableText = normalizeText(`${product.name} ${product.sku}`)
      return searchableText.includes(query)
    })
  }, [products, search, selectedCategory, categoryIdByName])

  const ticketSkus = useMemo(() => new Set(lines.map((line) => line.productSku)), [lines])
  
  const ticketTotal = useMemo(() => {
    return lines.reduce((acc, line) => acc + line.qty * line.price, 0)
  }, [lines])

  const handleCheckout = () => {
    if (lines.length === 0) return

    setCheckoutError(null)
    setTotal(ticketTotal)
    setShowCheckoutModal(true)
  }

  const handleConfirmPayment = async (payments: RegisterSalePaymentInput[]) => {
    try {
      setCheckoutError(null)

      
      await registerSale(
        lines.map((line) => ({
          productSku: line.productSku,
          qty: line.qty,
        })),
        payments,
        { cashRegisterId: cashRegister?.id }
      )

      setShowCheckoutModal(false)
      clearSession()
      await refetchProducts()
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No fue posible registrar la venta")
    }
  }

  const handleClearError = () => {
    setCheckoutError(null)
    setProductTypeError(null)
    clearCashRegisterError()
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

      {(productsError || salesError || checkoutError || productTypeError || cashRegisterError) && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{checkoutError ?? cashRegisterError ?? salesError ?? productsError ?? productTypeError}</span>
            <Button variant="ghost" size="sm" onClick={handleClearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {isLoadingCashRegister ? (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Verificando estado de caja...
        </div>
      ) : !cashRegister ? (
        <section className="mx-auto w-full max-w-xl rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Apertura de caja requerida</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Para registrar ventas, abre la caja desde la pantalla de corte de caja.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/caja/cierre">Ir a Corte Caja</Link>
            </Button>
            <Button variant="outline" onClick={handleClearError}>
              Limpiar mensaje
            </Button>
          </div>
        </section>
      ) : (
      <>
      <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
        Caja abierta: <span className="font-medium text-foreground">{cashRegister.id}</span>
      </div>

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
          onClearAll={clearSession}
          onCheckout={handleCheckout}
        />
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        total={total}
        isSubmitting={isRegisteringSale}
        onClose={() => setShowCheckoutModal(false)}
        onConfirmPayment={handleConfirmPayment}
      />
      </>
      )}
    </div>
  )
}
