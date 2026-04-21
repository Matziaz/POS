import React, { useEffect, useMemo, useState } from "react"
import type { ProductProps } from "@core/entities"
import { useProducts } from "@interface/hooks/useProducts"
import { ProductRestoreDialog } from "@interface/components/products"
import { Button } from "@interface/components/ui/button"
import {
  AdminHeader,
  AdminSectionTabs,
  AdminSetupSection,
  AdminRestoreSection,
  AdminPaymentMethodsSection,
  AdminConfigurationSection,
  type AdminSection,
  type AdminDeletedProductType,
  type AdminProductType,
  type AdminRole,
  type AdminUser,
  type AdminPaymentMethod,
} from "@interface/components/admin"

interface AdminPageProps {
  initialSection?: AdminSection
}

export const AdminPage: React.FC<AdminPageProps> = ({ initialSection = "setup" }) => {
  const electronAPI = window.electronAPI
  const {
    deletedProducts,
    isLoading,
    error,
    clearError,
    fetchDeletedProducts,
    restoreProduct,
  } = useProducts()

  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection)
  const [restoreTarget, setRestoreTarget] = useState<"products" | "productTypes">("products")
  const [search, setSearch] = useState("")
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [selected, setSelected] = useState<ProductProps | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const [productTypes, setProductTypes] = useState<AdminProductType[]>([])
  const [deletedProductTypes, setDeletedProductTypes] = useState<AdminDeletedProductType[]>([])
  const [isLoadingDeletedProductTypes, setIsLoadingDeletedProductTypes] = useState(false)
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [paymentMethods, setPaymentMethods] = useState<AdminPaymentMethod[]>([])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), type === "success" ? 3000 : 4000)
  }

  const loadSetupData = async () => {
    if (!electronAPI) {
      setProductTypes([])
      setRoles([])
      setUsers([])
      setPaymentMethods([])
      return
    }

    const [types, roleRows, userRows, methodRows] = await Promise.all([
      electronAPI.productTypeList(),
      electronAPI.roleList(),
      electronAPI.userList(),
      electronAPI.paymentMethodList(),
    ])

    setProductTypes(types)
    setRoles(roleRows)
    setUsers(userRows)
    setPaymentMethods(methodRows)
  }

  const runSetupAction = async (callback: () => Promise<void>, successMessage: string) => {
    try {
      await callback()
      await loadSetupData()
      showNotification("success", successMessage)
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "No se pudo completar la accion"
      )
      throw err
    }
  }

  const loadDeletedProductTypes = async () => {
    setIsLoadingDeletedProductTypes(true)
    if (!electronAPI?.productTypeListDeleted) {
      setDeletedProductTypes([])
      setIsLoadingDeletedProductTypes(false)
      return
    }

    try {
      const types = await electronAPI.productTypeListDeleted()
      setDeletedProductTypes(
        types.map((type) => ({
          id: type.id,
          name: type.name,
          deletedAt: type.deletedAt ?? null,
        }))
      )
    } finally {
      setIsLoadingDeletedProductTypes(false)
    }
  }

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    let active = true

    const loadSetupData = async () => {
      try {
        const [types, roleRows, userRows, methodRows] = await Promise.all([
          electronAPI?.productTypeList() ?? Promise.resolve([]),
          electronAPI?.roleList() ?? Promise.resolve([]),
          electronAPI?.userList() ?? Promise.resolve([]),
          electronAPI?.paymentMethodList() ?? Promise.resolve([]),
        ])

        if (!active) return

        setProductTypes(types)
        setRoles(roleRows)
        setUsers(userRows)
        setPaymentMethods(methodRows)
      } catch {
        if (!active) return
        setProductTypes([])
        setRoles([])
        setUsers([])
        setPaymentMethods([])
      }
    }

    void loadSetupData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (activeSection !== "restore") return
    if (restoreTarget === "products") {
      void fetchDeletedProducts()
      return
    }

    void loadDeletedProductTypes()
    // Ejecutar solo cuando se entra a la seccion de restauracion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, restoreTarget])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return deletedProducts
    return deletedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
    )
  }, [deletedProducts, search])

  const filteredDeletedProductTypes = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return deletedProductTypes
    return deletedProductTypes.filter((type) => type.name.toLowerCase().includes(term))
  }, [deletedProductTypes, search])

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
      showNotification("success", `"${selected.name}" restaurado correctamente.`)
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "No se pudo restaurar el producto"
      )
      throw err
    }
  }

  const handleRestoreProductType = async (productType: AdminDeletedProductType) => {
    if (!electronAPI?.productTypeRestore) {
      showNotification("error", "Electron API no disponible")
      return
    }

    try {
      await electronAPI.productTypeRestore(productType.id)
      await Promise.all([loadDeletedProductTypes(), loadSetupData()])
      showNotification("success", `"${productType.name}" restaurado correctamente.`)
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "No se pudo restaurar el tipo de producto"
      )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <AdminHeader />
      <AdminSectionTabs activeSection={activeSection} onChange={setActiveSection} />

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

      {activeSection === "setup" && (
        <AdminSetupSection
          productTypes={productTypes}
          roles={roles}
          users={users}
          onCreateProductType={async (name: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.productTypeCreate({ name })
              },
              "Tipo de producto creado correctamente"
            )
          }}
          onUpdateProductType={async (id: string, name: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.productTypeUpdate({ id, name })
              },
              "Tipo de producto actualizado correctamente"
            )
          }}
          onDeleteProductType={async (id: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.productTypeDelete(id)
              },
              "Tipo de producto eliminado correctamente"
            )
          }}
          onCreateRole={async (type: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.roleCreate({ type })
              },
              "Rol creado correctamente"
            )
          }}
          onUpdateRole={async (id: string, type: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.roleUpdate({ id, type })
              },
              "Rol actualizado correctamente"
            )
          }}
          onDeleteRole={async (id: string) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.roleDelete(id)
              },
              "Rol eliminado correctamente"
            )
          }}
        />
      )}

      {activeSection === "payment" && (
        <AdminPaymentMethodsSection
          paymentMethods={paymentMethods}
          onCreatePaymentMethod={async (data) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.paymentMethodCreate(data)
              },
              "Método de pago creado correctamente"
            )
          }}
          onUpdatePaymentMethod={async (id, data) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.paymentMethodUpdate({ id, ...data })
              },
              "Método de pago actualizado correctamente"
            )
          }}
          onTogglePaymentMethod={async (id) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.paymentMethodToggleActive(id)
              },
              "Estado del método de pago actualizado"
            )
          }}
        />
      )}

      {activeSection === "restore" && (
        <AdminRestoreSection
          restoreTarget={restoreTarget}
          onRestoreTargetChange={(target) => {
            setRestoreTarget(target)
            setSearch("")
          }}
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => {
            if (restoreTarget === "products") {
              void fetchDeletedProducts()
              return
            }

            void loadDeletedProductTypes()
          }}
          isLoading={restoreTarget === "products" ? isLoading : isLoadingDeletedProductTypes}
          products={filteredProducts}
          deletedProductTypes={filteredDeletedProductTypes}
          onRestoreClick={handleOpenRestore}
          onRestoreProductTypeClick={handleRestoreProductType}
        />
      )}

      {activeSection === "config" && (
        <AdminConfigurationSection
          onSave={async (retailContext) => {
            await runSetupAction(
              async () => {
                if (!electronAPI) throw new Error("Electron API no disponible")
                await electronAPI.configurationSaveInitial({ retailContext })
              },
              "Configuración actualizada correctamente"
            )
          }}
        />
      )}

      <ProductRestoreDialog
        open={restoreOpen}
        product={selected}
        onClose={handleCloseRestore}
        onConfirm={handleRestore}
      />
    </div>
  )
}
