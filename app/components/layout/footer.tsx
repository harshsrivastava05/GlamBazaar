import Link from 'next/link'
import { Gem } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GlamBazar</span>
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          © 2025 GlamBazar. All rights reserved.
        </p>
      </div>
    </footer>
  )
}