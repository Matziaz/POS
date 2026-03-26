import React from "react"
import { Search } from "lucide-react"
import { Input } from "@interface/components/ui/input"

interface SearchBarProps {
  value: string
  onChange: (query: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar producto por nombre o SKU..."
        className="pl-9"
      />
    </div>
  )
}
