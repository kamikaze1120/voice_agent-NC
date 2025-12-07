export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voice Agent</title>
        <style>{`body { font-family: system-ui, Arial; margin: 20px; } textarea { width: 100%; height: 120px; } button { margin-right: 8px; } .row { margin-top: 12px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 5px; }`}</style>
        <style>{`.card { border: 1px solid #e5e5e5; padding: 16px; border-radius: 8px; margin-bottom: 16px; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .headline { font-size: 20px; font-weight: 600; } input[type=text], input[type=number] { padding: 6px; }`}</style>
      </head>
      <body><div className="grid"><div className="card">{children}</div></div></body>
    </html>
  )
}
