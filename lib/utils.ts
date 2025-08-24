import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'BDT' | 'INR'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'INR', notation = 'standard' } = options

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `GB${timestamp}${random}`
}

export function calculateDeliveryFee(city: string, state: string): {
  type: 'same_day' | 'speedpost'
  fee: number
  description: string
} {
  const isKanpur = city.toLowerCase().includes('kanpur') && 
                  state.toLowerCase().includes('uttar pradesh')
  
  if (isKanpur) {
    return {
      type: 'same_day',
      fee: 99,
      description: 'Same-day delivery (order before 2 PM)'
    }
  }
  
  return {
    type: 'speedpost',
    fee: 150,
    description: 'Speedpost delivery (3-5 business days)'
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str
}