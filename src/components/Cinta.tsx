import { AREAS } from '../data/mallas'
import type { Malla } from '../data/types'
import type { Estado } from '../lib/malla'

/**
 * La carrera completa en una sola franja: cada segmento es un ramo, su ancho son sus SCT.
 * Los ramos aprobados toman el color de su área; los disponibles brillan en color marea.
 */
export function Cinta({ malla, estados, onFoco }: { malla: Malla; estados: Map<string, Estado>; onFoco: (id: string | null) => void }) {
  const total = malla.asignaturas.reduce((t, a) => t + a.sct, 0)
  return (
    <div className="flex h-4 w-full gap-[3px]" role="img" aria-label="Avance por semestre">
      {Array.from({ length: malla.semestres }, (_, i) => {
        const ramos = malla.asignaturas.filter((a) => a.semestre === i + 1)
        const sct = ramos.reduce((t, a) => t + a.sct, 0)
        return (
          <div key={i} className="flex gap-px overflow-hidden rounded-[3px]" style={{ flex: `${sct / total} 1 0` }}>
            {ramos.map((a) => {
              const e = estados.get(a.id)
              const bg =
                e === 'aprobada' ? AREAS[a.area].color : e === 'disponible' || e === 'condicional' ? '#5fc7bb' : 'rgba(255,255,255,0.14)'
              return (
                <span
                  key={a.id}
                  title={a.nombre}
                  onMouseEnter={() => onFoco(a.id)}
                  onMouseLeave={() => onFoco(null)}
                  className="h-full"
                  style={{ flex: `${a.sct} 1 0`, background: bg }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
