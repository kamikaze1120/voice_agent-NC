"use client"
import { useEffect, useState } from 'react'

export default function Page() {
  const [contactsText, setContactsText] = useState('')
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [concurrency, setConcurrency] = useState(3)
  const [message, setMessage] = useState('')
  const [versions, setVersions] = useState([])
  const [testPhone, setTestPhone] = useState('')
  const [voices, setVoices] = useState([])
  const [voiceName, setVoiceName] = useState('')
  const [smsPhone, setSmsPhone] = useState('')
  const [smsText, setSmsText] = useState('')
  const [callLog, setCallLog] = useState([])

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
    setVersions(j.message?.versions || [])
    setMessage(j.message?.current || '')
    setVoiceName(j.message?.voice || '')
    const cr = await fetch('/api/contacts')
    const cj = await cr.json()
    setContacts(cj.items)
  }
  async function refreshCallLog() {
    const r = await fetch('/api/rc/call-log?perPage=20&type=Voice')
    const j = await r.json()
    setCallLog(j.items || [])
  }
  useEffect(() => {
    const t = setInterval(refresh, 1000)
    refresh()
    refreshCallLog()
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      setVoices(v || [])
      if (!voiceName && v && v.length) setVoiceName(v[0].name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { clearInterval(t); window.speechSynthesis.onvoiceschanged = null }
  }, [])

  return (
    <div>
      <h1 className="headline">Voice Agent</h1>
      <div className="grid">
        <div className="card">
          <div className="headline">Message</div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} />
          <div className="row">
            <select value={voiceName} onChange={e => setVoiceName(e.target.value)}>
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
            <button onClick={async () => { await fetch('/api/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: message, voice: voiceName }) }); refresh() }}>Save</button>
            <button onClick={() => { const u = new SpeechSynthesisUtterance(message); const vv = voices.find(x => x.name === voiceName); if (vv) u.voice = vv; window.speechSynthesis.speak(u) }}>Play Sample</button>
          </div>
          <div className="row">
            <strong>Recent Versions</strong>
            <ul>
              {versions.map(v => (
                <li key={v.at}>{new Date(v.at).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="headline">Campaign</div>
          <div>Paste contacts (one per line, Name,Phone):</div>
          <textarea value={contactsText} onChange={e => setContactsText(e.target.value)} />
          <div className="row">
            <button onClick={upload}>Upload</button>
            <input type="number" min={1} max={20} value={concurrency} onChange={e => setConcurrency(parseInt(e.target.value, 10))} />
            <button onClick={start}>Start</button>
            <button onClick={stop}>Stop</button>
          </div>
          <div className="row">
            <input type="text" placeholder="Test phone" value={testPhone} onChange={e => setTestPhone(e.target.value)} />
            <button onClick={async () => { const r = await fetch('/api/call/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: testPhone }) }); const j = await r.json(); alert(j.ok ? 'Call triggered' : ('Error: ' + j.error)) }}>Place Test Call</button>
            <button onClick={async () => { const r = await fetch('/api/call/play', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: testPhone, text: message, lang: 'en' }) }); const j = await r.json(); alert(j.ok ? 'Play call triggered' : ('Error: ' + j.error)) }}>Place Play Call</button>
          </div>
          <div className="row">
            <div id="stats">{stats && `Status: ${stats.status} | Concurrency: ${stats.concurrency} | Called: ${stats.totals.called} | Answered: ${stats.totals.answered} | Failed: ${stats.totals.failed} | Queued: ${stats.queued} | Active: ${stats.active}`}</div>
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <div className="headline">Follow-ups</div>
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Time</th></tr></thead>
            <tbody>
              {stats?.followups?.map(x => (
                <tr key={x.phone + x.at}><td>{x.name}</td><td>{x.phone}</td><td>{new Date(x.at).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="headline">Contacts</div>
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Action</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td><button onClick={() => markPress1(c.id)}>Mark Press 1</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="headline">SMS</div>
          <div className="row">
            <input type="text" placeholder="Phone" value={smsPhone} onChange={e => setSmsPhone(e.target.value)} />
            <input type="text" placeholder="Message" value={smsText} onChange={e => setSmsText(e.target.value)} />
            <button onClick={async () => { const r = await fetch('/api/rc/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: smsPhone, text: smsText }) }); const j = await r.json(); alert(j.ok ? 'SMS sent' : ('Error: ' + j.error)) }}>Send SMS</button>
          </div>
        </div>
        <div className="card">
          <div className="headline">Recent Calls</div>
          <div className="row"><button onClick={refreshCallLog}>Refresh</button></div>
          <table>
            <thead><tr><th>From</th><th>To</th><th>Direction</th><th>Result</th><th>Start</th><th>Duration</th></tr></thead>
            <tbody>
              {callLog.map(c => (
                <tr key={c.id}><td>{c.from?.phoneNumber || ''}</td><td>{c.to?.phoneNumber || ''}</td><td>{c.direction}</td><td>{c.result}</td><td>{c.startTime ? new Date(c.startTime).toLocaleString() : ''}</td><td>{typeof c.duration === 'number' ? `${c.duration}s` : ''}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}