// «Inspiracje» — готовые конфигурации. Первые три повторяют реализации из портфолио на sufitowski.pl
// (фото public/realizacje/1–3.webp), остальные — по мотивам роликов в Instagram @sufitowski
// («Sufity napinane satynowe z liniami LED» и др.).
export const presets = [
  {
    id: 'salon-cien-led',
    title: 'Salon',
    tags: 'Profil cieniowy · Linie świetlne',
    photo: '/realizacje/1.webp',
    real: true,
    cfg: { scene: 'salon-1', material: 'matte', color: 'white', profile: 'shadowStandard', spot: 'none', led: 'parallel', track: 'none', lamp: 'none', curtain: 'hiddenPrem', mode: 'night', temp: 'warm' },
  },
  {
    id: 'sypialnia-eurokraab',
    title: 'Sypialnia',
    tags: 'EuroKraab · Podświetlenie LED po obwodzie',
    photo: '/realizacje/2.webp',
    real: true,
    cfg: { scene: 'sypialnia', material: 'satin', color: 'ivory', profile: 'floating', spot: 'spotPrem', spotStyle: 'white', spotCount: 4, led: 'none', track: 'none', lamp: 'none', curtain: 'hiddenLux', mode: 'night', temp: 'warm' },
  },
  {
    id: 'lazienka-spoty',
    title: 'Łazienka',
    tags: 'Profil standardowy · Oprawy punktowe',
    photo: '/realizacje/3.webp',
    real: true,
    cfg: { scene: 'lazienka', material: 'gloss', color: 'white', profile: 'standard', spot: 'spotStd', spotStyle: 'round', spotCount: 4, led: 'none', track: 'none', lamp: 'none', curtain: 'none', mode: 'day', temp: 'neutral' },
  },
  {
    id: 'lazienka-satyna-led',
    title: 'Łazienka',
    tags: 'Satyna · Linie LED',
    scenePreview: 'lazienka',
    cfg: { scene: 'lazienka', material: 'satin', color: 'white', profile: 'shadowStandard', spot: 'none', led: 'parallel', track: 'none', lamp: 'none', curtain: 'none', mode: 'night', temp: 'neutral' },
  },
  {
    id: 'kuchnia-szyna',
    title: 'Kuchnia',
    tags: 'Satyna · Szyna magnetyczna · Ukryty karnisz',
    scenePreview: 'kuchnia',
    cfg: { scene: 'kuchnia', material: 'satin', color: 'white', profile: 'eurokraab', spot: 'none', led: 'none', track: 'single', lamp: 'none', curtain: 'hiddenPrem', mode: 'day', temp: 'neutral' },
  },
  {
    id: 'salon-polysk-lampa',
    title: 'Salon',
    tags: 'Połysk · Lampa premium · Karnisz LUXURY',
    scenePreview: 'salon-2',
    cfg: { scene: 'salon-2', material: 'gloss', color: 'ivory', profile: 'shadowStandard', spot: 'spotStd', spotStyle: 'round', spotCount: 6, led: 'none', track: 'none', lamp: 'chandPrem', curtain: 'hiddenLux', mode: 'night', temp: 'warm' },
  },
  {
    id: 'korytarz-czarny',
    title: 'Korytarz',
    tags: 'Czarny połysk · Linia LED · EuroKraab',
    scenePreview: 'korytarz',
    cfg: { scene: 'korytarz', material: 'blackGloss', profile: 'eurokraab', spot: 'none', led: 'single', track: 'none', lamp: 'none', curtain: 'none', mode: 'night', temp: 'neutral' },
  },
]
