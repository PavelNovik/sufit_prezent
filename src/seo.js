import { brand } from './config.js'
import { materials, profiles, curtains } from './data/catalog.js'

const abs = (p = '') => brand.siteUrl.replace(/\/$/, '') + p
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export const meta = {
  title: 'Wizualizator sufitów napinanych — zobacz sufit przed montażem | Sufitowski',
  description:
    'Wybierz pomieszczenie, płótno (mat, satyna, połysk), profil cieniowy lub podświetlany, oświetlenie LED i karnisz — i od razu zobacz efekt na zdjęciu wnętrza. Sufitowski: premiumowe sufity napinane.',
}

function schema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': abs('/#app'),
        name: 'Wizualizator sufitów napinanych Sufitowski',
        url: abs('/'),
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        inLanguage: 'pl',
        isAccessibleForFree: true,
        description: meta.description,
        featureList: [
          ...materials.map((m) => `Płótno: ${m.name}`),
          ...profiles.map((p) => `Profil: ${p.name}`),
          'Oprawy punktowe, linie świetlne LED, szyna magnetyczna, lampy',
          ...curtains.filter((c) => c.id !== 'none').map((c) => c.name),
        ],
        provider: { '@id': `${brand.mainSite}/#business` },
      },
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': `${brand.mainSite}/#business`,
        name: brand.name,
        description: brand.tagline,
        url: brand.mainSite,
        telephone: brand.phone.replace(/\s/g, ''),
        image: abs('/og-image.jpg'),
        sameAs: [brand.instagram],
      },
    ],
  }
}

export function renderHead() {
  const url = abs('/')
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pl_PL" />`,
    `<meta property="og:site_name" content="${brand.name}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${abs('/og-image.jpg')}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(schema())}</script>`,
  ].join('\n    ')
}

export const robotsTxt = () => `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`

export const sitemapXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${abs('/')}</loc></url>\n</urlset>\n`
