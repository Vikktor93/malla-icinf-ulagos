import { ShieldQuestion, X } from 'lucide-react'
import { AREAS } from '../data/mallas'
import type { Asignatura, Malla } from '../data/types'
import { descendientes, type Estado, type Indice } from '../lib/malla'

interface Props {
  malla: Malla
  idx: Indice
  estados: Map<string, Estado>
  referencia: number
  plan: Set<string>
  soloLectura: boolean
  onPlan: (id: string) => void
  onLimpiar: () => void
  onIr: (id: string) => void
  onCerrar: () => void
}

interface Opcion {
  a: Asignatura
  abre: number
  cond: boolean
}

export function Inscribir({ malla, idx, estados, referencia, plan, soloLectura, onPlan, onLimpiar, onIr, onCerrar }: Props) {
  const inscribible = (a: Asignatura) => {
    const e = estados.get(a.id)
    return e === 'disponible' || e === 'condicional'
  }
  const aOpcion = (a: Asignatura): Opcion => ({
    a,
    abre: descendientes(a.id, idx).size,
    cond: estados.get(a.id) === 'condicional',
  })

  // Pendientes de semestres anteriores: primero los que más ramos abren
  const atrasados = malla.asignaturas
    .filter((a) => a.semestre < referencia && inscribible(a))
    .map(aOpcion)
    .sort((x, y) => y.abre - x.abre || x.a.semestre - y.a.semestre)
  const proximo = malla.asignaturas.filter((a) => a.semestre === referencia && inscribible(a)).map(aOpcion)
  const bloqueadosProximo = malla.asignaturas.filter((a) => a.semestre === referencia && estados.get(a.id) === 'bloqueada')

  const opciones = [...atrasados, ...proximo]
  const enPlan = opciones.filter((o) => plan.has(o.a.id))
  const sct = enPlan.reduce((t, o) => t + o.a.sct, 0)
  const horas = enPlan.reduce((t, o) => t + o.a.dd + o.a.ta, 0)

  const fila = ({ a, abre, cond }: Opcion, atrasado: boolean) => (
    <li key={a.id}>
      <div className={`flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ${atrasado ? 'ring-amber-300' : 'ring-bruma'}`}>
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
            {atrasado && `Semestre ${a.semestre}. `}
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 bg-mar px-5 pt-5 pb-4 text-white">
        <div>
          <h2 className="font-display text-[26px] leading-tight font-bold">Tu semestre {referencia}</h2>
          <p className="mt-1 text-[14px] text-white/75">
            {opciones.length === 0
              ? 'No tienes ramos disponibles para inscribir en este semestre.'
              : 'Ramos que cumplen sus previaturas. Elige los que vas a tomar.'}
          </p>
        </div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <X size={18} />
        </button>
      </div>

      <div className="scroll-fino flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {atrasados.length > 0 && (
          <section>
            <h3 className="px-1 font-display text-[15px] font-bold">Pendientes de semestres anteriores</h3>
            <p className="mt-0.5 mb-2 px-1 text-[13px] text-mar-suave">Prioriza estos ramos: te atrasan si los dejas para después.</p>
            <ul className="space-y-1.5">{atrasados.map((o) => fila(o, true))}</ul>
          </section>
        )}

        <section>
          <h3 className="px-1 font-display text-[15px] font-bold">Ramos del semestre {referencia}</h3>
          {proximo.length > 0 ? (
            <ul className="mt-2 space-y-1.5">{proximo.map((o) => fila(o, false))}</ul>
          ) : (
            <p className="mt-1 px-1 text-[13px] text-mar-suave">No hay ramos de este semestre que puedas inscribir todavía.</p>
          )}
          {bloqueadosProximo.length > 0 && (
            <p className="mt-2 px-1 text-[13px] text-mar-suave">
              {bloqueadosProximo.length === 1
                ? `${bloqueadosProximo[0].nombre} aún tiene previaturas pendientes.`
                : `${bloqueadosProximo.length} ramos de este semestre aún tienen previaturas pendientes: ${bloqueadosProximo.map((a) => a.nombre).join(', ')}.`}
            </p>
          )}
        </section>
      </div>

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
      </div>
    </div>
  )
}
