// Проективное преобразование (гомография) плоскости потолка → пиксели фото.
// Плоскость задаётся в «пикселях плоскости» (PX на метр), фото — в своих пикселях (ширина 1600).

export const PX = 200 // пикселей плоскости на метр (1 px = 5 мм)

// Решение СЛАУ 8×8 методом Гаусса
function solve(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

// H (9 чисел, по строкам) такая, что dst ~ H · src
export function homography(src, dst) {
  const A = []
  const b = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const [u, v] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  }
  return [...solve(A, b), 1]
}

export function project(H, [x, y]) {
  const w = H[6] * x + H[7] * y + H[8]
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]
}

export function invert(H) {
  const [a, b, c, d, e, f, g, h, i] = H
  const A = e * i - f * h
  const B = -(d * i - f * g)
  const C = d * h - e * g
  const det = a * A + b * B + c * C
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map(
    (v) => v / det,
  )
}

// CSS matrix3d (по столбцам) для элемента с transform-origin: 0 0
export const toMatrix3d = (H) =>
  `matrix3d(${[H[0], H[3], 0, H[6], H[1], H[4], 0, H[7], 0, 0, 1, 0, H[2], H[5], 0, H[8]].map((v) => +v.toFixed(10)).join(',')})`

// Всё, что нужно рендеру сцены: H плоскость(м·PX) → фото, проекция метров, масштаб в точке.
export function sceneGeometry(scene) {
  const { w, d } = scene.size
  const plane = [[0, 0], [w * PX, 0], [w * PX, d * PX], [0, d * PX]]
  const H = homography(plane, scene.corners)
  const Hi = invert(H)
  const toImg = (mx, my) => project(H, [mx * PX, my * PX])
  const toPlane = (x, y) => {
    const [px, py] = project(Hi, [x, y])
    return [px / PX, py / PX]
  }
  // пикселей фото на метр в точке плоскости (по горизонтали и вертикали фото)
  const scaleAt = (mx, my) => {
    const e = 0.05
    const [x0, y0] = toImg(mx, my)
    const [x1, y1] = toImg(mx + e, my)
    const [x2, y2] = toImg(mx, my + e)
    return { sx: Math.hypot(x1 - x0, y1 - y0) / e, sy: Math.hypot(x2 - x0, y2 - y0) / e, dy: (y2 - y0) / e }
  }
  return { H, matrix: toMatrix3d(H), toImg, toPlane, scaleAt, planePx: { w: w * PX, h: d * PX } }
}

// Отражение относительно прямой p1–p2 → SVG matrix(a b c d e f)
export function mirrorMatrix([x1, y1], [x2, y2]) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const dx = (x2 - x1) / len
  const dy = (y2 - y1) / len
  const a = dx * dx - dy * dy
  const b = 2 * dx * dy
  const c = 2 * dx * dy
  const d = dy * dy - dx * dx
  const e = x1 - (a * x1 + c * y1)
  const f = y1 - (b * x1 + d * y1)
  return [a, b, c, d, e, f]
}

// Пересечение выпуклого полигона с прямоугольником (Sutherland–Hodgman)
export function clipToRect(poly, W, H) {
  const edges = [
    (p) => p[0] >= 0, (p) => p[0] <= W, (p) => p[1] >= 0, (p) => p[1] <= H,
  ]
  const inter = [
    (a, b) => lerpAt(a, b, (0 - a[0]) / (b[0] - a[0])),
    (a, b) => lerpAt(a, b, (W - a[0]) / (b[0] - a[0])),
    (a, b) => lerpAt(a, b, (0 - a[1]) / (b[1] - a[1])),
    (a, b) => lerpAt(a, b, (H - a[1]) / (b[1] - a[1])),
  ]
  let out = poly
  for (let k = 0; k < 4; k++) {
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      const ci = edges[k](cur)
      const pi = edges[k](prev)
      if (ci) {
        if (!pi) out.push(inter[k](prev, cur))
        out.push(cur)
      } else if (pi) out.push(inter[k](prev, cur))
    }
  }
  return out
}
const lerpAt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

export const pts = (poly) => poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
