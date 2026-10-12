// Карта освещённости потолка из исходного фото: берём яркость старого потолка, убираем мелкие
// тёмные детали (споты, шины, решётки — фильтр максимума), сильно размываем внутри маски потолка
// и нормируем. Новый потолок умножается на эту карту — получается реальное распределение света
// (светлее у окна, темнее в углах) без старых светильников.
const W = 400 // рабочая ширина канваса

function maxFilter(src, w, h, r, valid) {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let m = -1
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) {
        const i = y * w + k
        if (valid[i] && src[i] > m) m = src[i]
      }
      tmp[y * w + x] = m
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let m = -1
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) if (tmp[k * w + x] > m) m = tmp[k * w + x]
      out[y * w + x] = m
    }
  return out
}

function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    let s = 0
    for (let k = -r; k <= r; k++) s += src[y * w + Math.min(w - 1, Math.max(0, k))]
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = s / (2 * r + 1)
      s += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0
    for (let k = -r; k <= r; k++) s += tmp[Math.min(h - 1, Math.max(0, k)) * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / (2 * r + 1)
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
    }
  }
  return out
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// poly — полигон потолка в пикселях фото, occluders — массив полигонов
export async function shadingMap(src, image, poly, occluders = []) {
  const k = W / image.w
  const w = W
  const h = Math.round(image.h * k)
  const img = await loadImage(src)

  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const px = ctx.getImageData(0, 0, w, h).data

  // маска потолка (без окклюдеров)
  ctx.clearRect(0, 0, w, h)
  const path = (p) => {
    ctx.beginPath()
    p.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k)))
    ctx.closePath()
  }
  ctx.fillStyle = '#fff'
  path(poly)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  for (const o of occluders) {
    path(o)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  const md = ctx.getImageData(0, 0, w, h).data

  const n = w * h
  const L = new Float32Array(n)
  const mask = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    L[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]
    mask[i] = md[i * 4 + 3] / 255
  }
  // «ядро» маски — без пикселей у стыка со стенами (размытие краёв и антиалиасинг)
  const core = new Uint8Array(n)
  const er = 3
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let ok = mask[y * w + x] > 0.99
      for (let d = 1; ok && d <= er; d++)
        ok =
          (x - d < 0 || mask[y * w + x - d] > 0.99) &&
          (x + d >= w || mask[y * w + x + d] > 0.99) &&
          (y - d < 0 || mask[(y - d) * w + x] > 0.99) &&
          (y + d >= h || mask[(y + d) * w + x] > 0.99)
      core[y * w + x] = ok ? 1 : 0
    }

  const D = maxFilter(L, w, h, 5, core)
  const A = new Float32Array(n)
  const B = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    A[i] = core[i] && D[i] >= 0 ? D[i] : 0
    B[i] = core[i] && D[i] >= 0 ? 1 : 0
  }
  let a = A
  let b = B
  for (const r of [16, 12]) {
    a = boxBlur(a, w, h, r)
    b = boxBlur(b, w, h, r)
  }
  const S = new Float32Array(n)
  const vals = []
  for (let i = 0; i < n; i++) {
    S[i] = b[i] > 0.02 ? a[i] / b[i] : -1
    if (core[i] && S[i] > 0) vals.push(S[i])
  }
  if (!vals.length) return null
  vals.sort((p, q) => p - q)
  const ref = vals[Math.floor(vals.length * 0.96)] || 255
  const fallback = vals[Math.floor(vals.length * 0.5)] / ref

  const out = ctx.createImageData(w, h)
  for (let i = 0; i < n; i++) {
    let s = S[i] > 0 ? S[i] / ref : fallback
    s = Math.min(1, Math.max(0.42, s))
    s = 1 - (1 - s) * 0.92
    const g = Math.round(s * 255)
    out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = g
    out.data[i * 4 + 3] = Math.round(mask[i] * 255)
  }
  ctx.putImageData(out, 0, 0)
  return c.toDataURL('image/png')
}
