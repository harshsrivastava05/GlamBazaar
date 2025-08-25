'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { useToast } from '@/app/components/ui/use-toast'

export default function ProfileSettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/profile/settings')
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(r => r.json())
        .then(d => { setName(d.name ?? ''); setPhone(d.phone ?? '') })
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const onSave = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }) })
    if (res.ok) {
      toast({ title: 'Profile updated' })
      await update() // refresh NextAuth session
      router.push('/profile')
    } else {
      const e = await res.json()
      toast({ title: 'Error', description: e.error ?? 'Failed to update profile', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading) return <div className="container py-8">Loading…</div>

  return (
    <div className="container py-8">
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm mb-1">Name</div>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <div className="text-sm mb-1">Phone</div>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91…" />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button variant="outline" onClick={() => router.push('/profile')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
