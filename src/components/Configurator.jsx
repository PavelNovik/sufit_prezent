import { useMemo, useRef, useState } from 'react'
import CeilingView from '../engine/CeilingView.jsx'
import { layout } from '../engine/layout.js'
import { scenes, roomTypes, sceneById, roomThumb } from '../data/scenes.js'
import {
  materials, colors, prints, profiles, curtains, spotTypes, spotStyles, spotCounts, lamps, ledLayouts,
  trackLayouts, temperatures, lightInfo, byId, catalogPhoto,
} from '../data/catalog.js'
import { brand, tel } from '../config.js'
import { toQuery, extras } from '../state/useConfig.js'
import Icon from './Icon.jsx'

const steps = [
  { id: 'room', label: 'Pomieszczenie' },
  { id: 'fabric', label: 'Płótno' },
  { id: 'profile', label: 'Profil' },
  { id: 'light', label: 'Oświetlenie' },
  { id: 'curtain', label: 'Karnisz' },
  { id: 'summary', label: 'Podsumowanie' },
]

export default function Configurator({ cfg, set, step, setStep }) {
  const scene = sceneById(cfg.scene)
  const [before, setBefore] = useState(null)
  const idx = steps.findIndex((s) => s.id === step)
  const panel = useRef(null)

  const go = (i) => {
    setStep(steps[Math.max(0, Math.min(steps.length - 1, i))].id)
    panel.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const sceneIdx = scenes.findIndex((s) => s.id === scene.id)
  const shiftScene = (d) => set({ scene: scenes[(sceneIdx + d + scenes.length) % scenes.length].id })

  return (
    <div className="config">
      <div className="config__view">
        <div className="viewbar">
          <div className="viewbar__scene">
            <button type="button" className="icon-btn" onClick={() => shiftScene(-1)} aria-label="Poprzednie pomieszczenie">
              <Icon name="chevron-left" />
            </button>
            <span>
              <b>{scene.name}</b> <em>{scene.variant}</em>
            </span>
            <button type="button" className="icon-btn" onClick={() => shiftScene(1)} aria-label="Następne pomieszczenie">
              <Icon name="chevron-right" />
            </button>
          </div>
          <div className="viewbar__tools">
            <div className="seg" role="group" aria-label="Pora dnia">
              <button type="button" aria-pressed={cfg.mode === 'day'} onClick={() => set({ mode: 'day' })}>
                <Icon name="sun" /> Dzień
              </button>
              <button type="button" aria-pressed={cfg.mode === 'night'} onClick={() => set({ mode: 'night' })}>
                <Icon name="moon" /> Wieczór
              </button>
            </div>
            <button type="button" className="chip" aria-pressed={before !== null} onClick={() => setBefore(before === null ? 0.5 : null)}>
              <Icon name="compare" /> Przed / po
            </button>
          </div>
        </div>
        <CeilingView scene={scene} cfg={cfg} before={before} onBeforeChange={setBefore} />
        <p className="config__note">
          Wizualizacja poglądowa — kolory i oświetlenie na ekranie mogą się różnić od rzeczywistych. Próbki płócien pokażemy na pomiarze.
        </p>
      </div>

      <div className="config__panel" ref={panel}>
        <ol className="steps" aria-label="Kroki konfiguratora">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button type="button" aria-current={s.id === step ? 'step' : undefined} className={i < idx ? 'is-done' : ''} onClick={() => go(i)}>
                <span className="steps__n">{i + 1}</span>
                <span className="steps__l">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="panel">
          {step === 'room' && <RoomStep cfg={cfg} set={set} />}
          {step === 'fabric' && <FabricStep cfg={cfg} set={set} />}
          {step === 'profile' && <ProfileStep cfg={cfg} set={set} />}
          {step === 'light' && <LightStep cfg={cfg} set={set} />}
          {step === 'curtain' && <CurtainStep cfg={cfg} set={set} scene={scene} />}
          {step === 'summary' && <Summary cfg={cfg} scene={scene} />}
        </div>

        <div className="panel__nav">
          <button type="button" className="btn btn--ghost" disabled={idx === 0} onClick={() => go(idx - 1)}>
            <Icon name="chevron-left" /> Wstecz
          </button>
          {idx < steps.length - 1 ? (
            <button type="button" className="btn btn--gold" onClick={() => go(idx + 1)}>
              {steps[idx + 1].label} <Icon name="chevron-right" />
            </button>
          ) : (
            <a className="btn btn--gold" href={brand.calcUrl}>
              Oblicz cenę <Icon name="arrow-right" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- шаги ----------
function StepHead({ title, text }) {
  return (
    <header className="panel__head">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </header>
  )
}

function OptionCard({ active, onClick, name, text, photo, badge }) {
  return (
    <button type="button" className="opt" aria-pressed={active} onClick={onClick}>
      {photo ? (
        <img className="opt__img" src={catalogPhoto(photo)} alt="" width="160" height="160" loading="lazy" />
      ) : (
        <span className="opt__img opt__img--empty" aria-hidden="true">
          <Icon name="none" />
        </span>
      )}
      <span className="opt__body">
        <span className="opt__name">
          {name}
          {badge && <small>{badge}</small>}
        </span>
        {text && <span className="opt__text">{text}</span>}
      </span>
      <span className="opt__check" aria-hidden="true">
        <Icon name="check" />
      </span>
    </button>
  )
}

function Chips({ label, items, value, onChange, render }) {
  return (
    <div className="chips" role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" role="radio" aria-checked={value === it.id} className="chip" onClick={() => onChange(it.id)}>
          {render ? render(it) : it.name}
        </button>
      ))}
    </div>
  )
}

function RoomStep({ cfg, set }) {
  return (
    <>
      <StepHead title="Wybierz pomieszczenie" text="Zacznij od wnętrza — każde pomieszczenie ma kilka ujęć (z oknem i bez). Potem dobierzesz płótno, profil, oświetlenie i karnisz." />
      {roomTypes.map((t) => (
        <section key={t.id} className="room-group">
          <h4>{t.name}</h4>
          <div className="rooms">
            {scenes
              .filter((s) => s.type === t.id)
              .map((s) => (
                <button key={s.id} type="button" className="room" aria-pressed={cfg.scene === s.id} onClick={() => set({ scene: s.id })}>
                  <img src={roomThumb(s.id)} alt="" width="240" height="160" loading="lazy" />
                  <span>{s.variant}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </>
  )
}

function FabricStep({ cfg, set }) {
  const mat = byId(materials, cfg.material)
  return (
    <>
      <StepHead title="Płótno" text="Faktura decyduje o tym, jak sufit odbija światło. Kolor dobierzesz poniżej. „Obecny sufit” pokazuje zdjęcie bez zmian." />
      <div className="opts">
        {materials.map((m) => (
          <OptionCard key={m.id} active={cfg.material === m.id} onClick={() => set(m.id === 'none' ? { material: 'none', ...Object.fromEntries(extras.map((k) => [k, 'none'])) } : { material: m.id })} name={m.name} text={m.text} photo={m.photo} />
        ))}
      </div>
      {mat.colors && (
        <section className="sub">
          <h4>
            Kolor <span>{byId(colors, cfg.color).name}</span>
          </h4>
          <div className="swatches" role="radiogroup" aria-label="Kolor płótna">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={cfg.color === c.id}
                className="swatch"
                style={{ '--c': c.hex }}
                title={c.name}
                aria-label={c.name}
                onClick={() => set({ color: c.id })}
              />
            ))}
          </div>
        </section>
      )}
      {cfg.material === 'photoPrint' && (
        <section className="sub">
          <h4>Grafika</h4>
          <Chips
            label="Grafika nadruku"
            items={prints}
            value={cfg.print}
            onChange={(id) => set({ print: id })}
            render={(p) => (
              <>
                <img src={`/textures/${p.id}-sm.webp`} alt="" width="22" height="22" /> {p.name}
              </>
            )}
          />
          <p className="hint">Nadruk wykonamy z dowolnego zdjęcia lub grafiki — także Twojej.</p>
        </section>
      )}
    </>
  )
}

function ProfileStep({ cfg, set }) {
  return (
    <>
      <StepHead title="Profil przyścienny" text="Profil to wykończenie styku sufitu ze ścianą. Przybliż zdjęcie przy ścianach, aby zobaczyć różnicę — a profil podświetlany najlepiej widać wieczorem." />
      <div className="opts">
        {profiles.map((p) => (
          <OptionCard key={p.id} active={cfg.profile === p.id} onClick={() => set({ profile: p.id, ...(p.id === 'floating' ? { mode: 'night' } : {}) })} name={p.name} text={p.text} photo={p.photo} />
        ))}
      </div>
    </>
  )
}

function LightStep({ cfg, set }) {
  return (
    <>
      <StepHead title="Oświetlenie" text="Rodzaje oświetlenia można łączyć. Przełącz widok na „Wieczór”, aby zobaczyć sufit z włączonym światłem." />

      <section className="sub">
        <h4>{lightInfo.spots.name}</h4>
        <div className="opts opts--compact">
          {spotTypes.map((s) => (
            <OptionCard key={s.id} active={cfg.spot === s.id} onClick={() => set({ spot: s.id })} name={s.name} text={s.text} photo={s.photo} />
          ))}
        </div>
        {cfg.spot !== 'none' && (
          <div className="sub__row">
            <Chips label="Wygląd oprawy" items={spotStyles[cfg.spot]} value={cfg.spotStyle} onChange={(id) => set({ spotStyle: id })} />
            <div className="stepper" aria-label="Liczba opraw">
              <button type="button" aria-label="Mniej" onClick={() => set((c) => ({ spotCount: spotCounts[Math.max(0, spotCounts.indexOf(c.spotCount) - 1)] }))}>
                −
              </button>
              <output>{cfg.spotCount} szt.</output>
              <button type="button" aria-label="Więcej" onClick={() => set((c) => ({ spotCount: spotCounts[Math.min(spotCounts.length - 1, spotCounts.indexOf(c.spotCount) + 1)] }))}>
                +
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="sub">
        <h4>{lightInfo.lamp.name}</h4>
        <div className="opts opts--compact">
          {lamps.map((l) => (
            <OptionCard key={l.id} active={cfg.lamp === l.id} onClick={() => set({ lamp: l.id })} name={l.name} text={l.text} photo={l.photo} />
          ))}
        </div>
      </section>

      <section className="sub">
        <h4>
          {lightInfo.led.name}
          <img className="sub__photo" src={catalogPhoto(lightInfo.led.photo)} alt="" width="40" height="40" />
        </h4>
        <p className="hint">{lightInfo.led.text}</p>
        <Chips label="Układ linii" items={ledLayouts} value={cfg.led} onChange={(id) => set({ led: id })} />
      </section>

      <section className="sub">
        <h4>
          {lightInfo.track.name}
          <img className="sub__photo" src={catalogPhoto(lightInfo.track.photo)} alt="" width="40" height="40" />
        </h4>
        <p className="hint">{lightInfo.track.text}</p>
        <Chips label="Układ szyn" items={trackLayouts} value={cfg.track} onChange={(id) => set({ track: id })} />
      </section>

      <section className="sub">
        <h4>Barwa światła</h4>
        <Chips
          label="Barwa światła"
          items={temperatures}
          value={cfg.temp}
          onChange={(id) => set({ temp: id, mode: 'night' })}
          render={(t) => (
            <>
              <i className={`temp temp--${t.id}`} aria-hidden="true" /> {t.name} <small>{t.k}</small>
            </>
          )}
        />
      </section>
    </>
  )
}

function CurtainStep({ cfg, set, scene }) {
  return (
    <>
      <StepHead title="Karnisz" text="Karnisz montujemy razem z sufitem — ukryty w niszy wygląda najczyściej." />
      {!scene.window && (
        <p className="notice">
          <Icon name="info" /> W tym ujęciu nie widać okna. Wybierz salon, kuchnię lub sypialnię, aby zobaczyć karnisz na zdjęciu.
        </p>
      )}
      <div className="opts">
        {curtains.map((c) => (
          <OptionCard key={c.id} active={cfg.curtain === c.id} onClick={() => set({ curtain: c.id, ...(c.id === 'hiddenLux' ? { mode: 'night' } : {}) })} name={c.name} text={c.text} photo={c.photo} />
        ))}
      </div>
    </>
  )
}

const fmt = (v) => v.toLocaleString('pl-PL', { maximumFractionDigits: 1 })
const hasLight = (c) => c.spot !== 'none' || c.lamp !== 'none' || c.led !== 'none' || c.track !== 'none' || c.profile === 'floating' || c.curtain === 'hiddenLux'

function Summary({ cfg, scene }) {
  const lay = useMemo(() => layout(scene, cfg), [scene, cfg])
  const q = lay.qty
  const mat = byId(materials, cfg.material)
  const [copied, setCopied] = useState(false)
  const rows = [
    ['Pomieszczenie', `${scene.name} — ${scene.variant}`, `~${fmt(q.area)} m²`],
    ['Płótno', mat.colors ? `${mat.name} · ${byId(colors, cfg.color).name}` : cfg.material === 'photoPrint' ? `${mat.name} · ${byId(prints, cfg.print).name}` : mat.name, cfg.material !== 'none' ? `${fmt(q.area)} m²` : ''],
    ['Profil', byId(profiles, cfg.profile).name, cfg.profile !== 'none' ? `~${fmt(q.perimeter)} m.b.` : ''],
    cfg.spot !== 'none' && [byId(spotTypes, cfg.spot).name, byId(spotStyles[cfg.spot], cfg.spotStyle).name, `${q.spots} szt.`],
    cfg.lamp !== 'none' && ['Lampa', byId(lamps, cfg.lamp).name, '1 szt.'],
    cfg.led !== 'none' && [lightInfo.led.name, byId(ledLayouts, cfg.led).name, `~${fmt(q.ledMeters)} m.b.`],
    cfg.track !== 'none' && [lightInfo.track.name, byId(trackLayouts, cfg.track).name, `~${fmt(q.trackMeters)} m.b.`],
    hasLight(cfg) && ['Barwa światła', `${byId(temperatures, cfg.temp).name} ${byId(temperatures, cfg.temp).k}`, ''],
    ['Karnisz', byId(curtains, cfg.curtain).name, q.curtainMeters ? `~${fmt(q.curtainMeters)} m.b.` : ''],
  ].filter(Boolean)

  const copy = async () => {
    const url = `${location.origin}${location.pathname}${toQuery(cfg)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      prompt('Skopiuj link do projektu:', url)
    }
  }

  return (
    <>
      <StepHead title="Twój sufit" text="Ilości są orientacyjne — policzone dla pomieszczenia ze zdjęcia. Dokładną wycenę przygotujemy po bezpłatnym pomiarze." />
      <dl className="summary">
        {rows.map(([k, v, n]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              <span>{v}</span>
              {n && <small>{n}</small>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="summary__actions">
        <button type="button" className="btn btn--ghost" onClick={copy}>
          <Icon name={copied ? 'check' : 'link'} /> {copied ? 'Skopiowano' : 'Kopiuj link do projektu'}
        </button>
        <a className="btn btn--ghost" href={tel(brand.phone)}>
          <Icon name="phone" /> {brand.phone}
        </a>
      </div>
    </>
  )
}
