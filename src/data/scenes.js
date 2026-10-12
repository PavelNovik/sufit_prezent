// Сцены визуализатора. Фото — public/rooms/<id>.webp, ширина 1600 px (scripts/images.js).
//
// corners — 4 точки плоскости потолка в пикселях фото, по порядку:
//   [0] задний-левый, [1] задний-правый, [2] передний-правый, [3] передний-левый.
//   Задняя кромка (0→1) — стык с дальней стеной. Передние точки обычно вне кадра (над камерой) —
//   их ставят на продолжении боковых кромок. Размечать удобнее в редакторе: /?editor
// size — размер этой плоскости в метрах (w — по задней кромке 0→1, d — от неё к камере 1→2).
// zone — где раскладывать светильники (в метрах на плоскости; по умолчанию — вся плоскость).
//   Берём видимую часть потолка, чтобы споты и линии попадали в кадр.
// window — кромка с окном для карниза: 'back' | 'left' | 'right' | null.
// reflect — кромки, у которых глянец «отражает» стены (обычно 'back'; для угловых ракурсов — две).
// occluders — полигоны предметов перед потолком (шкафы до потолка, колонны): там остаётся исходное фото.
// lamp — точка подвеса люстры/плафона (м на плоскости).
export const scenes = [
  {
    id: 'salon-1',
    name: 'Salon',
    variant: 'nowoczesny, grafitowy',
    image: { w: 1600, h: 1000 },
    corners: [[420, 300], [1402, 300], [2723, -400], [-605, -400]],
    size: { w: 5, d: 4.2 },
    zone: { x0: 0, y0: 0, x1: 5, y1: 2.9 },
    window: 'left',
    reflect: ['back'],
    occluders: [[[1155, 281], [1420, 281], [1420, 303], [1155, 303]]],
    lamp: [2.5, 1.5],
  },
  {
    id: 'salon-2',
    name: 'Salon',
    variant: 'jasny, beżowy',
    image: { w: 1600, h: 889 },
    corners: [[400, 158], [1200, 158], [2375, -500], [-775, -500]],
    size: { w: 4.6, d: 4.4 },
    zone: { x0: 0, y0: 0, x1: 4.6, y1: 2.35 },
    window: 'left',
    reflect: ['back'],
    occluders: [],
    lamp: [2.3, 1.3],
  },
  {
    id: 'kuchnia',
    name: 'Kuchnia',
    variant: 'biała, z oknem',
    image: { w: 1600, h: 1127 },
    corners: [[262, 240], [1010, 240], [1269, -300], [-787, -300]],
    size: { w: 3, d: 3.4 },
    zone: { x0: 0, y0: 0, x1: 3, y1: 2.2 },
    window: 'left',
    reflect: ['back'],
    occluders: [],
    lamp: [1.5, 1.1],
  },
  {
    id: 'sypialnia',
    name: 'Sypialnia',
    variant: 'narożny widok',
    image: { w: 1600, h: 1066 },
    corners: [[752, 300], [1580, 95], [2400, -2600], [-150, -28]],
    size: { w: 3.6, d: 3.9 },
    zone: { x0: 0, y0: 0, x1: 3, y1: 2 },
    window: 'back',
    reflect: ['back', 'left'],
    occluders: [],
    lamp: [1.6, 1.5],
  },
  {
    id: 'lazienka',
    name: 'Łazienka',
    variant: 'z wanną wolnostojącą',
    image: { w: 1600, h: 1066 },
    corners: [[460, 268], [1240, 325], [3133, -254], [13, -482]],
    size: { w: 2.6, d: 2.8 },
    zone: { x0: 0, y0: 0, x1: 2.6, y1: 1.9 },
    window: 'back',
    reflect: ['back'],
    occluders: [],
    lamp: [1.4, 1],
  },
  {
    id: 'korytarz',
    name: 'Korytarz',
    variant: 'przedpokój',
    image: { w: 1600, h: 1066 },
    corners: [[612, 225], [970, 225], [1340, -421], [266, -421]],
    size: { w: 1.6, d: 4 },
    zone: { x0: 0, y0: 0, x1: 1.6, y1: 2.35 },
    window: null,
    reflect: ['back'],
    occluders: [[[575, 153], [730, 153], [747, 227], [612, 227]]],
    lamp: [0.8, 1.6],
  },
]

export const sceneById = (id) => scenes.find((s) => s.id === id) ?? scenes[0]
export const roomImage = (id) => `/rooms/${id}.webp`
export const roomThumb = (id) => `/rooms/${id}-sm.webp`
