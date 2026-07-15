const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
const dotenv = require('dotenv')
const fs = require('fs')

dotenv.config()

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH
const stringSession = new StringSession('')

const CHANNEL = process.env.CHANNEL_NAME

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

  const hashtagCounts = {}

  let totalMessages = 0

  for await (const message of client.iterMessages(channel)) {
    totalMessages++

    const caption = message.message

    if (!caption) continue

    // پیدا کردن تمام هشتگ‌ها
    const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu)

    if (!hashtags) continue

    for (const tag of hashtags) {
      const normalized = tag.toLowerCase()

      if (normalized === '#lockscreenzone' || normalized.startsWith('#wp')) {
        continue
      }

      hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1
    }
  }

  // مرتب‌سازی بر اساس بیشترین تکرار
  const sorted = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1])

  const output = [
    `Total Messages: ${totalMessages}`,
    `Unique Hashtags: ${sorted.length}`,
    '',
    'Hashtag Counts:',
    '',
    ...sorted.map(([tag, count]) => `${tag}: ${count}`),
  ].join('\n')

  fs.writeFileSync('hashtags.txt', output, 'utf8')

  console.log('✅ Saved to hashtags.txt')

  await client.disconnect()

  process.exit(0)
})()
