import { NextResponse } from 'next/server'
import { status } from '../../../../server/state'
import { loadFollowups } from '../../../../server/followups'

export const runtime = 'nodejs'

export async function GET() {
  const s = status()
  const followups = loadFollowups()
  return NextResponse.json({ ...s, followups })
}