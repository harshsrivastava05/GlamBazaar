import { Gem } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Gem className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">GlamBazar</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}