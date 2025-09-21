// app/components/ui/responsive-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface ResponsiveCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function ResponsiveCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: ResponsiveCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn("pb-3 sm:pb-4", headerClassName)}>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}