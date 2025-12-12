import { NextResponse } from 'next/server'
import { getAudioBase64 } from 'google-tts-api'

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const text = (searchParams.get('text') || '').trim()
    const lang = (searchParams.get('lang') || 'en').trim()
    if (!text) return new NextResponse('missing text', { status: 400 })
    const base64 = await getAudioBase64(text, { lang })
    const buf = Buffer.from(base64, 'base64')
    return new NextResponse(buf, { headers: { 'Content-Type': 'audio/mpeg' } })
  } catch (e) {
    return new NextResponse(JSON.stringify({ ok: false, error: e.message }), { status: 500 })
  }
}