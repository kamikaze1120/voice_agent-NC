import { NextResponse } from 'next/server'
import { startCampaign } from '../../../../server/state'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.json()
  const r = startCampaign(typeof body.concurrency === 'number' ? body.concurrency : undefined)
  return NextResponse.json({ ok: true, ...r })
}