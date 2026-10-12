import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
// Шрифты бренда (как на sufitowski.pl): Playfair Display — заголовки, Inter — интерфейс.
// Отдаём со своего домена (без Google Fonts CDN — RODO); latin-ext — польские буквы.
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-ext-500.css'
import '@fontsource/playfair-display/latin-500-italic.css'
import '@fontsource/playfair-display/latin-ext-500-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-ext-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-600.css'
import './styles/base.css'
import './styles/viewer.css'
import './styles/config.css'
import './styles/editor.css'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
