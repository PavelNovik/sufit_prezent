// Раскладка светильников на плоскости потолка (в метрах) по выбранной конфигурации и зоне сцены.
// Возвращает примитивы для рендера и количества для сводки / калькулятора.

const r2 = (v) => Math.round(v * 100) / 100
const len = (l) => Math.hypot(l.x2 - l.x1, l.y2 - l.y1)

function grid(n, zw, zd) {
  let best = [1, n]
  let score = Infinity
  for (let r = 1; r <= n; r++) {
    if (n % r) continue
    const c = n / r
    const s = Math.abs(Math.log(zw / c / (zd / r)))
    if (s < score) {
      score = s
      best = [r, c]
    }
  }
  return best
}

export function layout(scene, cfg) {
  const z = scene.zone ?? { x0: 0, y0: 0, x1: scene.size.w, y1: scene.size.d }
  const zw = z.x1 - z.x0
  const zd = z.y1 - z.y0
  const cx = z.x0 + zw / 2
  const along = zd >= zw * 0.9 // длинная сторона — вглубь

  // Споты
  const spots = []
  if (cfg.spot !== 'none') {
    const [r, c] = grid(cfg.spotCount, zw, zd)
    for (let j = 0; j < r; j++)
      for (let i = 0; i < c; i++) spots.push({ x: z.x0 + (zw * (i + 0.5)) / c, y: z.y0 + (zd * (j + 0.5)) / r })
  }

  // Линии LED
  const led = []
  const m = Math.min(0.4, zw * 0.18)
  if (cfg.led === 'single') {
    if (along) led.push({ x1: cx, y1: z.y0 + 0.35, x2: cx, y2: z.y1 - 0.15 })
    else led.push({ x1: z.x0 + m, y1: z.y0 + zd * 0.5, x2: z.x1 - m, y2: z.y0 + zd * 0.5 })
  } else if (cfg.led === 'parallel') {
    for (const f of [0.22, 0.5, 0.78]) led.push({ x1: z.x0 + m, y1: z.y0 + zd * f, x2: z.x1 - m, y2: z.y0 + zd * f })
  } else if (cfg.led === 'frame') {
    const i = Math.min(0.45, zw * 0.2)
    const a = { x: z.x0 + i, y: z.y0 + i * 0.8 }
    const b = { x: z.x1 - i, y: z.y1 - i * 0.6 }
    led.push(
      { x1: a.x, y1: a.y, x2: b.x, y2: a.y },
      { x1: b.x, y1: a.y, x2: b.x, y2: b.y },
      { x1: b.x, y1: b.y, x2: a.x, y2: b.y },
      { x1: a.x, y1: b.y, x2: a.x, y2: a.y },
    )
  }

  // Магнитная шина: вдоль глубины; модули — споты и короткие линейные
  const tracks = []
  if (cfg.track !== 'none') {
    const xs = cfg.track === 'double' ? [z.x0 + zw * 0.3, z.x0 + zw * 0.7] : [cx]
    for (const x of xs) {
      const t = { x1: x, y1: z.y0 + 0.3, x2: x, y2: z.y1 - 0.1, modules: [] }
      const L = len(t)
      const n = Math.max(2, Math.round(L / 0.55))
      for (let k = 0; k < n; k++) t.modules.push({ t: (k + 0.5) / n, kind: k % 3 === 1 ? 'line' : 'spot' })
      tracks.push(t)
    }
  }

  const lamp = cfg.lamp !== 'none' && scene.lamp ? { x: scene.lamp[0], y: scene.lamp[1], type: cfg.lamp } : null

  const curtainLen = scene.window ? (scene.window === 'back' ? scene.size.w : scene.size.d) : 0

  return {
    spots,
    led,
    tracks,
    lamp,
    qty: {
      area: r2(scene.size.w * scene.size.d),
      perimeter: r2(2 * (scene.size.w + scene.size.d)),
      spots: spots.length,
      ledMeters: r2(led.reduce((s, l) => s + len(l), 0)),
      trackMeters: r2(tracks.reduce((s, l) => s + len(l), 0)),
      curtainMeters: cfg.curtain !== 'none' ? r2(curtainLen) : 0,
      lamps: lamp ? 1 : 0,
    },
  }
}
