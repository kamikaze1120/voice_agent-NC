import { NextResponse } from 'next/server'
import { sendSms } from '../../../../server/ringcentral'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const phone = (body?.phone || '').trim()
    const text = (body?.text || '').trim()
    if (!phone) return NextResponse.json({ ok: false, error: 'missing phone' }, { status: 400 })
    if (!text) return NextResponse.json({ ok: false, error: 'missing text' }, { status: 400 })
    const res = await sendSms(phone, text)
    return NextResponse.json({ ok: true, res })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}