const path = require('path')
const fs = require('fs')

const dataDir = path.join(process.cwd(), 'data')
const followupsFile = path.join(dataDir, 'followups.json')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if (!fs.existsSync(followupsFile)) fs.writeFileSync(followupsFile, JSON.stringify({ items: [] }))

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

module.exports = { saveFollowup, loadFollowups }