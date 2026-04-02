import React from "react"
import { cn } from "@interface/lib/utils"
import type { ContactBaseView } from "@interface/store/contactStore"

const statusToneStyles: Record<ContactBaseView["statusTone"], string> = {
  success: "text-emerald-600",
  warning: "text-amber-500",
  danger: "text-destructive",
  neutral: "text-muted-foreground",
}

interface ContactStatusProps {
  tone: ContactBaseView["statusTone"]
  children: React.ReactNode
}

export const ContactStatus: React.FC<ContactStatusProps> = ({ tone, children }) => (
  <p className={cn("mt-1 flex items-center gap-2 text-xs font-medium", statusToneStyles[tone])}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </p>
)
