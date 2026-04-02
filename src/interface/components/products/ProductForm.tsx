import React, { useState, useEffect } from "react"
import type { ProductProps } from "@core/entities"
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "@core/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@interface/components/ui/dialog"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { Label } from "@interface/components/ui/label"
import { DEFAULT_PRODUCT_IMAGE } from "@shared/constants/constants"

export interface ProductTypeOption {
  id: string
  name: string
}

export interface ProviderOption {
  id: string
  name: string
}

interface ProductFormProps {
  open: boolean
  product: ProductProps | null  // null = crear, ProductProps = editar
  productTypes: ProductTypeOption[]
  providers: ProviderOption[]
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<void>
}

export interface ProductFormData {
  sku: string
  name: string
  typeId: string
  price: number
  stock: number
  image?: string
  providerId: string
}

interface FormErrors {
  sku?: string
  name?: string
  typeId?: string
  price?: string
  stock?: string
  image?: string
}

const INITIAL_FORM: ProductFormData = {
  sku: "",
  name: "",
  typeId: DEFAULT_PRODUCT_TYPE_ID,
  price: 0,
  stock: 0,
  image: DEFAULT_PRODUCT_IMAGE,
  providerId: DEFAULT_PROVIDER_ID,
}

function validate(data: ProductFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.sku.trim()) {
    errors.sku = "El SKU es obligatorio"
  }

  if (!data.name.trim()) {
    errors.name = "El nombre es obligatorio"
  }

  if (!data.typeId.trim()) {
    errors.typeId = "El tipo es obligatorio"
  }

  if (!data.price || data.price <= 0) {
    errors.price = "El precio debe ser mayor a 0"
  }

  if (data.stock < 0 || !Number.isInteger(data.stock)) {
    errors.stock = "El stock debe ser un número entero no negativo"
  }

  return errors
}

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  product,
  productTypes,
  providers,
  onClose,
  onSubmit,
}) => {
  const isEditing = product !== null
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [imagePreviewError, setImagePreviewError] = useState(false)

  const canSubmit =
    form.sku.trim().length > 0 &&
    form.name.trim().length > 0 &&
    form.typeId.trim().length > 0 &&
    form.providerId.trim().length > 0 &&
    form.price > 0 &&
    Number.isInteger(form.stock) &&
    form.stock >= 0

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          sku: product.sku,
          name: product.name,
          typeId: product.typeId,
          price: product.price,
          stock: product.stock,
          image: product.image,
          providerId: product.providerId,
        })
      } else {
        setForm(INITIAL_FORM)
      }
      setErrors({})
      setSubmitError(null)
      setImagePreviewError(false)
    }
  }, [open, product])

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo al modificar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (field === "image") {
      setImagePreviewError(false)
    }
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error al guardar el producto"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del producto y guarda los cambios."
                : "Completa los datos para registrar un nuevo producto."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* SKU */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <div className="col-span-3">
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="Ej: COCA-600"
                  disabled={isSubmitting}
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive mt-1">{errors.sku}</p>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ej: Coca-Cola 600ml"
                  disabled={isSubmitting}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Tipo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="typeId" className="text-right">
                Tipo
              </Label>
              <div className="col-span-3">
                <select
                  id="typeId"
                  value={form.typeId}
                  onChange={(e) => handleChange("typeId", e.target.value)}
                  disabled={isSubmitting}
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.typeId ? "border-destructive" : "border-input"
                  }`}
                >
                  {productTypes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors.typeId && (
                  <p className="text-sm text-destructive mt-1">{errors.typeId}</p>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio
              </Label>
              <div className="col-span-3">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price || ""}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <div className="col-span-3">
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    handleChange("stock", parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="0"
                  disabled={isSubmitting}
                  className={errors.stock ? "border-destructive" : ""}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Imagen */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Imagen
              </Label>
              <div className="col-span-3">
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="URL de la imagen"
                  disabled={isSubmitting}
                  className={errors.image ? "border-destructive" : ""}
                />
                <div className="mt-2">
                  <img
                    src={!form.image || imagePreviewError ? DEFAULT_PRODUCT_IMAGE : form.image}
                    alt="Vista previa del producto"
                    className="h-14 w-14 rounded-md border object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                </div>
              </div>
            </div>

            {/* Proveedor */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="providerId" className="text-right">
                Proveedor
              </Label>
              <div className="col-span-3">
                <select
                  id="providerId"
                  value={form.providerId}
                  onChange={(e) => handleChange("providerId", e.target.value)}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {providers.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
