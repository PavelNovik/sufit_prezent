// Источники фото (Unsplash, бесплатная лицензия). id сцены → id фото.
// Чтобы заменить фото комнаты: поменять id здесь (или положить своё фото в public/rooms/<id>.webp, ширина 1600),
// запустить `npm run images` и заново разметить углы потолка в редакторе (?editor).
export const rooms = {
  'salon-1': 'photo-1724582586529-62622e50c0b3',
  'salon-2': 'photo-1705326701287-346fc37a2c86',
  kuchnia: 'photo-1748679866205-b12b07fb9ed6',
  sypialnia: 'photo-1595526114035-0d45ed16cfbf',
  lazienka: 'photo-1613849925594-415a32298f54',
  korytarz: 'photo-1723257135853-75f98a13b944',
  // альтернативные ракурсы (вариант без окна / другой план)
  'salon-3': 'photo-1628745750131-e5cfc5e70ced',
  'kuchnia-2': 'photo-1639173925921-5d5fd027713c',
  'sypialnia-2': 'photo-1760072513376-67a46aab0fd1',
  'lazienka-2': 'photo-1721394745970-aba71c96836d',
  'korytarz-2': 'photo-1721743163186-02c9292bada6',
}

// Текстуры для «Nadruk» (фотопечать на полотне)
export const textures = {
  'niebo-liscie': 'photo-1600108622248-460bb867db5e',
  chmury: 'photo-1513002749550-c59d786b8e6c',
}
