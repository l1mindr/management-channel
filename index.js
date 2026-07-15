const { Api, TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
const dotenv = require('dotenv')

dotenv.config()

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH
const stringSession = new StringSession('')

const CHANNEL = process.env.CHANNEL_NAME

function fixIphoneLine(text) {
  return text

    .replace(/\n?مناسب برای آیفون[^\n]*\n?/g, '\n')

    .replace(/\n{3,}/g, '\n\n')

    .trim()
}

;(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  })

  await client.start({
    phoneNumber: async () => await input.text('Phone: '),
    password: async () => await input.text('2FA Password: '),
    phoneCode: async () => await input.text('Code: '),
    onError: console.log,
  })

  console.log('✅ Logged in')

  const channel = await client.getEntity(CHANNEL)

  for await (const message of client.iterMessages(channel)) {
    if (!message.message) continue

    const newText = fixIphoneLine(message.message)

    if (newText === message.message) continue

    try {
      await client.editMessage(channel, {
        message: message.id,
        text: newText,
      })

      console.log(`✅ Edited: ${message.id}`)
    } catch (err) {
      console.log(`❌ Failed ${message.id}: ${err.message}`)
    }
  }

  await client.invoke(new Api.auth.LogOut({}))

  console.log('🎉 Done!')

  process.exit(0)
})()
