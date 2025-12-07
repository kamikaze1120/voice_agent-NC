import { NextResponse } from 'next/server'
import { stopCampaign } from '../../../../server/state'

export const runtime = 'nodejs'

export async function POST() {
  const r = stopCampaign()
  return NextResponse.json({ ok: true, ...r })
}