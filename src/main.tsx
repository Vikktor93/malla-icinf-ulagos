import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Visitas anónimas, sin cookies. Se quita el # de la URL para no enviar el avance compartido por enlace. */}
    <Analytics beforeSend={(evento) => ({ ...evento, url: evento.url.split('#')[0] })} />
  </StrictMode>,
)
