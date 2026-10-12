// Данные Sufitowski (sufitowski.pl, октябрь 2026)
const envSiteUrl = typeof __SITE_URL__ !== 'undefined' ? __SITE_URL__ : ''

export const brand = {
  name: 'Sufitowski',
  tagline: 'Premiumowe sufity napinane',
  // TODO: адрес презентации после встраивания в основной сайт (или задать SITE_URL при сборке)
  siteUrl: envSiteUrl || 'https://sufitowski.pl/wizualizator',
  mainSite: 'https://sufitowski.pl',
  // TODO: заменить на прямую ссылку, когда калькулятор научится принимать конфигурацию
  calcUrl: 'https://sufitowski.pl/#quiz',
  phone: '+48 452 873 799',
  instagram: 'https://www.instagram.com/sufitowski',
  stats: [
    { value: '10', unit: 'lat', label: 'doświadczenia' },
    { value: '3000+', unit: '', label: 'projektów' },
    { value: '12', unit: 'lat', label: 'gwarancji' },
    { value: '3', unit: 'dni', label: 'do montażu' },
  ],
}

export const tel = (p) => `tel:${p.replace(/\s/g, '')}`
