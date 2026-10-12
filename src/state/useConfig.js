import { useCallback, useEffect, useState } from 'react'
import { scenes } from '../data/scenes.js'
import { materials, colors, prints, profiles, curtains, spotTypes, spotStyles, spotCounts, lamps, ledLayouts, trackLayouts, temperatures } from '../data/catalog.js'

export const defaults = {
  scene: 'salon-1',
  material: 'none',
  color: 'white',
  print: 'niebo-liscie',
  profile: 'none',
  curtain: 'none',
  spot: 'none',
  spotStyle: 'round',
  spotCount: 6,
  lamp: 'none',
  led: 'none',
  track: 'none',
  temp: 'warm',
  mode: 'day',
}

// Короткие ключи для ссылки «Kopiuj link» и допустимые значения
const keys = {
  scene: ['s', scenes.map((s) => s.id)],
  material: ['m', materials.map((x) => x.id)],
  color: ['c', colors.map((x) => x.id)],
  print: ['n', prints.map((x) => x.id)],
  profile: ['p', profiles.map((x) => x.id)],
  curtain: ['k', curtains.map((x) => x.id)],
  spot: ['o', spotTypes.map((x) => x.id)],
  spotStyle: ['os', [...new Set(Object.values(spotStyles).flat().map((x) => x.id))]],
  spotCount: ['on', spotCounts.map(String)],
  lamp: ['l', lamps.map((x) => x.id)],
  led: ['ll', ledLayouts.map((x) => x.id)],
  track: ['sm', trackLayouts.map((x) => x.id)],
  temp: ['t', temperatures.map((x) => x.id)],
  mode: ['v', ['day', 'night']],
}

export function fromQuery(search) {
  const q = new URLSearchParams(search)
  const cfg = { ...defaults }
  for (const [name, [key, allowed]] of Object.entries(keys)) {
    const v = q.get(key)
    if (v != null && allowed.includes(v)) cfg[name] = name === 'spotCount' ? Number(v) : v
  }
  return normalize(cfg)
}

export function toQuery(cfg) {
  const q = new URLSearchParams()
  for (const [name, [key]] of Object.entries(keys)) if (cfg[name] !== defaults[name]) q.set(key, String(cfg[name]))
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const extras = ['profile', 'spot', 'lamp', 'led', 'track', 'curtain']

// Стиль спота должен соответствовать типу; профиль, свет и карниз требуют полотна —
// если полотно ещё не выбрано, включаем белый мат
function normalize(cfg) {
  if (cfg.material === 'none' && extras.some((k) => cfg[k] !== 'none')) {
    cfg.material = 'matte'
    cfg.color = 'white'
  }
  if (cfg.spot !== 'none') {
    const list = spotStyles[cfg.spot]
    if (!list.some((s) => s.id === cfg.spotStyle)) cfg.spotStyle = list[0].id
  }
  return cfg
}

export function useConfig() {
  const [cfg, setCfg] = useState(defaults)
  const [ready, setReady] = useState(false)

  // Конфигурация из адреса — после гидратации (SSR рендерит значения по умолчанию)
  useEffect(() => {
    setCfg(fromQuery(location.search))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const q = new URLSearchParams(location.search)
    const keep = ['embed', 'editor'].filter((k) => q.has(k)).map((k) => `${k}=${q.get(k)}`)
    const own = toQuery(cfg).slice(1)
    const all = [own, ...keep].filter(Boolean).join('&')
    history.replaceState(null, '', `${location.pathname}${all ? `?${all}` : ''}${location.hash}`)
  }, [cfg, ready])

  const set = useCallback((patch) => setCfg((c) => normalize({ ...c, ...(typeof patch === 'function' ? patch(c) : patch) })), [])
  return [cfg, set]
}
