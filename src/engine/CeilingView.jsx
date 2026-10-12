import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PX, sceneGeometry, mirrorMatrix, clipToRect, pts } from './homography.js'
import { layout } from './layout.js'
import { shadingMap } from './shading.js'
import { byId, colors } from '../data/catalog.js'
import { roomImage, roomOriginal } from '../data/scenes.js'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// Оптика материалов: reflect — сила зеркального отражения, blur — его размытие (px фото),
// sheen — мягкий блик, grain — зерно поверхности.
const OPTICS = {
  matte: { reflect: 0, blur: 0, sheen: 0, grain: 0.05 },
  satin: { reflect: 0.13, blur: 7, sheen: 0.1, grain: 0.03 },
  gloss: { reflect: 0.3, blur: 1.4, sheen: 0.05, grain: 0 },
  blackGloss: { reflect: 0.5, blur: 1, sheen: 0.04, grain: 0, color: '#111113' },
  photoPrint: { reflect: 0, blur: 0, sheen: 0.04, grain: 0.02 },
  starSky: { reflect: 0.04, blur: 4, sheen: 0, grain: 0, color: '#0d1530' },
}

const LIGHT = {
  warm: { core: '#fff6e8', glow: '255,206,140', tint: '#ffd9ae' },
  neutral: { core: '#ffffff', glow: '255,240,222', tint: '#fff0de' },
}

// Детерминированный «рандом» для звёзд
function stars(w, h, n) {
  let s = 7
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  return Array.from({ length: n }, () => ({ x: rnd() * w, y: rnd() * h, r: 0.6 + rnd() * rnd() * 2.4, a: 0.35 + rnd() * 0.65 }))
}

const m2 = (v) => v * PX // метры → px плоскости

