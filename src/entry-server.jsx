import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export { renderHead, robotsTxt, sitemapXml } from './seo.js'

export function render() {
  return renderToString(<App />)
}
