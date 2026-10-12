// Редактор разметки сцен: /?editor
// Перетащите 4 угла потолка (0 — задний-левый, 1 — задний-правый, 2 — передний-правый, 3 — передний-левый),
// задайте размеры, окно, зону светильников и окклюдеры, затем скопируйте JSON в src/data/scenes.js.
import { useMemo, useRef, useState } from 'react'
import CeilingView from '../engine/CeilingView.jsx'
import { sceneGeometry, pts } from '../engine/homography.js'
import { scenes, roomImage } from '../data/scenes.js'
import { defaults } from '../state/useConfig.js'

const clone = (o) => JSON.parse(JSON.stringify(o))
const round = (p) => p.map((v) => Math.round(v))

export default function Editor() {
  const [scene, setScene] = useState(() => clone(scenes[0]))
  const [pad, setPad] = useState(600)
  const [mode, setMode] = useState(null) // null | 'occluder'
  const [draftOcc, setDraftOcc] = useState([])
  const [test, setTest] = useState('gloss')
  const svg = useRef(null)
  const drag = useRef(null)
  const { w: W, h: H } = scene.image
  const photo = scene.photo ?? roomImage(scene.id)

  const valid = useMemo(() => {
    try {
      const g = sceneGeometry(scene)
      return g.H.every(Number.isFinite) ? g : null
    } catch {
      return null
    }
  }, [scene])

  const toSvg = (e) => {
    const p = svg.current.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const r = p.matrixTransform(svg.current.getScreenCTM().inverse())
    return [r.x, r.y]
  }

  const update = (fn) => setScene((s) => fn(clone(s)))

  const onMove = (e) => {
    if (!drag.current) return
    const [x, y] = round(toSvg(e))
    const d = drag.current
    update((s) => {
      if (d.type === 'corner') s.corners[d.i] = [x, y]
      if (d.type === 'occ') s.occluders[d.o][d.i] = [x, y]
      if (d.type === 'lamp' && valid) s.lamp = valid.toPlane(x, y).map((v) => Math.round(v * 100) / 100)
      return s
    })
  }

  const onClick = (e) => {
    if (mode !== 'occluder') return
    setDraftOcc((o) => [...o, round(toSvg(e))])
  }

  const finishOcc = () => {
    if (draftOcc.length >= 3) update((s) => ({ ...s, occluders: [...s.occluders, draftOcc] }))
    setDraftOcc([])
    setMode(null)
  }

  const loadFile = (file) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () =>
      update((s) => ({
        ...s,
        id: file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        photo: url,
        image: { w: 1600, h: Math.round((img.naturalHeight * 1600) / img.naturalWidth) },
        occluders: [],
      }))
    img.src = url
  }

  // сетка плоскости (каждые 0,5 м) и зона светильников
  const grid = []
  if (valid) {
    for (let x = 0; x <= scene.size.w + 1e-6; x += 0.5) grid.push([valid.toImg(x, 0), valid.toImg(x, scene.size.d)])
    for (let y = 0; y <= scene.size.d + 1e-6; y += 0.5) grid.push([valid.toImg(0, y), valid.toImg(scene.size.w, y)])
  }
  const z = scene.zone
  const zonePoly = valid && z ? [valid.toImg(z.x0, z.y0), valid.toImg(z.x1, z.y0), valid.toImg(z.x1, z.y1), valid.toImg(z.x0, z.y1)] : null
  const lampPt = valid && scene.lamp ? valid.toImg(...scene.lamp) : null

  const out = { ...scene }
  delete out.photo
  const json = JSON.stringify(out, null, 2)
    .replace(/\[\s+(-?\d+),\s+(-?\d+)\s+\]/g, '[$1, $2]')
    .replace(/\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]/g, '[$1, $2]')

  const testCfg = {
    ...defaults,
    material: test,
    color: test === 'gloss' ? 'graphite' : 'white',
    spot: 'spotStd',
    spotCount: 6,
    led: 'parallel',
    profile: 'shadowStandard',
    curtain: 'hiddenPrem',
    lamp: 'chandPrem',
  }

  const num = (path, v) =>
    update((s) => {
      const [a, b] = path
      s[a][b] = Number(v)
      return s
    })

  return (
    <div className="editor">
      <aside className="editor__side">
        <h1>Edytor sceny</h1>
        <label>
          Scena
          <select value={scenes.some((s) => s.id === scene.id) ? scene.id : ''} onChange={(e) => setScene(clone(scenes.find((s) => s.id === e.target.value)))}>
            <option value="" disabled>
              (własne zdjęcie)
            </option>
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Własne zdjęcie
          <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && loadFile(e.target.files[0])} />
        </label>
        <label>
          Zoom (margines {pad}px)
          <input type="range" min="0" max="3000" step="100" value={pad} onChange={(e) => setPad(+e.target.value)} />
        </label>
        <fieldset>
          <legend>Rozmiar płaszczyzny, m</legend>
          <input type="number" step="0.1" value={scene.size.w} onChange={(e) => num(['size', 'w'], e.target.value)} aria-label="szerokość" />
          ×
          <input type="number" step="0.1" value={scene.size.d} onChange={(e) => num(['size', 'd'], e.target.value)} aria-label="głębokość" />
        </fieldset>
        <fieldset>
          <legend>Strefa opraw (x0 y0 x1 y1), m</legend>
          {['x0', 'y0', 'x1', 'y1'].map((k) => (
            <input key={k} type="number" step="0.1" value={scene.zone[k]} onChange={(e) => num(['zone', k], e.target.value)} aria-label={k} />
          ))}
        </fieldset>
        <label>
          Okno (karnisz)
          <select value={scene.window ?? ''} onChange={(e) => update((s) => ({ ...s, window: e.target.value || null }))}>
            <option value="">brak</option>
            <option value="back">back</option>
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
        </label>
        <fieldset>
          <legend>Odbicia od krawędzi</legend>
          {['back', 'left', 'right'].map((e) => (
            <label key={e} className="inline">
              <input
                type="checkbox"
                checked={scene.reflect.includes(e)}
                onChange={(ev) => update((s) => ({ ...s, reflect: ev.target.checked ? [...s.reflect, e] : s.reflect.filter((x) => x !== e) }))}
              />
              {e}
            </label>
          ))}
        </fieldset>
        <div className="editor__btns">
          {mode === 'occluder' ? (
            <button type="button" onClick={finishOcc}>
              Zakończ okluder ({draftOcc.length} pkt)
            </button>
          ) : (
            <button type="button" onClick={() => setMode('occluder')}>
              + Okluder (klikaj punkty)
            </button>
          )}
          {scene.occluders.length > 0 && (
            <button type="button" onClick={() => update((s) => ({ ...s, occluders: s.occluders.slice(0, -1) }))}>
              Usuń ostatni okluder
            </button>
          )}
        </div>
        <label>
          Test płótna
          <select value={test} onChange={(e) => setTest(e.target.value)}>
            <option value="gloss">połysk grafit</option>
            <option value="matte">mat biały</option>
            <option value="satin">satyna biała</option>
          </select>
        </label>
        <textarea readOnly value={json} rows={16} onFocus={(e) => e.target.select()} />
        <button type="button" onClick={() => navigator.clipboard.writeText(json)}>
          Kopiuj JSON
        </button>
      </aside>

      <div className="editor__main">
        <svg
          ref={svg}
          className="editor__svg"
          viewBox={`${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}`}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          onClick={onClick}
        >
          <rect x={-pad} y={-pad} width={W + 2 * pad} height={H + 2 * pad} fill="#222" />
          <image href={photo} width={W} height={H} />
          <polygon points={pts(scene.corners)} fill="rgba(217,164,65,.18)" stroke="#d9a441" strokeWidth={2 + pad / 300} />
          <line x1={scene.corners[0][0]} y1={scene.corners[0][1]} x2={scene.corners[1][0]} y2={scene.corners[1][1]} stroke="#ff4d4d" strokeWidth={3 + pad / 300} />
          {grid.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7fd3ff" strokeWidth="1" opacity=".55" />
          ))}
          {zonePoly && <polygon points={pts(zonePoly)} fill="none" stroke="#7CFC00" strokeDasharray="8 6" strokeWidth="2" />}
          {scene.occluders.map((o, oi) => (
            <g key={oi}>
              <polygon points={pts(o)} fill="rgba(255,0,180,.25)" stroke="#ff00b4" strokeWidth="2" />
              {o.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={6 + pad / 200} fill="#ff00b4" onPointerDown={() => (drag.current = { type: 'occ', o: oi, i })} style={{ cursor: 'move' }} />
              ))}
            </g>
          ))}
          {draftOcc.length > 0 && <polyline points={pts(draftOcc)} fill="none" stroke="#ff00b4" strokeWidth="2" strokeDasharray="4 4" />}
          {scene.corners.map((p, i) => (
            <g key={i} onPointerDown={() => (drag.current = { type: 'corner', i })} style={{ cursor: 'move' }}>
              <circle cx={p[0]} cy={p[1]} r={10 + pad / 120} fill="#d9a441" stroke="#000" strokeWidth="2" />
              <text x={p[0]} y={p[1] + 5 + pad / 400} textAnchor="middle" fontSize={14 + pad / 120} fontWeight="700">
                {i}
              </text>
            </g>
          ))}
          {lampPt && (
            <circle cx={lampPt[0]} cy={lampPt[1]} r={9 + pad / 200} fill="#7CFC00" stroke="#000" onPointerDown={() => (drag.current = { type: 'lamp' })} style={{ cursor: 'move' }} />
          )}
        </svg>
        <p className="editor__hint">
          Złote punkty — narożniki płaszczyzny sufitu (czerwona krawędź = tylna ściana, 0→1). Niebieska siatka co 0,5 m, zielona ramka — strefa
          opraw, zielony punkt — lampa.
        </p>
        {valid && <CeilingView scene={scene} cfg={testCfg} draft />}
      </div>
    </div>
  )
}
