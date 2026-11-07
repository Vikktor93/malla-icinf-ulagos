import { Check, Copy, Mail } from 'lucide-react'
import { useState } from 'react'
import { CORREO_CONTACTO, enlaceCorreo } from '../lib/contacto'

/**
 * Botón para escribir por correo, con la dirección visible y un botón para copiarla.
 * Si el dispositivo no tiene una aplicación de correo configurada, el estudiante puede copiar la
 * dirección y escribir desde su correo institucional en el navegador.
 */
export function CorreoContacto({ asunto, cuerpo, texto }: { asunto: string; cuerpo: string; texto: string }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CORREO_CONTACTO)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sin portapapeles: la dirección queda visible para copiarla a mano */
    }
  }
  return (
    <div className="space-y-2">
      <a
        href={enlaceCorreo(asunto, cuerpo)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-superficie text-[15px] font-semibold ring-1 ring-bruma hover:ring-marea"
      >
        <Mail size={16} /> {texto}
      </a>
      <p className="flex items-center justify-center gap-1.5 text-[13px] text-mar-suave">
        <span className="select-all">{CORREO_CONTACTO}</span>
        <button
          type="button"
          onClick={copiar}
          aria-label={copiado ? 'Dirección copiada' : 'Copiar dirección de correo'}
          title={copiado ? 'Copiada' : 'Copiar dirección'}
          className="grid size-7 place-items-center rounded-full hover:bg-bruma"
        >
          {copiado ? <Check size={14} className="text-marea" /> : <Copy size={14} />}
        </button>
      </p>
    </div>
  )
}
