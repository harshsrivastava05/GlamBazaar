import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/app/components/auth/login-form'
import { Card } from '@/app/components/ui/card'

export const metadata = {
  title: 'Login - GlamBazar',
  description: 'Sign in to your GlamBazar account',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="w-full max-w-md mx-auto">
            <div className="p-6 space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}