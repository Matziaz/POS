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
  type AdminSection,
  type AdminProductType,
  type AdminRole,
  type AdminUser,
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
  const [search, setSearch] = useState("")
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [selected, setSelected] = useState<ProductProps | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const [productTypes, setProductTypes] = useState<AdminProductType[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), type === "success" ? 3000 : 4000)
  }

  const loadSetupData = async () => {
    if (!electronAPI) {
      setProductTypes([])
      setRoles([])
      setUsers([])
      return
    }

    const [types, roleRows, userRows] = await Promise.all([
      electronAPI.productTypeList(),
      electronAPI.roleList(),
      electronAPI.userList(),
    ])

    setProductTypes(types)
    setRoles(roleRows)
    setUsers(userRows)
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

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    let active = true

    const loadSetupData = async () => {
      try {
        const [types, roleRows, userRows] = await Promise.all([
          electronAPI?.productTypeList() ?? Promise.resolve([]),
          electronAPI?.roleList() ?? Promise.resolve([]),
          electronAPI?.userList() ?? Promise.resolve([]),
        ])

        if (!active) return

        setProductTypes(types)
        setRoles(roleRows)
        setUsers(userRows)
      } catch {
        if (!active) return
        setProductTypes([])
        setRoles([])
        setUsers([])
      }
    }

    void loadSetupData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (activeSection !== "restore") return
    void fetchDeletedProducts()
    // Ejecutar solo cuando se entra a la seccion de restauracion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return deletedProducts
    return deletedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
    )
  }, [deletedProducts, search])

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

      {activeSection === "restore" && (
        <AdminRestoreSection
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => {
            void fetchDeletedProducts()
          }}
          isLoading={isLoading}
          products={filteredProducts}
          onRestoreClick={handleOpenRestore}
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
