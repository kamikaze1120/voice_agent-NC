import { NextResponse } from 'next/server'
import { getCallLog } from '../../../../server/ringcentral'

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const perPage = parseInt(searchParams.get('perPage') || '20', 10)
    const direction = (searchParams.get('direction') || '').trim()
    const type = (searchParams.get('type') || '').trim()
    const dateFrom = (searchParams.get('dateFrom') || '').trim()
    const dateTo = (searchParams.get('dateTo') || '').trim()
    const items = await getCallLog({ perPage, direction: direction || undefined, type: type || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}