import { NextResponse } from 'next/server'
import { setMessage, getMessage } from '../../../server/state'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(getMessage())
}

export async function POST(request) {
  const body = await request.json()
  const r = setMessage(body?.text || '', body?.voice || '')
  return NextResponse.json({ ok: !!r.ok })
}