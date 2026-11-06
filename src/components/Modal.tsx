import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'

interface Props {
  titulo: string
  subtitulo?: string
  icono?: ReactNode
  ancho?: string
  onCerrar: () => void
  children: ReactNode
}

/** Ventana modal con encabezado de la plataforma. Se cierra con Esc, con la X o haciendo clic fuera. */
export function Modal({ titulo, subtitulo, icono, ancho = 'max-w-[760px]', onCerrar, children }: Props) {
  const idTitulo = useId()

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = anterior
      removeEventListener('keydown', esc)
    }
  }, [onCerrar])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-mar/45 p-3 backdrop-blur-[2px] sm:p-6" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[min(860px,calc(100dvh-24px))] w-full ${ancho} flex-col overflow-hidden rounded-2xl bg-niebla shadow-[0_24px_60px_-20px_rgba(18,53,64,0.6)]`}
      >
        <header className="flex items-start gap-3 bg-mar px-5 py-4 text-white sm:px-6">
          {icono && <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/12">{icono}</span>}
          <div className="flex-1">
            <h2 id={idTitulo} className="font-display text-[22px] leading-tight font-bold">
              {titulo}
            </h2>
            {subtitulo && <p className="mt-0.5 text-[14px] text-white/70">{subtitulo}</p>}
          </div>
          <button type="button" onClick={onCerrar} autoFocus aria-label="Cerrar" className="-mr-1 grid size-8 place-items-center rounded-full hover:bg-white/10">
            <X size={18} />
          </button>
        </header>
        <div className="scroll-fino flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