export default function CeilingView({ scene, cfg, before = null, onBeforeChange, className = '', draft = false }) {
  const { w: W, h: H } = scene.image
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const photo = scene.photo ?? roomImage(scene.id)
  const geo = useMemo(() => sceneGeometry(scene), [scene])
  const lay = useMemo(() => layout(scene, cfg), [scene, cfg])
  // полотно не выбрано — показываем исходное фото без нового потолка
  const hasCeiling = cfg.material !== 'none'
  const optics = OPTICS[cfg.material] ?? OPTICS.matte
  const fabricColor = optics.color ?? byId(colors, cfg.color).hex
  const night = cfg.mode === 'night'
  const L = LIGHT[cfg.temp] ?? LIGHT.warm

  // ---------- масштаб сцены под ширину контейнера ----------
  const box = useRef(null)
  const [k, setK] = useState(0)
  useIsoLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const update = () => setK(el.clientWidth / W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [W])

  // ---------- полигон потолка в кадре ----------
  const poly = useMemo(() => clipToRect(scene.corners, W, H), [scene.corners, W, H])

  // ---------- карта освещённости (в браузере) ----------
  const [shade, setShade] = useState(null)
  useEffect(() => {
    let alive = true
    setShade(null)
    const t = setTimeout(
      () =>
        shadingMap(photo, scene.image, scene.corners, scene.occluders)
          .then((url) => alive && setShade(url))
          .catch(() => {}),
      draft ? 250 : 0,
    )
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [photo, scene.image, scene.corners, scene.occluders, draft])

  // ---------- отражения (глянец) ----------
  const centroid = useMemo(() => geo.toImg(scene.size.w / 2, scene.size.d / 2), [geo, scene.size])
  const edges = {
    back: [scene.corners[0], scene.corners[1]],
    right: [scene.corners[1], scene.corners[2]],
    front: [scene.corners[2], scene.corners[3]],
    left: [scene.corners[3], scene.corners[0]],
  }
  const reflections =
    hasCeiling && optics.reflect
      ? (scene.reflect ?? ['back']).map((e) => {
          const [p1, p2] = edges[e]
          const mx = (p1[0] + p2[0]) / 2
          const my = (p1[1] + p2[1]) / 2
          let nx = -(p2[1] - p1[1])
          let ny = p2[0] - p1[0]
          const nl = Math.hypot(nx, ny)
          nx /= nl
          ny /= nl
          if (nx * (centroid[0] - mx) + ny * (centroid[1] - my) < 0) {
            nx = -nx
            ny = -ny
          }
          const fade = H * 0.42
          return { id: e, m: mirrorMatrix(p1, p2), g: [mx, my, mx + nx * fade, my + ny * fade] }
        })
      : []

  // ---------- сила света вечером ----------
  const q = lay.qty
  const power =
    q.spots * (cfg.spot === 'spotPrem' ? 1.1 : 1) +
    q.ledMeters * 1.3 +
    lay.tracks.reduce((s, t) => s + t.modules.length, 0) * 0.8 +
    (cfg.profile === 'floating' ? 6 : 0) +
    (lay.lamp ? 5 : 0) +
    (cfg.curtain === 'hiddenLux' && scene.window ? 3 : 0) +
    (cfg.material === 'starSky' ? 1.5 : 0)
  const bright = Math.min(0.82, 0.42 + power * 0.024)
  const baseFilter = night ? `brightness(${bright.toFixed(3)}) saturate(0.82) contrast(1.04)` : 'none'

  // ---------- кромка с карнизом ----------
  const win = cfg.curtain !== 'none' ? scene.window : null
  const pw = geo.planePx.w
  const ph = geo.planePx.h
  const curtainRect = (depth) =>
    win === 'left'
      ? { left: 0, top: 0, width: depth, height: ph }
      : win === 'right'
        ? { left: pw - depth, top: 0, width: depth, height: ph }
        : { left: 0, top: 0, width: pw, height: depth }

  const starList = useMemo(() => (cfg.material === 'starSky' ? stars(pw, ph, Math.round((pw * ph) / 2600)) : []), [cfg.material, pw, ph])

  // ---------- проекции для «излучающих» слоёв ----------
  const P = geo.toImg
  const spotPx = lay.spots.map((s) => ({ ...s, p: P(s.x, s.y), sc: geo.scaleAt(s.x, s.y) }))
  const ledPx = lay.led.map((l) => [P(l.x1, l.y1), P(l.x2, l.y2), geo.scaleAt((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2)])
  const trackSpots = lay.tracks.flatMap((t) =>
    t.modules.map((m) => {
      const x = t.x1 + (t.x2 - t.x1) * m.t
      const y = t.y1 + (t.y2 - t.y1) * m.t
      return { kind: m.kind, x, y, p: P(x, y), sc: geo.scaleAt(x, y) }
    }),
  )
  const edgeLine = (e) => edges[e]
  const lampPx = lay.lamp ? { p: P(lay.lamp.x, lay.lamp.y), sc: geo.scaleAt(lay.lamp.x, lay.lamp.y) } : null

  // ---------- сравнение «Przed / Po» ----------
  const dragging = useRef(false)
  const onPointer = (e) => {
    if (!dragging.current || !box.current) return
    const r = box.current.getBoundingClientRect()
    onBeforeChange?.(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
  }

  return (
    <div
      ref={box}
      className={`viewer ${night ? 'is-night' : ''} ${className}`}
      style={{ aspectRatio: `${W} / ${H}`, '--ar': W / H }}
      onPointerMove={onPointer}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* Фото как запасной вариант до расчёта масштаба (SSR, первый кадр) */}
      {!k && <img className="viewer__fallback" src={photo} alt="" width={W} height={H} />}
      <div className="stage" style={{ width: W, height: H, transform: `scale(${k})`, visibility: k ? 'visible' : 'hidden' }}>
        <div className="stage__base" style={{ filter: baseFilter }}>
          <img className="stage__photo" src={photo} alt={`${scene.name} — wizualizacja sufitu napinanego`} width={W} height={H} />

          {/* ===== Плоскость потолка ===== */}
          {hasCeiling && (
            <div className="plane" style={{ width: pw, height: ph, transform: geo.matrix }}>
              <div className="plane__fabric" style={{ background: fabricColor }}>
                {cfg.material === 'photoPrint' && <div className="plane__print" style={{ backgroundImage: `url(/textures/${cfg.print}.webp)` }} />}
                {optics.sheen > 0 && <div className="plane__sheen" style={{ opacity: optics.sheen }} />}
                {optics.grain > 0 && <div className="plane__grain" style={{ opacity: optics.grain }} />}
                {cfg.material === 'starSky' && (
                  <svg className="plane__stars" width={pw} height={ph}>
                    {starList.map((s, i) => (
                      <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.8} fill="#cfd8ff" opacity={s.a * 0.55} />
                    ))}
                  </svg>
                )}
              </div>

              {/* Линии LED (днём — матовый рассеиватель) */}
              {lay.led.map((l, i) => (
                <div key={i} className="led" style={lineStyle(l, 0.05)} />
              ))}

              {/* Магнитные шины */}
              {lay.tracks.map((t, i) => (
                <div key={i} className="track" style={lineStyle(t, 0.045)} />
              ))}
              {trackSpots.map((m, i) =>
                m.kind === 'spot' ? (
                  <div key={i} className="track-spot" style={dot(m.x, m.y, 0.065)} />
                ) : (
                  <div key={i} className="track-line" style={{ ...dot(m.x, m.y, 0.03), height: m2(0.3), marginTop: -m2(0.15) }} />
                ),
              )}

              {/* Точечные светильники */}
              {lay.spots.map((s, i) => (
                <div
                  key={i}
                  className={`spot spot--${cfg.spot === 'spotPrem' ? `prem-${cfg.spotStyle}` : cfg.spotStyle}`}
                  style={dot(s.x, s.y, cfg.spot === 'spotPrem' ? 0.095 : 0.085)}
                >
                  <i />
                </div>
              ))}

              {/* Плафон (лампа standard) — накладной диск */}
              {lay.lamp?.type === 'chandStd' && <div className="plafond" style={dot(lay.lamp.x, lay.lamp.y, 0.55)} />}

              {/* Карниз */}
              {win && cfg.curtain === 'stdCurtain' && <div className="curtain-rail" style={railStyle(win, pw, ph)} />}
              {win && cfg.curtain !== 'stdCurtain' && <div className={`curtain-niche curtain-niche--${win}`} style={curtainRect(m2(0.17))} />}

              {/* Профиль по периметру */}
              <div className={`profile profile--${cfg.profile}`} />
            </div>
          )}

          {/* ===== Освещённость исходного потолка ===== */}
          {hasCeiling && shade && <img className="stage__shade" src={shade} alt="" width={W} height={H} />}

          {/* ===== Отражения глянца и «передние» предметы ===== */}
          <svg className="stage__svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
            <defs>
              <clipPath id={`ceil-${uid}`}>
                <polygon points={pts(poly)} />
              </clipPath>
              <filter id={`rblur-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation={optics.blur || 1} />
              </filter>
              {reflections.map((r) => (
                <linearGradient key={r.id} id={`rg-${uid}-${r.id}`} gradientUnits="userSpaceOnUse" x1={r.g[0]} y1={r.g[1]} x2={r.g[2]} y2={r.g[3]}>
                  <stop offset="0" stopColor="#fff" stopOpacity="1" />
                  <stop offset="0.55" stopColor="#fff" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              ))}
              {reflections.map((r) => (
                <mask key={r.id} id={`rm-${uid}-${r.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                  <rect width={W} height={H} fill={`url(#rg-${uid}-${r.id})`} />
                </mask>
              ))}
              {scene.occluders.map((o, i) => (
                <clipPath key={i} id={`occ-${uid}-${i}`}>
                  <polygon points={pts(o)} />
                </clipPath>
              ))}
            </defs>

            {reflections.length > 0 && (
              <g clipPath={`url(#ceil-${uid})`} opacity={optics.reflect}>
                {reflections.map((r) => (
                  <g key={r.id} mask={`url(#rm-${uid}-${r.id})`}>
                    <image href={photo} width={W} height={H} transform={`matrix(${r.m.join(' ')})`} filter={`url(#rblur-${uid})`} />
                  </g>
                ))}
              </g>
            )}

            {/* Люстра premium — кольца на тросах */}
            {lay.lamp?.type === 'chandPrem' && lampPx && <RingLamp lamp={lampPx} night={false} uid={uid} />}

            {scene.occluders.map((o, i) => (
              <image key={i} href={photo} width={W} height={H} clipPath={`url(#occ-${uid}-${i})`} />
            ))}
          </svg>
          {night && <div className="stage__tint" style={{ background: power > 0 ? L.tint : '#c4cce0' }} />}
        </div>

        {/* ===== Излучающие элементы (вечер) — поверх затемнённой сцены ===== */}
        {night && (
          <>
            <div className="plane plane--emit" style={{ width: pw, height: ph, transform: geo.matrix, '--core': L.core, '--glow': L.glow }}>
              {lay.spots.map((s, i) => (
                <div key={i} className={`emit-spot ${cfg.spotStyle === 'square' && cfg.spot === 'spotStd' ? 'is-square' : ''}`} style={dot(s.x, s.y, 0.05)} />
              ))}
              {trackSpots
                .filter((m) => m.kind === 'spot')
                .map((m, i) => (
                  <div key={i} className="emit-spot" style={dot(m.x, m.y, 0.032)} />
                ))}
              {trackSpots
                .filter((m) => m.kind === 'line')
                .map((m, i) => (
                  <div key={i} className="emit-line" style={{ ...dot(m.x, m.y, 0.016), height: m2(0.28), marginTop: -m2(0.14) }} />
                ))}
              {lay.led.map((l, i) => (
                <div key={i} className="emit-led" style={lineStyle(l, 0.04)} />
              ))}
              {lay.lamp?.type === 'chandStd' && <div className="emit-plafond" style={dot(lay.lamp.x, lay.lamp.y, 0.5)} />}
              {cfg.material === 'starSky' && (
                <svg className="plane__stars" width={pw} height={ph}>
                  {starList.map((s, i) => (
                    <circle
                      key={i}
                      cx={s.x}
                      cy={s.y}
                      r={s.r}
                      fill="#fff"
                      opacity={s.a}
                      className={i % 5 === 0 ? 'twinkle' : undefined}
                      style={{ animationDelay: `${(i % 13) * 0.37}s` }}
                    />
                  ))}
                </svg>
              )}
              {cfg.profile === 'floating' && <div className="emit-profile" />}
              {win && cfg.curtain === 'hiddenLux' && <div className={`emit-niche emit-niche--${win}`} style={curtainRect(m2(0.17))} />}
            </div>

            <svg className="stage__emit" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" style={{ '--glow': L.glow }}>
              <defs>
                <radialGradient id={`halo-${uid}`}>
                  <stop offset="0" stopColor={`rgb(${L.glow})`} stopOpacity="0.9" />
                  <stop offset="0.25" stopColor={`rgb(${L.glow})`} stopOpacity="0.35" />
                  <stop offset="1" stopColor={`rgb(${L.glow})`} stopOpacity="0" />
                </radialGradient>
                <filter id={`gl1-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <filter id={`gl2-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="34" />
                </filter>
              </defs>
              {/* мягкое общее освещение от светильников */}
              {[...spotPx, ...trackSpots.filter((m) => m.kind === 'spot')].map((s, i) => (
                <g key={i}>
                  <ellipse cx={s.p[0]} cy={s.p[1] + s.sc.sx * 0.25} rx={s.sc.sx * 0.9} ry={s.sc.sx * 1.1} fill={`url(#halo-${uid})`} opacity="0.32" />
                  <ellipse cx={s.p[0]} cy={s.p[1]} rx={s.sc.sx * 0.16} ry={s.sc.sy * 0.16 + 3} fill={`url(#halo-${uid})`} opacity="0.9" />
                </g>
              ))}
              {ledPx.map(([a, b, sc], i) => (
                <g key={i}>
                  <line
                    x1={a[0]}
                    y1={a[1]}
                    x2={b[0]}
                    y2={b[1]}
                    stroke={`rgb(${L.glow})`}
                    strokeWidth={sc.sx * 0.35}
                    strokeLinecap="round"
                    opacity="0.28"
                    filter={`url(#gl2-${uid})`}
                  />
                  <line
                    x1={a[0]}
                    y1={a[1]}
                    x2={b[0]}
                    y2={b[1]}
                    stroke={`rgb(${L.glow})`}
                    strokeWidth={sc.sx * 0.06 + 2}
                    strokeLinecap="round"
                    opacity="0.7"
                    filter={`url(#gl1-${uid})`}
                  />
                </g>
              ))}
              {cfg.profile === 'floating' &&
                ['back', 'left', 'right'].map((e) => {
                  const [a, b] = edgeLine(e)
                  return (
                    <g key={e} clipPath={undefined}>
                      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={`rgb(${L.glow})`} strokeWidth="70" opacity="0.32" filter={`url(#gl2-${uid})`} />
                      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={`rgb(${L.glow})`} strokeWidth="10" opacity="0.65" filter={`url(#gl1-${uid})`} />
                    </g>
                  )
                })}
              {win &&
                cfg.curtain === 'hiddenLux' &&
                (() => {
                  const [a, b] = edgeLine(win)
                  return (
                    <g>
                      <line
                        x1={a[0]}
                        y1={a[1] + 40}
                        x2={b[0]}
                        y2={b[1] + 40}
                        stroke={`rgb(${L.glow})`}
                        strokeWidth="110"
                        opacity="0.3"
                        filter={`url(#gl2-${uid})`}
                      />
                      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={`rgb(${L.glow})`} strokeWidth="14" opacity="0.6" filter={`url(#gl1-${uid})`} />
                    </g>
                  )
                })()}
              {lampPx && lay.lamp.type === 'chandStd' && (
                <ellipse
                  cx={lampPx.p[0]}
                  cy={lampPx.p[1] + lampPx.sc.sx * 0.3}
                  rx={lampPx.sc.sx * 1.6}
                  ry={lampPx.sc.sx * 1.4}
                  fill={`url(#halo-${uid})`}
                  opacity="0.55"
                />
              )}
              {lampPx && lay.lamp.type === 'chandPrem' && <RingLamp lamp={lampPx} night glow={L.glow} uid={uid} />}
            </svg>
          </>
        )}

        {/* ===== Przed / Po ===== */}
        {before !== null && (
          <img
            className="stage__before"
            src={scene.photo ?? roomOriginal(scene)}
            alt=""
            width={W}
            height={H}
            style={{ clipPath: `inset(0 ${((1 - before) * 100).toFixed(2)}% 0 0)` }}
          />
        )}
      </div>

      {before !== null && (
        <div className="compare" style={{ left: `${before * 100}%` }}>
          <button
            type="button"
            className="compare__handle"
            aria-label="Przesuń, aby porównać przed i po"
            onPointerDown={(e) => {
              dragging.current = true
              e.currentTarget.setPointerCapture?.(e.pointerId)
            }}
            onPointerMove={onPointer}
            onPointerUp={() => (dragging.current = false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') onBeforeChange?.(Math.max(0, before - 0.05))
              if (e.key === 'ArrowRight') onBeforeChange?.(Math.min(1, before + 0.05))
            }}
          >
            <span aria-hidden="true">‹ ›</span>
          </button>
          <span className="compare__label compare__label--l">Przed</span>
          <span className="compare__label compare__label--r">Po</span>
        </div>
      )}
    </div>
  )
}

// ---------- помощники стилей плоскости ----------
function dot(x, y, size) {
  const s = m2(size)
  return { left: m2(x) - s / 2, top: m2(y) - s / 2, width: s, height: s }
}

function lineStyle(l, thick) {
  const x1 = m2(l.x1)
  const y1 = m2(l.y1)
  const x2 = m2(l.x2)
  const y2 = m2(l.y2)
  const length = Math.hypot(x2 - x1, y2 - y1)
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const t = m2(thick)
  return {
    left: x1,
    top: y1 - t / 2,
    width: length,
    height: t,
    transform: `rotate(${angle}rad)`,
    transformOrigin: `0 ${t / 2}px`,
  }
}

function railStyle(win, pw, ph) {
  const off = m2(0.12)
  const t = m2(0.05)
  if (win === 'left') return { left: off, top: 0, width: t, height: ph }
  if (win === 'right') return { left: pw - off - t, top: 0, width: t, height: ph }
  return { left: 0, top: off, width: pw, height: t }
}

// Люстра premium: два кольца LED, подвешенные под потолком
function RingLamp({ lamp, night, glow, uid }) {
  const [x, y] = lamp.p
  const s = lamp.sc.sx
  const flat = Math.min(0.42, Math.max(0.1, (lamp.sc.sy / lamp.sc.sx) * 0.7))
  const rings = [
    { r: 0.36, drop: 0.55 },
    { r: 0.25, drop: 0.72 },
  ]
  if (night)
    return (
      <g>
        {rings.map((g, i) => (
          <g key={i}>
            <ellipse
              cx={x}
              cy={y + g.drop * s}
              rx={g.r * s}
              ry={g.r * s * flat}
              fill="none"
              stroke={`rgb(${glow})`}
              strokeWidth={s * 0.08}
              opacity="0.5"
              filter={`url(#gl1-${uid})`}
            />
            <ellipse cx={x} cy={y + g.drop * s} rx={g.r * s} ry={g.r * s * flat} fill="none" stroke="#fff8ee" strokeWidth={Math.max(1.5, s * 0.012)} />
          </g>
        ))}
        <ellipse cx={x} cy={y + 0.62 * s} rx={s * 1.5} ry={s * 1.2} fill={`url(#halo-${uid})`} opacity="0.45" />
      </g>
    )
  return (
    <g>
      {rings.map((g, i) => {
        const cy = y + g.drop * s
        const rx = g.r * s
        return (
          <g key={i}>
            <line x1={x - rx * 0.7} y1={y} x2={x - rx * 0.7} y2={cy} stroke="#3a3530" strokeWidth="0.8" opacity="0.7" />
            <line x1={x + rx * 0.7} y1={y} x2={x + rx * 0.7} y2={cy} stroke="#3a3530" strokeWidth="0.8" opacity="0.7" />
            <ellipse cx={x} cy={cy} rx={rx} ry={rx * flat} fill="none" stroke="#2a2522" strokeWidth={Math.max(2, s * 0.022)} />
            <ellipse
              cx={x}
              cy={cy + Math.max(1, s * 0.008)}
              rx={rx}
              ry={rx * flat}
              fill="none"
              stroke="#e9e3d8"
              strokeWidth={Math.max(1, s * 0.008)}
              opacity="0.8"
            />
          </g>
        )
      })}
      <circle cx={x} cy={y} r={Math.max(2.5, s * 0.04)} fill="#2a2522" />
    </g>
  )
}
