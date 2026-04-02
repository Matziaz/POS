import React from "react"
import { cn } from "@interface/lib/utils"

interface CategoryTabsProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            selected === category
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
