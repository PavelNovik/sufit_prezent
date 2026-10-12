// Готовит все изображения в public/:
// 1) фото комнат (Unsplash) → public/rooms/<id>.webp (ширина 1600 — в этих координатах размечены сцены
//    в src/data/scenes.js) и <id>-sm.webp (480, миниатюры);
// 2) текстуры фотопечати → public/textures/<id>.webp;
// 3) фото опций и реализаций с sufitowski.pl → public/catalog/<n>.webp, public/realizacje/<n>.webp;
// 4) логотип → public/logo.png (белый), favicon/og-image.
// Запуск: npm run images  (исходники кэшируются в raw/, повторный запуск не качает заново)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { rooms, textures } from './images.js'

const pub = path.resolve('public')
const raw = path.resolve('raw')
for (const d of ['rooms', 'textures', 'catalog', 'realizacje']) fs.mkdirSync(path.join(pub, d), { recursive: true })
for (const d of ['unsplash', 'site']) fs.mkdirSync(path.join(raw, d), { recursive: true })

async function download(url, file) {
  if (fs.existsSync(file)) return fs.readFileSync(file)
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(file, buf)
      return buf
    } catch (e) {
      if (attempt >= 3) throw e
    }
  }
}
const unsplash = (photo, w) =>
  download(`https://images.unsplash.com/${photo}?w=${w}&q=90&fm=jpg`, path.join(raw, 'unsplash', `${photo}-${w}.jpg`))
const site = (file) => download(`https://sufitowski.pl/${file}`, path.join(raw, 'site', file))

// 1) Комнаты
for (const [id, photo] of Object.entries(rooms)) {
  const buf = await unsplash(photo, 2000)
  const out = sharp(buf).resize({ width: 1600 })
  const { height } = await out.clone().webp({ quality: 84 }).toFile(path.join(pub, 'rooms', `${id}.webp`))
  await sharp(buf).resize(480, 320, { fit: 'cover' }).webp({ quality: 74 }).toFile(path.join(pub, 'rooms', `${id}-sm.webp`))
  console.log(`  room ${id}  1600×${height}`)
}

// 2) Текстуры фотопечати (квадрат — ложатся на плоскость потолка)
for (const [id, photo] of Object.entries(textures)) {
  const buf = await unsplash(photo, 1600)
  await sharp(buf).resize(1400, 1100, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(pub, 'textures', `${id}.webp`))
  await sharp(buf).resize(160, 160, { fit: 'cover' }).webp({ quality: 74 }).toFile(path.join(pub, 'textures', `${id}-sm.webp`))
  console.log(`  texture ${id}`)
}

// 3) Фото опций из калькулятора sufitowski.pl (1.png … 19.png) и реализации из портфолио
for (let n = 1; n <= 19; n++) {
  const buf = await site(`${n}.png`)
  await sharp(buf).resize(320, 320, { fit: 'cover' }).webp({ quality: 78 }).toFile(path.join(pub, 'catalog', `${n}.webp`))
}
console.log('  catalog 1–19')
for (let n = 1; n <= 3; n++) {
  const buf = await site(`gallery-${n}.jpg`)
  await sharp(buf).webp({ quality: 80 }).toFile(path.join(pub, 'realizacje', `${n}.webp`))
}
console.log('  realizacje 1–3')

// 4) Логотип: оригинал — белые буквы на чёрном; делаем белый PNG с прозрачностью (альфа = яркость)
{
  const buf = await site('SUFITOWSKI_logo_2.png')
  const { data, info } = await sharp(buf).flatten({ background: '#000' }).greyscale().trim({ threshold: 20 }).raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255
    rgba[i * 4 + 3] = data[i]
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ height: 120 })
    .png()
    .toFile(path.join(pub, 'logo.png'))
  console.log(`  logo ${info.width}×${info.height}`)
}

// favicon: золотая буква S на графите
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0e1115"/><path d="M14 22 L50 14" stroke="#d9a441" stroke-width="3" stroke-linecap="round"/><text x="32" y="50" font-family="Georgia,serif" font-size="34" text-anchor="middle" fill="#f1ebe0">S</text></svg>`
fs.writeFileSync(path.join(pub, 'favicon.svg'), favicon)
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'))
await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'))

// og-image: салон 1200×630
{
  const buf = await unsplash(rooms['salon-1'], 2000)
  await sharp(buf).resize(1200, 630, { fit: 'cover', position: 'top' }).jpeg({ quality: 82 }).toFile(path.join(pub, 'og-image.jpg'))
  console.log('  og-image')
}
