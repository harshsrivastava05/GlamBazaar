import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCartItemCount } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 })
    }

    const count = await getCartItemCount(session.user.id as string)
    
    return NextResponse.json(
      { count },
      { 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error) {
    console.error('Cart count fetch error:', error)
    return NextResponse.json({ count: 0 })
  }
}