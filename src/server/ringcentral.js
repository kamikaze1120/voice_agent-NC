const { SDK } = require('@ringcentral/sdk')

function getSdk() {
  const server = process.env.RC_SERVER_URL
  const clientId = process.env.RC_CLIENT_ID
  const clientSecret = process.env.RC_CLIENT_SECRET
  if (!server || !clientId || !clientSecret) return null
  const sdk = new SDK({ server, clientId, clientSecret })
  return sdk
}

async function authorize() {
  const sdk = getSdk()
  if (!sdk) throw new Error('RC env missing')
  const jwt = process.env.RC_JWT
  if (jwt) {
    await sdk.login({ jwt })
    return sdk
  }
  const username = process.env.RC_USERNAME
  const password = process.env.RC_PASSWORD
  const extension = process.env.RC_EXTENSION || ''
  if (username && password) {
    await sdk.login({ username, password, extension })
    return sdk
  }
  throw new Error('RC credentials missing')
}

async function testAuth() {
  const sdk = await authorize()
  const platform = sdk.platform()
  const info = await platform.get('/restapi/v1.0/account/~/extension/~')
  return info.json()
}

async function placeCallE164(toNumber) {
  const sdk = await authorize()
  const platform = sdk.platform()
  const body = {
    from: { phoneNumber: process.env.RC_FROM_NUMBER },
    to: { phoneNumber: toNumber },
  }
  const res = await platform.post('/restapi/v1.0/account/~/ringout', body)
  return res.json()
}

module.exports = { testAuth, placeCallE164 }