// Сцены визуализатора. Фото — public/rooms/<id>.webp, ширина 1600 px (scripts/images.js).
//
// type — тип помещения (группа в выборе комнаты), variant — подпись варианта (с окном / без окна…).
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
// flatten — участки стен со световыми пятнами от старых спотов: `npm run images` выравнивает там
//   освещение (исходник сохраняется как <id>-orig.webp и показывается в режиме «Przed»).
// lamp — точка подвеса люстры/плафона (м на плоскости).
export const roomTypes = [
  { id: 'salon', name: 'Salon' },
  { id: 'kuchnia', name: 'Kuchnia' },
  { id: 'sypialnia', name: 'Sypialnia' },
  { id: 'lazienka', name: 'Łazienka' },
  { id: 'korytarz', name: 'Korytarz' },
]

export const scenes = [
  {
    id: 'salon-1',
    type: 'salon',
    name: 'Salon',
    variant: 'z oknem, grafitowy',
    image: { w: 1600, h: 1000 },
    corners: [[420, 300], [1402, 300], [2723, -400], [-605, -400]],
    size: { w: 5, d: 4.2 },
    zone: { x0: 0, y0: 0, x1: 5, y1: 2.9 },
    window: 'left',
    reflect: ['back'],
    occluders: [[[1155, 281], [1420, 281], [1420, 303], [1155, 303]]],
    flatten: [[[0, 18], [404, 298], [352, 298], [330, 236], [60, 162], [0, 162]]],
    lamp: [2.5, 1.5],
  },
  {
    id: 'salon-2',
    type: 'salon',
    name: 'Salon',
    variant: 'z oknem, jasny',
    image: { w: 1600, h: 889 },
    corners: [[400, 158], [1200, 158], [2375, -500], [-775, -500]],
    size: { w: 4.6, d: 4.4 },
    zone: { x0: 0, y0: 0, x1: 4.6, y1: 2.35 },
    window: 'left',
    reflect: ['back'],
    occluders: [],
    flatten: [
      [[470, 162], [1132, 162], [1132, 478], [470, 478]],
      [[1148, 162], [1200, 160], [1600, -66], [1600, 92], [1530, 106], [1450, 148], [1390, 212], [1352, 288], [1342, 330], [1342, 478], [1148, 478]],
    ],
    lamp: [2.3, 1.3],
  },
  {
    id: 'salon-3',
    type: 'salon',
    name: 'Salon',
    variant: 'bez okna, z kominkiem',
    image: { w: 1600, h: 1066 },
    corners: [[728, 347], [1700, 21], [894, -1047], [-100, 140]],
    size: { w: 4.4, d: 4.2 },
    zone: { x0: 0, y0: 0, x1: 2.6, y1: 2.2 },
    window: null,
    reflect: ['back', 'left'],
    occluders: [],
    flatten: [
      [[102, 192], [498, 291], [498, 530], [102, 530]],
      [[922, 298], [1600, 113], [1600, 590], [922, 590]],
    ],
    lamp: [1.4, 1.3],
  },
  {
    id: 'kuchnia',
    type: 'kuchnia',
    name: 'Kuchnia',
    variant: 'z oknem',
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
    id: 'kuchnia-2',
    type: 'kuchnia',
    name: 'Kuchnia',
    variant: 'z wyspą',
    image: { w: 1600, h: 1066 },
    corners: [[-600, 236], [1800, 262], [3600, -700], [-2600, -700]],
    size: { w: 6.5, d: 3.6 },
    zone: { x0: 2.4, y0: 0, x1: 5.2, y1: 1.65 },
    window: null,
    reflect: ['back'],
    // подвесы над островом: планка и тросы остаются с фото
    occluders: [
      [[706, 38], [922, 38], [922, 88], [706, 88]],
      [[726, 86], [734, 86], [734, 270], [726, 270]],
      [[809, 86], [817, 86], [817, 270], [809, 270]],
      [[896, 86], [904, 86], [904, 270], [896, 270]],
    ],
    lamp: [3.8, 0.9],
  },
  {
    id: 'sypialnia',
    type: 'sypialnia',
    name: 'Sypialnia',
    variant: 'z oknem, narożny widok',
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
    id: 'sypialnia-2',
    type: 'sypialnia',
    name: 'Sypialnia',
    variant: 'bez okna',
    image: { w: 1600, h: 1068 },
    corners: [[690, 237], [1700, 21], [1159, -738], [-150, -23]],
    size: { w: 4.2, d: 3.6 },
    zone: { x0: 0, y0: 0, x1: 2.6, y1: 1.4 },
    window: null,
    reflect: ['back', 'left'],
    occluders: [[[597, 150], [619, 150], [619, 216], [597, 216]]],
    lamp: [1.3, 1.1],
  },
  {
    id: 'lazienka',
    type: 'lazienka',
    name: 'Łazienka',
    variant: 'z oknem i wanną',
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
    id: 'lazienka-2',
    type: 'lazienka',
    name: 'Łazienka',
    variant: 'bez okna, z prysznicem',
    image: { w: 1600, h: 1066 },
    corners: [[500, 155], [1101, 155], [1803, -301], [0, -301]],
    size: { w: 2, d: 2.4 },
    zone: { x0: 0, y0: 0, x1: 2, y1: 1.4 },
    window: null,
    reflect: ['back'],
    occluders: [[[868, 124], [1152, 124], [1152, 160], [868, 160]]],
    lamp: [1, 0.7],
  },
  {
    id: 'korytarz',
    type: 'korytarz',
    name: 'Korytarz',
    variant: 'wąski przedpokój',
    image: { w: 1600, h: 1066 },
    corners: [[612, 225], [970, 225], [1340, -421], [266, -421]],
    size: { w: 1.6, d: 4 },
    zone: { x0: 0, y0: 0, x1: 1.6, y1: 2.35 },
    window: null,
    reflect: ['back'],
    occluders: [[[575, 153], [730, 153], [747, 227], [612, 227]]],
    lamp: [0.8, 1.6],
  },
  {
    id: 'korytarz-2',
    type: 'korytarz',
    name: 'Korytarz',
    variant: 'z widokiem na kuchnię',
    image: { w: 1600, h: 1200 },
    corners: [[-300, 420], [1900, 404], [9362, -597], [-8238, -469]],
    size: { w: 12, d: 6 },
    zone: { x0: 5, y0: 3.4, x1: 7.2, y1: 5 },
    window: null,
    reflect: ['back'],
    occluders: [
      [[-10, 301], [630, 290], [630, 300], [725, 415], [725, 432], [-10, 432]],
      [[905, 415], [980, 276], [1000, 272], [1000, 206], [1610, 196], [1610, 432], [905, 432]],
    ],
    lamp: [6.1, 4.2],
  },
]

export const sceneById = (id) => scenes.find((s) => s.id === id) ?? scenes[0]
export const roomImage = (id) => `/rooms/${id}.webp`
export const roomThumb = (id) => `/rooms/${id}-sm.webp`
// исходное фото (до выравнивания пятен на стенах) — для режима «Przed»
export const roomOriginal = (s) => (s.flatten?.length ? `/rooms/${s.id}-orig.webp` : roomImage(s.id))
