import { NextResponse } from 'next/server'
import { testAuth } from '../../../../server/ringcentral'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const info = await testAuth()
    return NextResponse.json({ ok: true, info })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}