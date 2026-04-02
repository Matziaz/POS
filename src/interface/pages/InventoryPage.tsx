import React, { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "@core/constants"
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
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError,
    refetch,
  } = useProducts()

  // Estado de los modales
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductProps | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductProps | null>(null)

  // Notificaciones simples (toast inline)
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

  const typeNameById = useMemo<Record<string, string>>(() => {
    const entries = productTypes.map((type) => [type.id, type.name])
    return Object.fromEntries(entries)
  }, [productTypes])

  const providerNameById = useMemo<Record<string, string>>(() => {
    const entries = providers.map((provider) => [provider.id, provider.name])
    return Object.fromEntries(entries)
  }, [providers])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // --- Handlers ---

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los productos de tu negocio
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Notificación global (toast inline) */}
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

      {/* Error del store */}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Contador de productos */}
      {!isLoading && products.length > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {products.length} producto{products.length !== 1 ? "s" : ""} registrado{products.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Tabla de productos */}
      <ProductTable
        products={products}
        isLoading={isLoading && !isMutating}
        typeNameById={typeNameById}
        providerNameById={providerNameById}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
      />

      {/* Modal: Crear/Editar producto */}
      <ProductForm
        open={formOpen}
        product={editingProduct}
        productTypes={productTypes}
        providers={providers}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* Modal: Confirmar eliminación */}
      <ProductDeleteDialog
        open={deleteOpen}
        product={deletingProduct}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
