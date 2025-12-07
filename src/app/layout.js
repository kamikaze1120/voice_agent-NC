export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voice Agent</title>
        <style>{`body { font-family: system-ui, Arial; margin: 0; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e5e7eb; } a, select, input, button { font-family: inherit; } textarea { width: 100%; height: 140px; background: #0b1220; color: #e5e7eb; border: 1px solid #334155; border-radius: 8px; padding: 10px; } button { margin-right: 8px; padding: 8px 12px; border-radius: 8px; border: 0; background: #3b82f6; color: white; cursor: pointer; } button:hover { filter: brightness(1.1); } .row { margin-top: 12px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #334155; padding: 8px; }`}</style>
        <style>{`.wrap { padding: 24px; } .card { border: 1px solid #334155; padding: 16px; border-radius: 12px; margin-bottom: 16px; background: #0b1220; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .headline { font-size: 22px; font-weight: 700; margin-bottom: 8px; } input[type=text], input[type=number], select { padding: 8px; border-radius: 8px; border: 1px solid #334155; background: #0b1220; color: #e5e7eb; }`}</style>
      </head>
      <body><div className="wrap"><div className="grid"><div className="card" style={{gridColumn: '1 / -1'}}>{children}</div></div></div></body>
    </html>
  )
}