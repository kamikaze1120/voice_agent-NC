export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voice Agent</title>
        <style>{`body { font-family: system-ui, Arial; margin: 20px; } textarea { width: 100%; height: 120px; } button { margin-right: 8px; } .row { margin-top: 12px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 6px; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}