import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logoPath = path.join(__dirname, 'public/logo.png')

// Indigo-900 background (#1e1b4b) — matches app gradient
const BG = { r: 30, g: 27, b: 75, alpha: 1 }

async function makeIcon(size, filename) {
  const logoSize = Math.round(size * 0.62)

  const logoResized = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .png()
    .toFile(path.join(__dirname, 'public', filename))

  console.log(`✓ ${filename}`)
}

await makeIcon(512, 'icon-512.png')
await makeIcon(192, 'icon-192.png')
await makeIcon(180, 'apple-touch-icon.png')
console.log('Icons done!')
