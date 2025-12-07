const express = require('express')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

const dataDir = path.join(__dirname, 'data')
const followupsFile = path.join(dataDir, 'followups.json')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if (!fs.existsSync(followupsFile)) fs.writeFileSync(followupsFile, JSON.stringify({ items: [] }))

let contacts = []
let campaign = { status: 'idle', concurrency: 3, totalCalled: 0, totalFailed: 0, totalAnswered: 0 }
let queue = []
let active = 0
let timers = new Map()

function saveFollowup(contact) {
  const raw = fs.readFileSync(followupsFile, 'utf8')
  const json = JSON.parse(raw)
  const exists = json.items.find(x => x.phone === contact.phone)
  if (!exists) json.items.push({ name: contact.name || '', phone: contact.phone, at: Date.now() })
  fs.writeFileSync(followupsFile, JSON.stringify(json))
}

function loadFollowups() {
  const raw = fs.readFileSync(followupsFile, 'utf8')
  return JSON.parse(raw).items
}

function normalizePhone(p) {
  if (!p) return null
  const digits = p.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return null
  return '+' + digits
}

function startNext() {
  if (campaign.status !== 'running') return
  if (active >= campaign.concurrency) return
  const next = queue.shift()
  if (!next) return
  active++
  next.status = 'dialing'
  campaign.totalCalled++
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

app.post('/contacts', (req, res) => {
  const list = Array.isArray(req.body) ? req.body : []
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
  res.json({ count: contacts.length })
})

app.get('/contacts', (req, res) => {
  res.json({ items: contacts })
})

app.post('/campaign/start', (req, res) => {
  if (campaign.status === 'running') return res.json({ ok: true, status: campaign.status })
  if (req.body && typeof req.body.concurrency === 'number') campaign.concurrency = Math.max(1, Math.min(20, req.body.concurrency))
  queue = contacts.map(c => ({ ...c, status: 'queued' }))
  campaign.status = 'running'
  campaign.totalCalled = 0
  campaign.totalFailed = 0
  campaign.totalAnswered = 0
  active = 0
  timers = new Map()
  pump()
  res.json({ ok: true, status: campaign.status, queued: queue.length })
})

app.post('/campaign/stop', (req, res) => {
  campaign.status = 'stopped'
  for (const t of timers.values()) clearTimeout(t)
  timers.clear()
  queue = []
  active = 0
  res.json({ ok: true, status: campaign.status })
})

app.get('/campaign/status', (req, res) => {
  const followups = loadFollowups()
  res.json({ status: campaign.status, concurrency: campaign.concurrency, totals: { called: campaign.totalCalled, answered: campaign.totalAnswered, failed: campaign.totalFailed }, queued: queue.length, active, followups })
})

app.post('/simulate/press1/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const c = contacts.find(x => x.id === id)
  if (c) saveFollowup(c)
  res.json({ ok: true })
})

app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 3000
app.listen(port, () => {})