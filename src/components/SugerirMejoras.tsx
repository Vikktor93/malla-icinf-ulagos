import { ExternalLink, Lightbulb } from 'lucide-react'
import type { Malla } from '../data/types'

const DISCUSIONES = 'https://github.com/Vikktor93/malla-icinf-ulagos/discussions'

/** Enlace a una discusión nueva en la categoría Ideas, con una plantilla breve ya escrita. */
function enlaceIdea(malla: Malla) {
  const cuerpo = [
    `**Malla que uso:** ${malla.nombre}`,
    '',
    '**¿Qué idea o funcionalidad propones?**',
    '',
    '',
    '**¿En qué te ayudaría a ti o a otros estudiantes?**',
    '',
  ].join('\n')
  const params = new URLSearchParams({ category: 'ideas', body: cuerpo })
  return `${DISCUSIONES}/new?${params}`
}

/** Invitación a proponer mejoras, al final de la página. */
export function SugerirMejoras({ malla }: { malla: Malla }) {
  return (
    <section
      aria-labelledby="sugerir-mejoras"
      className="flex flex-col gap-4 rounded-2xl bg-superficie p-5 ring-1 ring-bruma sm:flex-row sm:items-center sm:gap-5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
        <Lightbulb size={21} />
      </span>
      <div className="flex-1">
        <h2 id="sugerir-mejoras" className="font-display text-[18px] font-bold">
          Sugerir mejoras
        </h2>
        <p className="text-[14px] text-mar-suave">
          ¿Tienes una idea para mejorar la plataforma? ¿Una nueva funcionalidad? Compártela en GitHub Discussions, donde
          también puedes votar y comentar las ideas de otros. Necesitas una cuenta de GitHub, que es gratuita.
        </p>
      </div>
      <a
        href={enlaceIdea(malla)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primario px-5 text-[14px] font-semibold text-sobre-primario hover:bg-primario/90"
      >
        <Lightbulb size={16} /> Compartir idea <ExternalLink size={14} />
      </a>
    </section>
  )
}
