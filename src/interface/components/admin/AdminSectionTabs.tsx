import React from "react"
import { Button } from "@interface/components/ui/button"
import type { AdminSection } from "@interface/components/admin/types"

interface AdminSectionTabsProps {
  activeSection: AdminSection
  onChange: (section: AdminSection) => void
}

export const AdminSectionTabs: React.FC<AdminSectionTabsProps> = ({
  activeSection,
  onChange,
}) => (
  <div className="mb-6 flex flex-wrap items-center gap-2">
    <Button
      variant={activeSection === "setup" ? "default" : "outline"}
      onClick={() => onChange("setup")}
    >
      Configuracion inicial
    </Button>
    <Button
      variant={activeSection === "restore" ? "default" : "outline"}
      onClick={() => onChange("restore")}
    >
      Restaurar productos
    </Button>
  </div>
)
