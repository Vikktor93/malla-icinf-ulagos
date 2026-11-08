import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// `npm run build` genera el sitio normal (Vercel).
// `npm run build:single` genera un único index.html autocontenido (vista previa)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  define: { __VERSION__: JSON.stringify(version) },
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
}))
