import { ExternalLink, Lightbulb, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { Malla } from '../data/types'
import { CorreoContacto } from './CorreoContacto'

const DISCUSIONES = 'https://github.com/Vikktor93/malla-icinf-ulagos/discussions'

const preguntas = (malla: Malla) => [
  `Malla que uso: ${malla.nombre}`,
  '',
  '¿Qué idea o funcionalidad propones?',
  '',
  '',
  '¿En qué te ayudaría a ti o a otros estudiantes?',
  '',
]

/** Enlace a una discusión nueva en la categoría Ideas, con una plantilla breve ya escrita. */
function enlaceIdea(malla: Malla) {
  const [primera, ...resto] = preguntas(malla)
  const cuerpo = [`**${primera.replace(': ', ':** ')}`, ...resto.map((l) => (l.startsWith('¿') ? `**${l}**` : l))].join('\n')
  const params = new URLSearchParams({ category: 'ideas', body: cuerpo })
  return `${DISCUSIONES}/new?${params}`
}

/**
 * Botón flotante en la esquina inferior derecha. Abre un panel pequeño, anclado al botón, para
 * compartir una idea en GitHub Discussions o por correo.
 */
export function SugerirMejoras({ malla, oculto }: { malla: Malla; oculto: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const idTitulo = useId()

  // Cerrar con Esc o con un clic fuera del panel, y devolver el foco al botón
  useEffect(() => {
    if (!abierto) return
    const cerrar = () => {
      setAbierto(false)
      boton.current?.focus()
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    const fuera = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !boton.current?.contains(t)) setAbierto(false)
    }
    addEventListener('keydown', esc)
    addEventListener('pointerdown', fuera)
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => {
      removeEventListener('keydown', esc)
      removeEventListener('pointerdown', fuera)
    }
  }, [abierto])

  useEffect(() => {
    if (oculto) setAbierto(false)
  }, [oculto])

  if (oculto) return null

  return (
    <>
      {abierto && (
        <div
          ref={panel}
          role="dialog"
          aria-labelledby={idTitulo}
          className="panel-sugerir fixed right-4 bottom-20 z-30 w-[340px] max-w-[calc(100vw-2rem)] origin-bottom-right rounded-2xl bg-niebla p-5 shadow-[0_18px_50px_-14px_rgba(18,53,64,0.55)] ring-1 ring-bruma sm:right-6"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Lightbulb size={19} />
            </span>
            <div className="flex-1">
              <h2 id={idTitulo} className="font-display text-[18px] leading-tight font-bold">
                Sugerir mejoras
              </h2>
              <p className="mt-1 text-[14px] leading-snug text-mar-suave">
                ¿Tienes una idea para mejorar la plataforma? ¿Una nueva funcionalidad?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center rounded-full text-mar-suave hover:bg-bruma"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <a
              href={enlaceIdea(malla)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primario text-[15px] font-semibold text-sobre-primario hover:bg-primario/90"
            >
              Compartir en GitHub <ExternalLink size={15} />
            </a>
            <p className="-mt-1.5 text-center text-[12px] text-mar-suave">
              Ahí también puedes votar y comentar las ideas de otros. Requiere cuenta de GitHub.
            </p>
            <CorreoContacto texto="Enviar por correo electrónico" asunto={`[Malla ICINF] Sugerencia (${malla.nombre})`} cuerpo={preguntas(malla).join('\n')} />
          </div>
        </div>
      )}

      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label="Sugerir mejoras"
        className="fixed right-4 bottom-4 z-30 flex h-12 items-center gap-2 rounded-full bg-primario pr-3.5 pl-3.5 text-[15px] font-semibold text-sobre-primario shadow-[0_10px_30px_-8px_rgba(18,53,64,0.6)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:pr-5"
      >
        {abierto ? <X size={20} /> : <Lightbulb size={20} />}
        <span className="hidden sm:inline">Sugerir mejoras</span>
      </button>
    </>
  )
}
