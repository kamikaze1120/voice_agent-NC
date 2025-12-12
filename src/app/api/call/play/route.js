import { NextResponse } from 'next/server'
import { placeCallAndPlayE164 } from '../../../../server/ringcentral'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const phone = (body?.phone || '').trim()
    const text = (body?.text || '').trim()
    const lang = (body?.lang || 'en').trim()
    if (!phone) return NextResponse.json({ ok: false, error: 'missing phone' })
    if (!text) return NextResponse.json({ ok: false, error: 'missing text' })
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
    const audioUrl = baseUrl ? `${baseUrl}/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}` : `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
    const res = await placeCallAndPlayE164(phone, audioUrl)
    return NextResponse.json({ ok: true, res })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}