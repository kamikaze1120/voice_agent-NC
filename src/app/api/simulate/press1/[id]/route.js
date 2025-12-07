import { NextResponse } from 'next/server'
import { getContacts } from '../../../../../server/state'
import { saveFollowup } from '../../../../../server/followups'

export const runtime = 'nodejs'

export async function POST(_request, { params }) {
  const id = parseInt(params.id, 10)
  const c = getContacts().find(x => x.id === id)
  if (c) saveFollowup(c)
  return NextResponse.json({ ok: true })
}