import { NextResponse } from 'next/server'
import { setContacts, getContacts } from '../../../server/state'

export const runtime = 'nodejs'

export async function POST(request) {
  const list = await request.json()
  const count = setContacts(Array.isArray(list) ? list : [])
  return NextResponse.json({ count })
}

export async function GET() {
  return NextResponse.json({ items: getContacts() })
}