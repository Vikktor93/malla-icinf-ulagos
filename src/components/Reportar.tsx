import { ExternalLink, Flag } from 'lucide-react'
import type { Malla } from '../data/types'
import { CorreoContacto } from './CorreoContacto'
import { Modal } from './Modal'

const REPOSITORIO = 'https://github.com/Vikktor93/malla-icinf-ulagos'

/** Enlace a un issue nuevo con la malla y una plantilla breve ya escritas. */
function enlaceIssue(malla: Malla) {
  const cuerpo = [
    `**Malla:** ${malla.nombre}`,
    '',
    '**¿Qué problema encontraste?**',
    '',
    '',
    '**Asignatura relacionada (si aplica):**',
    '',
    '',
    '**¿Qué debería decir o hacer la plataforma?**',
    '',
  ].join('\n')
  const params = new URLSearchParams({ title: `[${malla.nombreCorto}] `, body: cuerpo })
  return `${REPOSITORIO}/issues/new?${params}`
}

export function Reportar({ malla, onCerrar }: { malla: Malla; onCerrar: () => void }) {
  return (
    <Modal titulo="Reportar un problema" icono={<Flag size={17} />} ancho="max-w-[520px]" onCerrar={onCerrar}>
      <div className="space-y-4 px-5 py-5 text-[14px] leading-relaxed sm:px-6">
        <p className="font-display text-[18px] leading-snug font-bold">
          ¿Encontraste un problema? ¿Información incorrecta? ¿Un ramo que falta?
        </p>
        <p className="text-mar-suave">
          Cuéntanos qué viste: un error al usar la plataforma, créditos u horas que no coinciden con la malla oficial, una
          previatura mal indicada o una asignatura que no aparece.
        </p>
        <a
          href={enlaceIssue(malla)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primario text-[15px] font-semibold text-sobre-primario hover:bg-primario/90"
        >
          Reportar en GitHub <ExternalLink size={16} />
        </a>
        <p className="-mt-2 text-center text-[13px] text-mar-suave">Requiere una cuenta de GitHub, que es gratuita.</p>

        <div className="flex items-center gap-3 text-[13px] text-mar-suave" aria-hidden>
          <span className="h-px flex-1 bg-bruma" /> o <span className="h-px flex-1 bg-bruma" />
        </div>

        <CorreoContacto
          texto="Reportar por correo electrónico"
          asunto={`[Malla ICINF] Reporte de problema (${malla.nombre})`}
          cuerpo={[
            `Malla: ${malla.nombre}`,
            '',
            '¿Qué problema encontraste?',
            '',
            '',
            'Asignatura relacionada (si aplica):',
            '',
            '',
            '¿Qué debería decir o hacer la plataforma?',
            '',
          ].join('\n')}
        />
      </div>
    </Modal>
  )
}
