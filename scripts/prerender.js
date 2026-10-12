// Пререндер: готовый HTML главной (поисковики видят текст и опции без JS) + robots.txt, sitemap.xml.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const server = path.resolve('dist-server/entry-server.js')
const { render, renderHead, robotsTxt, sitemapXml } = await import(pathToFileURL(server).href)

// Шрифт заголовков (Playfair 500, latin + latin-ext) — preload: H1 это LCP-элемент
const fonts = fs
  .readdirSync(path.join(dist, 'assets'))
  .filter((f) => /^playfair-display-latin(-ext)?-500-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ')

const html = fs
  .readFileSync(path.join(dist, 'index.html'), 'utf8')
  .replace('</head>', `  ${fonts}\n  </head>`)
  .replace(/<title>.*?<\/title>\s*/, '')
  .replace('<!--app-head-->', renderHead())
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)

fs.writeFileSync(path.join(dist, 'index.html'), html)
fs.writeFileSync(path.join(dist, 'robots.txt'), robotsTxt())
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemapXml())
fs.rmSync(path.resolve('dist-server'), { recursive: true, force: true })
console.log('  prerendered index.html, robots.txt, sitemap.xml')
