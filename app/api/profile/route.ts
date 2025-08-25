import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id as string }, select: { name: true, email: true, phone: true } })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, phone } = await req.json()
  if (typeof name !== 'string' || name.length < 2) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  const user = await prisma.user.update({ where: { id: session.user.id as string }, data: { name, phone } })
  return NextResponse.json({ ok: true, id: user.id })
}
