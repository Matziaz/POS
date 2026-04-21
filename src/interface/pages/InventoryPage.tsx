import React, { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "@core/constants"
import type { ProductSortField, SortDirection } from "@core/repositories"
import { useProducts } from "@interface/hooks/useProducts"
import {
  ProductTable,
  ProductForm,
  ProductDeleteDialog,
} from "@interface/components/products"
import type { ProductFormData, ProductTypeOption, ProviderOption } from "@interface/components/products/ProductForm"
import { Button } from "@interface/components/ui/button"

export const InventoryPage: React.FC = () => {
  const {
    inventoryProducts,
    inventoryTotal,
    inventoryPage,
    inventoryPageSize,
    inventorySortBy,
    inventorySortDirection,
    isInventoryLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError,
    fetchInventoryProducts,
  } = useProducts({ autoFetch: false })

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductProps | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductProps | null>(null)

  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([
    { id: DEFAULT_PRODUCT_TYPE_ID, name: "General" },
  ])
  const [providers, setProviders] = useState<ProviderOption[]>([
    { id: DEFAULT_PROVIDER_ID, name: "Proveedor general" },
  ])

  useEffect(() => {
    let active = true

    const loadTypes = async () => {
      try {
        const rows = await window.electronAPI?.productTypeList?.()
        if (!active || !rows || rows.length === 0) return
        setProductTypes(rows)
      } catch {
        // Mantener fallback para no bloquear la demo si falla catálogo.
      }
    }

    void loadTypes()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadProviders = async () => {
      try {
        const rows = await window.electronAPI?.providerList?.()
        if (!active || !rows || rows.length === 0) return

        const mappedRows: ProviderOption[] = rows.map((provider) => ({
          id: provider.id,
          name: provider.name,
        }))

        const hasDefault = mappedRows.some((provider) => provider.id === DEFAULT_PROVIDER_ID)
        const fullCatalog = hasDefault
          ? mappedRows
          : [{ id: DEFAULT_PROVIDER_ID, name: "Proveedor general" }, ...mappedRows]

        setProviders(fullCatalog)
      } catch {
        // Mantener fallback para no bloquear la demo si falla catálogo.
      }
    }

    void loadProviders()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    void fetchInventoryProducts()
    // Carga inicial del inventario paginado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const typeNameById = useMemo<Record<string, string>>(() => {
    const entries = productTypes.map((type) => [type.id, type.name])
    return Object.fromEntries(entries)
  }, [productTypes])

  const providerNameById = useMemo<Record<string, string>>(() => {
    const entries = providers.map((provider) => [provider.id, provider.name])
    return Object.fromEntries(entries)
  }, [providers])

  const totalPages = Math.max(1, Math.ceil(inventoryTotal / inventoryPageSize))
  const startItem = inventoryTotal === 0 ? 0 : (inventoryPage - 1) * inventoryPageSize + 1
  const endItem = Math.min(inventoryTotal, inventoryPage * inventoryPageSize)

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const handleEdit = (product: ProductProps) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleDeleteRequest = (product: ProductProps) => {
    setDeletingProduct(product)
    setDeleteOpen(true)
  }

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsMutating(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        showNotification("success", `"${data.name}" actualizado correctamente`)
      } else {
        await addProduct(data)
        showNotification("success", `"${data.name}" creado correctamente`)
      }
    } finally {
      setIsMutating(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    const name = deletingProduct.name
    setIsMutating(true)
    try {
      await deleteProduct(deletingProduct.id)
      showNotification("success", `"${name}" eliminado correctamente`)
    } finally {
      setIsMutating(false)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteClose = () => {
    setDeleteOpen(false)
    setDeletingProduct(null)
  }

  const handleSortChange = async (field: ProductSortField) => {
    const nextDirection: SortDirection = inventorySortBy === field && inventorySortDirection === "asc" ? "desc" : "asc"
    await fetchInventoryProducts(1, inventoryPageSize, field, nextDirection)
  }

  const changePage = async (nextPage: number) => {
    await fetchInventoryProducts(nextPage, inventoryPageSize, inventorySortBy, inventorySortDirection)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona los productos con paginacion y ordenamiento.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {notification && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            notification.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {notification.message}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchInventoryProducts(inventoryPage, inventoryPageSize, inventorySortBy, inventorySortDirection)}
            >
              Reintentar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}


      {!isInventoryLoading && inventoryTotal > 0 && (
              <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  Mostrando {startItem}-{endItem} de {inventoryTotal} producto{inventoryTotal === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={inventoryPage <= 1 || isInventoryLoading}
                    onClick={() => void changePage(inventoryPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span>
                    Página {inventoryPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={inventoryPage >= totalPages || isInventoryLoading}
                    onClick={() => void changePage(inventoryPage + 1)}
                  >
                    Siguiente
                  </Button>
                  </div>
              </div>
            )}


      <ProductTable
        products={inventoryProducts}
        isLoading={isInventoryLoading && !isMutating}
        typeNameById={typeNameById}
        providerNameById={providerNameById}
        sortBy={inventorySortBy}
        sortDirection={inventorySortDirection}
        onSortChange={(field) => void handleSortChange(field)}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
      />

      <ProductForm
        open={formOpen}
        product={editingProduct}
        productTypes={productTypes}
        providers={providers}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <ProductDeleteDialog
        open={deleteOpen}
        product={deletingProduct}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
