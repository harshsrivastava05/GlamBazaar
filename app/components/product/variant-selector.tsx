'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import { ProductVariant } from '@/lib/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  onVariantChange?: (variant: ProductVariant | null) => void
}

export default function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // Group attributes by type
  const attributeGroups = variants.reduce((groups, variant) => {
    variant.variantAttributes.forEach(({ attribute, attributeOption }) => {
      if (!groups[attribute.name]) {
        groups[attribute.name] = {
          attribute,
          options: new Set()
        }
      }
      groups[attribute.name].options.add(attributeOption)
    })
    return groups
  }, {} as Record<string, { attribute: ProductVariant['variantAttributes'][0]['attribute']; options: Set<ProductVariant['variantAttributes'][0]['attributeOption']> }>)

  // Convert sets to arrays for easier iteration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attributeGroupsArray = Object.entries(attributeGroups).map(([name, group]) => ({
    attribute: group.attribute,
    options: Array.from(group.options)
  }))

  // Find matching variant based on selected options
  useEffect(() => {
    const matchingVariant = variants.find(variant => {
      return variant.variantAttributes.every(({ attribute, attributeOption }) => {
        return selectedOptions[attribute.name] === attributeOption.id
      })
    })

    setSelectedVariant(matchingVariant || null)
    onVariantChange?.(matchingVariant || null)
  }, [selectedOptions, variants, onVariantChange])

  const handleOptionSelect = (attributeName: string, optionId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attributeName]: optionId
    }))
  }

  // Check if an option is available (has stock in any combination)
  const isOptionAvailable = (attributeName: string, optionId: number) => {
    return variants.some(variant => {
      const hasThisOption = variant.variantAttributes.some(
        attr => attr.attribute.name === attributeName && attr.attributeOption.id === optionId
      )
      return hasThisOption && variant.stockQuantity > 0 && variant.isActive
    })
  }

  if (variants.length === 0) {
    return null
  }

  // If there's only one variant, don't show selector
  if (variants.length === 1) {
    const variant = variants[0]
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">
            {formatPrice(variant.price)}
          </span>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(variant.compareAtPrice)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={variant.stockQuantity > 0 ? "secondary" : "destructive"}>
            {variant.stockQuantity > 0 ? `${variant.stockQuantity} in stock` : 'Out of stock'}
          </Badge>
          <span className="text-sm text-muted-foreground">SKU: {variant.sku}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price Display */}
      {selectedVariant && (
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(selectedVariant.compareAtPrice)}
            </span>
          )}
        </div>
      )}

      {/* Attribute Selectors */}
      {attributeGroupsArray.map(({ attribute, options }) => (
        <div key={attribute.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{attribute.displayName}:</span>
            {selectedOptions[attribute.name] && (
              <span className="text-sm text-muted-foreground">
                {options.find(opt => opt.id === selectedOptions[attribute.name])?.displayValue}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isSelected = selectedOptions[attribute.name] === option.id
              const isAvailable = isOptionAvailable(attribute.name, option.id)
              
              return (
                <Button
                  key={option.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleOptionSelect(attribute.name, option.id)}
                  className={cn(
                    "relative min-w-0",
                    attribute.type === 'COLOR' && "w-10 h-10 p-0",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                  style={
                    attribute.type === 'COLOR' && option.colorHex
                      ? { backgroundColor: option.colorHex }
                      : undefined
                  }
                >
                  {attribute.type === 'COLOR' ? (
                    <>
                      {isSelected && (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      )}
                      <span className="sr-only">{option.displayValue}</span>
                    </>
                  ) : (
                    option.displayValue
                  )}
                  
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-destructive rotate-45" />
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Stock Status */}
      {selectedVariant && (
        <div className="flex items-center gap-2">
          <Badge variant={selectedVariant.stockQuantity > 0 ? "secondary" : "destructive"}>
            {selectedVariant.stockQuantity > 0 
              ? `${selectedVariant.stockQuantity} in stock` 
              : 'Out of stock'
            }
          </Badge>
          <span className="text-sm text-muted-foreground">
            SKU: {selectedVariant.sku}
          </span>
        </div>
      )}

      {/* Selection Helper */}
      {!selectedVariant && Object.keys(selectedOptions).length < attributeGroupsArray.length && (
        <p className="text-sm text-muted-foreground">
          Please select all options to see price and availability
        </p>
      )}
    </div>
  )
}