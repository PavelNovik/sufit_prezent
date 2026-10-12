// Каталог опций. id совпадают с калькулятором на sufitowski.pl (MATERIAL_OPTIONS, PROFILE_OPTIONS,
// LIGHTING_OPTIONS, CURTAIN_OPTIONS) — чтобы потом передавать выбранную конфигурацию в калькулятор.
// photo — реальное фото опции с sufitowski.pl (public/catalog/<n>.webp).

export const materials = [
  {
    id: 'matte',
    name: 'Mat',
    photo: 2,
    text: 'Wygląda jak idealnie gładki, malowany sufit. Bez odbić — najbardziej uniwersalny wybór.',
    colors: true,
  },
  {
    id: 'satin',
    name: 'Satyna',
    photo: 3,
    text: 'Delikatny, perłowy połysk. Miękko rozprasza światło i subtelnie odbija wnętrze.',
    colors: true,
  },
  {
    id: 'gloss',
    name: 'Połysk',
    photo: 1,
    text: 'Lustrzane odbicie wnętrza optycznie podwyższa i powiększa pomieszczenie.',
    colors: true,
  },
  {
    id: 'blackGloss',
    name: 'Czarny połysk',
    photo: 4,
    text: 'Głęboka czerń z wyraźnym odbiciem. Efektowny w salonie, sypialni i kinie domowym.',
    colors: false,
  },
  {
    id: 'photoPrint',
    name: 'Nadruk',
    photo: 5,
    text: 'Dowolna grafika lub zdjęcie wydrukowane na całym suficie.',
    colors: false,
  },
  {
    id: 'starSky',
    name: 'Gwieździste niebo',
    photo: 6,
    text: 'Granatowe płótno ze świecącymi „gwiazdami” ze światłowodów. Wieczorem lśni.',
    colors: false,
  },
]

// Цвета для mat / satyna / połysk. tone — насколько цвет «гасит» тени (для тёмных отражение заметнее).
export const colors = [
  { id: 'white', name: 'Biały', hex: '#f4f4f1' },
  { id: 'ivory', name: 'Kość słoniowa', hex: '#f1ebdc' },
  { id: 'cream', name: 'Kremowy', hex: '#ebe0c8' },
  { id: 'beige', name: 'Beżowy', hex: '#d9c8ab' },
  { id: 'cappuccino', name: 'Cappuccino', hex: '#b39a80' },
  { id: 'greige', name: 'Greige', hex: '#bdb6aa' },
  { id: 'lightgrey', name: 'Jasnoszary', hex: '#d3d4d2' },
  { id: 'graphite', name: 'Grafitowy', hex: '#4a4c50' },
  { id: 'black', name: 'Czarny', hex: '#1b1b1d' },
  { id: 'sage', name: 'Szałwiowy', hex: '#b7c2ad' },
  { id: 'sky', name: 'Błękitny', hex: '#c6d6e3' },
  { id: 'powder', name: 'Pudrowy róż', hex: '#e8d1cb' },
  { id: 'navy', name: 'Granatowy', hex: '#26324a' },
]

export const prints = [
  { id: 'niebo-liscie', name: 'Niebo z liśćmi' },
  { id: 'chmury', name: 'Chmury' },
]

export const profiles = [
  {
    id: 'standard',
    name: 'Standard',
    photo: 7,
    text: 'Klasyczny profil z wkładką maskującą przy ścianie. Sprawdzone, niezawodne rozwiązanie.',
  },
  {
    id: 'shadowStandard',
    name: 'Standard cieniowy',
    photo: 8,
    text: 'Bez widocznej wkładki — wąska szczelina cienia między sufitem a ścianą. Minimalistyczny efekt.',
  },
  {
    id: 'eurokraab',
    name: 'EuroKraab',
    photo: 9,
    text: 'Premiumowa szczelina cieniowa. Idealnie równa, ostra linia bez wkładki.',
  },
  {
    id: 'floating',
    name: 'Podświetlany',
    photo: 10,
    text: 'Efekt „unoszącego się” sufitu: listwa LED po obwodzie miękko rozświetla ściany.',
  },
]

export const curtains = [
  { id: 'none', name: 'Bez karnisza', photo: null, text: 'Karnisz nie jest potrzebny.' },
  { id: 'stdCurtain', name: 'Karnisz sufitowy standard', photo: 17, text: 'Otwarta szyna sufitowa do zasłon.' },
  {
    id: 'hiddenPrem',
    name: 'Ukryty karnisz premium',
    photo: 18,
    text: 'Wbudowana nisza na zasłony — zasłony wyglądają, jakby wychodziły z sufitu.',
  },
  {
    id: 'hiddenLux',
    name: 'Ukryty karnisz LUXURY',
    photo: 19,
    text: 'Nisza z podświetleniem LED i elektrycznym mechanizmem zasłon.',
  },
]

// Освещение — можно комбинировать (как в калькуляторе).
export const spotTypes = [
  { id: 'none', name: 'Brak' },
  { id: 'spotStd', name: 'Oprawa punktowa', photo: 11, text: 'Wbudowane spoty LED do równomiernego oświetlenia.' },
  { id: 'spotPrem', name: 'Oprawa punktowa premium', photo: 15, text: 'Designerskie, głęboko osadzone spoty.' },
]
export const spotStyles = {
  spotStd: [
    { id: 'round', name: 'Okrągła' },
    { id: 'square', name: 'Kwadratowa' },
  ],
  spotPrem: [
    { id: 'black', name: 'Czarna' },
    { id: 'white', name: 'Biała' },
    { id: 'gold', name: 'Złota' },
  ],
}
export const spotCounts = [2, 4, 6, 8, 9, 12]

export const lamps = [
  { id: 'none', name: 'Brak' },
  { id: 'chandStd', name: 'Lampa standard', photo: 12, text: 'Plafon montowany w suficie na stabilnej platformie.' },
  { id: 'chandPrem', name: 'Lampa premium', photo: 13, text: 'Lampa wisząca z pierścieniami LED — montaż ciężkich i złożonych opraw.' },
]

export const ledLayouts = [
  { id: 'none', name: 'Brak' },
  { id: 'single', name: 'Jedna linia' },
  { id: 'parallel', name: 'Równoległe' },
  { id: 'frame', name: 'Prostokąt' },
]

export const trackLayouts = [
  { id: 'none', name: 'Brak' },
  { id: 'single', name: 'Jedna szyna' },
  { id: 'double', name: 'Dwie szyny' },
]

export const temperatures = [
  { id: 'warm', name: 'Ciepła', k: '3000 K' },
  { id: 'neutral', name: 'Neutralna', k: '4000 K' },
]

export const lightInfo = {
  spots: { name: 'Oprawy punktowe' },
  lamp: { name: 'Lampa' },
  led: { name: 'Linie świetlne LED', photo: 14, text: 'Wbudowane liniowe profile LED w płótnie.' },
  track: { name: 'Szyna magnetyczna premium', photo: 16, text: 'Wbudowany magnetyczny system oświetlenia kierunkowego.' },
}

export const byId = (list, id) => list.find((x) => x.id === id) ?? list[0]
export const catalogPhoto = (n) => `/catalog/${n}.webp`
