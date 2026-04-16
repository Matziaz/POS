import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { useProducts } from "@interface/hooks/useProducts"
import { useSales } from "@interface/hooks/useSales"
import type { RegisterSalePaymentInput } from "@interface/store/salesStore"
import { useSaleSessionStore } from "@interface/store/saleSessionStore"
import { DEFAULT_USER_ID } from "@shared/constants/constants"
import {
  CategoryTabs,
  CheckoutModal,
  ProductGrid,
  SearchBar,
  TicketSummary,
  type PaymentMethod,
} from "@interface/components/sales/terminal"

function normalizeText(value: string): string {
  return value.toLowerCase().trim()
}

interface ProductTypeOption {
  id: string
  name: string
}

interface OpenCashRegisterView {
  id: string
  openingAmount: number
  status: string
  openedAt: string
  openedByUserId: string
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
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([])
  const [productTypeError, setProductTypeError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [total, setTotal] = useState(0)
  const [cashRegister, setCashRegister] = useState<OpenCashRegisterView | null>(null)
  const [isCheckingCashRegister, setIsCheckingCashRegister] = useState(true)
  const [openingAmountInput, setOpeningAmountInput] = useState("0")
  const [isOpeningCashRegister, setIsOpeningCashRegister] = useState(false)

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

  useEffect(() => {
    let isMounted = true

    const loadOpenCashRegister = async () => {
      try {
        const opened = await window.electronAPI?.cashRegisterGetOpen?.()
        if (!isMounted) return
        setCashRegister(opened ?? null)
      } catch (error) {
        if (!isMounted) return
        setCheckoutError(error instanceof Error ? error.message : "No fue posible validar la caja abierta")
      } finally {
        if (isMounted) setIsCheckingCashRegister(false)
      }
    }

    void loadOpenCashRegister()

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
        { cashRegisterId: cashRegister.id }
      )

      setShowCheckoutModal(false)
      clearSession()
      await refetchProducts()
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No fue posible registrar la venta")
    }
  }

  const handleOpenCashRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const openingAmount = Number(openingAmountInput)
    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      setCheckoutError("Ingresa un monto inicial valido")
      return
    }

    try {
      setIsOpeningCashRegister(true)
      setCheckoutError(null)

      const opened = await window.electronAPI?.cashRegisterOpen({
        openingAmount,
        openedByUserId: DEFAULT_USER_ID,
      })

      if (!opened) {
        throw new Error("No se pudo abrir la caja")
      }

      setCashRegister(opened)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No fue posible abrir la caja")
    } finally {
      setIsOpeningCashRegister(false)
    }
  }

  const handleClearError = () => {
    setCheckoutError(null)
    setProductTypeError(null)
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

      {(productsError || salesError || checkoutError || productTypeError) && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{checkoutError ?? salesError ?? productsError ?? productTypeError}</span>
            <Button variant="ghost" size="sm" onClick={handleClearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {isCheckingCashRegister ? (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Verificando estado de caja...
        </div>
      ) : !cashRegister ? (
        <section className="mx-auto w-full max-w-xl rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Apertura de caja requerida</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Para registrar ventas primero debes abrir una caja.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleOpenCashRegister}>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Monto inicial</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={openingAmountInput}
                onChange={(event) => setOpeningAmountInput(event.target.value)}
                placeholder="0.00"
              />
            </label>

            <Button type="submit" disabled={isOpeningCashRegister}>
              {isOpeningCashRegister ? "Abriendo caja..." : "Abrir caja"}
            </Button>
          </form>
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
