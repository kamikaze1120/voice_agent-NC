"use client"
import { useEffect, useState } from 'react'

export default function Page() {
  const [contactsText, setContactsText] = useState('')
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [concurrency, setConcurrency] = useState(3)

  const parseContacts = (text) => {
    const lines = text.split(/\n+/).map(x => x.trim()).filter(Boolean)
    const out = []
    for (const l of lines) {
      const parts = l.split(',')
      const name = (parts[0]||'').trim()
      const phone = (parts[1]||'').trim()
      out.push({ name, phone })
    }
    return out
  }

  async function upload() {
    const list = parseContacts(contactsText)
    const r = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(list) })
    const j = await r.json()
    alert('Uploaded: ' + j.count)
    refresh()
  }
  async function start() {
    await fetch('/api/campaign/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ concurrency }) })
    refresh()
  }
  async function stop() {
    await fetch('/api/campaign/stop', { method: 'POST' })
    refresh()
  }
  async function markPress1(id) {
    await fetch(`/api/simulate/press1/${id}`, { method: 'POST' })
    refresh()
  }
  async function refresh() {
    const r = await fetch('/api/campaign/status')
    const j = await r.json()
    setStats(j)
    const cr = await fetch('/api/contacts')
    const cj = await cr.json()
    setContacts(cj.items)
  }
  useEffect(() => { const t = setInterval(refresh, 1000); refresh(); return () => clearInterval(t) }, [])

  return (
    <div>
      <h1>Voice Agent</h1>
      <div className="row">
        <div>Paste contacts (one per line, Name,Phone):</div>
        <textarea value={contactsText} onChange={e => setContactsText(e.target.value)} />
        <button onClick={upload}>Upload Contacts</button>
        <input type="number" min={1} max={20} value={concurrency} onChange={e => setConcurrency(parseInt(e.target.value, 10))} />
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
      </div>
      <div className="row">
        <div id="stats">{stats && `Status: ${stats.status} | Concurrency: ${stats.concurrency} | Called: ${stats.totals.called} | Answered: ${stats.totals.answered} | Failed: ${stats.totals.failed} | Queued: ${stats.queued} | Active: ${stats.active}`}</div>
      </div>
      <div className="row">
        <h3>Follow-ups</h3>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Time</th></tr></thead>
          <tbody>
            {stats?.followups?.map(x => (
              <tr key={x.phone + x.at}><td>{x.name}</td><td>{x.phone}</td><td>{new Date(x.at).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row">
        <h3>Contacts</h3>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Action</th></tr></thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td><button onClick={() => markPress1(c.id)}>Mark Press 1</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}