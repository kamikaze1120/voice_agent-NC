import { NextResponse } from 'next/server'
import { placeCallE164 } from '../../../../server/ringcentral'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const phone = (body?.phone || '').trim()
    if (!phone) return NextResponse.json({ ok: false, error: 'missing phone' })
    const res = await placeCallE164(phone)
    return NextResponse.json({ ok: true, res })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}