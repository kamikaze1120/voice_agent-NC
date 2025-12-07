let contacts = []
let campaign = { status: 'idle', concurrency: 3, totalCalled: 0, totalFailed: 0, totalAnswered: 0 }
let queue = []
let active = 0
let timers = new Map()
const rcEnabled = process.env.RC_ENABLED === 'true'
let rcPlace
try { rcPlace = require('./ringcentral').placeCallE164 } catch(e) { rcPlace = null }

function normalizePhone(p) {
  if (!p) return null
  const digits = p.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return null
  return '+' + digits
}

function setContacts(list) {
  const result = []
  const seen = new Set()
  for (const item of list) {
    const phone = normalizePhone(item.phone)
    if (!phone) continue
    if (seen.has(phone)) continue
    seen.add(phone)
    result.push({ id: result.length + 1, name: item.name || '', phone, status: 'queued' })
  }
  contacts = result
  return contacts.length
}

function startCampaign(concurrency) {
  if (campaign.status === 'running') return { status: campaign.status, queued: queue.length }
  campaign.concurrency = Math.max(1, Math.min(20, concurrency || campaign.concurrency))
  queue = contacts.map(c => ({ ...c, status: 'queued' }))
  campaign.status = 'running'
  campaign.totalCalled = 0
  campaign.totalFailed = 0
  campaign.totalAnswered = 0
  active = 0
  timers = new Map()
  pump()
  return { status: campaign.status, queued: queue.length }
}

function stopCampaign() {
  campaign.status = 'stopped'
  for (const t of timers.values()) clearTimeout(t)
  timers.clear()
  queue = []
  active = 0
  return { status: campaign.status }
}

function startNext() {
  if (campaign.status !== 'running') return
  if (active >= campaign.concurrency) return
  const next = queue.shift()
  if (!next) return
  active++
  next.status = 'dialing'
  campaign.totalCalled++
  if (rcEnabled && rcPlace) {
    rcPlace(next.phone).then(() => {
      next.status = 'answered'
      campaign.totalAnswered++
      active--
      startNext()
    }).catch(() => {
      next.status = 'failed'
      campaign.totalFailed++
      active--
      startNext()
    })
    return
  }
  const t = setTimeout(() => {
    const answered = Math.random() < 0.8
    if (answered) {
      next.status = 'answered'
      campaign.totalAnswered++
    } else {
      next.status = 'failed'
      campaign.totalFailed++
    }
    active--
    startNext()
  }, 1500)
  timers.set(next.id, t)
}

function pump() {
  for (;;) {
    if (campaign.status !== 'running') break
    if (active >= campaign.concurrency) break
    if (queue.length === 0) break
    startNext()
  }
}

function status() {
  return { status: campaign.status, concurrency: campaign.concurrency, totals: { called: campaign.totalCalled, answered: campaign.totalAnswered, failed: campaign.totalFailed }, queued: queue.length, active }
}

function getContacts() { return contacts }

module.exports = { setContacts, startCampaign, stopCampaign, status, getContacts }