import { ShieldQuestion, X } from 'lucide-react'
import { AREAS } from '../data/mallas'
import type { Malla } from '../data/types'
import { descendientes, type Estado, type Indice } from '../lib/malla'

interface Props {
  malla: Malla
  idx: Indice
  estados: Map<string, Estado>
  plan: Set<string>
  soloLectura: boolean
  onPlan: (id: string) => void
  onLimpiar: () => void
  onIr: (id: string) => void
  onCerrar: () => void
}

export function Inscribir({ malla, idx, estados, plan, soloLectura, onPlan, onLimpiar, onIr, onCerrar }: Props) {
  const opciones = malla.asignaturas
    .filter((a) => {
      const e = estados.get(a.id)
      return e === 'disponible' || e === 'condicional'
    })
    .map((a) => ({ a, abre: descendientes(a.id, idx).size, cond: estados.get(a.id) === 'condicional' }))
    .sort((x, y) => x.a.semestre - y.a.semestre || y.abre - x.abre)

  const enPlan = opciones.filter((o) => plan.has(o.a.id))
  const sct = enPlan.reduce((t, o) => t + o.a.sct, 0)
  const horas = enPlan.reduce((t, o) => t + o.a.dd + o.a.ta, 0)
  const limite = Math.max(
    ...Array.from({ length: malla.semestres }, (_, i) =>
      malla.asignaturas.filter((a) => a.semestre === i + 1).reduce((t, a) => t + a.sct, 0),
    ),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 bg-mar px-5 pt-5 pb-4 text-white">
        <div>
          <h2 className="font-display text-[26px] leading-tight font-bold">Lo que puedes inscribir</h2>
          <p className="mt-1 text-[14px] text-white/75">
            {opciones.length === 0
              ? 'Marca tus ramos aprobados para ver tus opciones.'
              : `${opciones.length} ${opciones.length === 1 ? 'ramo cumple' : 'ramos cumplen'} las previaturas. Elige los que vas a tomar.`}
          </p>
        </div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <X size={18} />
        </button>
      </div>

      <ul className="scroll-fino flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
        {opciones.map(({ a, abre, cond }, i) => {
          const nuevoSem = i === 0 || opciones[i - 1].a.semestre !== a.semestre
          return (
            <li key={a.id}>
              {nuevoSem && <p className="mt-3 mb-1.5 px-1 font-display text-[13px] font-semibold text-mar-suave first:mt-0">Semestre {a.semestre}</p>}
              <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-bruma">
                <input
                  type="checkbox"
                  checked={plan.has(a.id)}
                  disabled={soloLectura}
                  onChange={() => onPlan(a.id)}
                  aria-label={`Agregar ${a.nombre} a mi plan`}
                  className="size-[18px] shrink-0 accent-marea"
                />
                <span aria-hidden className="h-8 w-1 shrink-0 rounded-full" style={{ background: AREAS[a.area].color }} />
                <button type="button" onClick={() => onIr(a.id)} className="min-w-0 flex-1 text-left">
                  <span className="block text-[14px] leading-snug font-semibold">{a.nombre}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-mar-suave">
                    {cond && <ShieldQuestion size={13} className="text-ambar" />}
                    {cond ? 'Con aprobación del Consejo' : abre > 0 ? `Abre ${abre} ${abre === 1 ? 'ramo' : 'ramos'} más adelante` : 'No abre otros ramos'}
                  </span>
                </button>
                <span className="font-display text-[17px] font-bold tabular-nums">
                  {a.sct}
                  <span className="ml-0.5 text-[10px] font-semibold text-mar-suave">SCT</span>
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-bruma bg-white px-5 py-3.5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-mar-suave">Tu plan</p>
            <p className="font-display text-[22px] leading-tight font-bold tabular-nums">
              {sct} SCT <span className="text-[14px] font-medium text-mar-suave">en {enPlan.length} {enPlan.length === 1 ? 'ramo' : 'ramos'}, {horas} h/semana</span>
            </p>
          </div>
          {enPlan.length > 0 && !soloLectura && (
            <button type="button" onClick={onLimpiar} className="text-[13px] font-semibold text-mar-suave underline-offset-2 hover:underline">
              Vaciar plan
            </button>
          )}
        </div>
        {sct > limite && (
          <p className="mt-1.5 text-[12px] text-amber-800">
            Superas los {limite} SCT del semestre más cargado de tu malla. Revisa la carga con tu Dirección de Carrera antes de inscribir.
          </p>
        )}
      </div>
    </div>
  )
}
