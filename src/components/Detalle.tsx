import { ArrowRight, CalendarClock, Check, CircleDashed, Clock, Lock, ShieldQuestion, X } from 'lucide-react'
import { AREAS } from '../data/mallas'
import type { Asignatura, Malla } from '../data/types'
import { descendientes, requisitoCumplido, textoDictacion, textoRequisito, type Estado, type Indice } from '../lib/malla'

interface Props {
  a: Asignatura
  malla: Malla
  idx: Indice
  estados: Map<string, Estado>
  aprobadas: Set<string>
  enPlan: boolean
  soloLectura: boolean
  onIr: (id: string) => void
  onAlternar: () => void
  onPlan: () => void
  onCerrar: () => void
}

export function Detalle({ a, malla, idx, estados, aprobadas, enPlan, soloLectura, onIr, onAlternar, onPlan, onCerrar }: Props) {
  const area = AREAS[a.area]
  const estado = estados.get(a.id)!
  const abreDirecto = idx.abre.get(a.id) ?? []
  const abrePorSem = (idx.abrePorSemestre.get(a.id) ?? []).filter((x) => !abreDirecto.includes(x))
  const totalAbre = descendientes(a.id, idx).size
  const pendientes = a.requisitos.filter((q) => !requisitoCumplido(q, malla, aprobadas))

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-4" style={{ background: area.color, color: area.tinta }}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium opacity-85">
            Semestre {a.semestre}, {area.nombre.toLowerCase()}
          </p>
          <button type="button" onClick={onCerrar} aria-label="Cerrar detalle" className="-mt-1 -mr-1 grid size-8 place-items-center rounded-full hover:bg-black/10">
            <X size={18} />
          </button>
        </div>
        <h2 className="mt-2 font-display text-[26px] leading-[1.08] font-bold text-balance">{a.nombre}</h2>
      </div>

      <div className="scroll-fino flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <EstadoAviso estado={estado} pendientes={pendientes.map((q) => textoRequisito(q, idx))} />

        <dl className="grid grid-cols-3 overflow-hidden rounded-xl border border-bruma bg-superficie">
          <Dato valor={a.sct} nombre="Créditos SCT" />
          <Dato valor={a.dd} nombre="Docencia directa (DD)" borde />
          <Dato valor={a.ta} nombre="Trabajo autónomo (TA)" borde />
        </dl>
        <p className="-mt-3.5 text-[12px] leading-snug text-mar-suave">
          DD y TA en horas semanales. Dedicación total: {a.dd + a.ta} h por semana.
        </p>

        <p className="flex items-center gap-2 rounded-xl bg-superficie px-3.5 py-2.5 text-[14px] ring-1 ring-bruma">
          <CalendarClock size={17} className="shrink-0 text-marea" />
          <span>
            Se dicta en: <strong className="font-semibold">{textoDictacion(a)}</strong>
          </span>
        </p>

        <section>
          <h3 className="font-display text-[15px] font-bold">Previaturas</h3>
          {a.requisitos.length === 0 ? (
            <p className="mt-1.5 text-[14px] text-mar-suave">Sin previatura. Puedes inscribirla desde que se dicta.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {a.requisitos.map((q, i) => {
                const ok = requisitoCumplido(q, malla, aprobadas)
                const texto = textoRequisito(q, idx)
                const icono =
                  q.tipo === 'consejo' ? (
                    <ShieldQuestion size={16} className="text-ambar" />
                  ) : ok ? (
                    <Check size={16} strokeWidth={3} className="text-marea" />
                  ) : (
                    <CircleDashed size={16} className="text-mar-suave" />
                  )
                return (
                  <li key={i}>
                    {q.tipo === 'curso' ? (
                      <button type="button" onClick={() => onIr(q.id)} className="flex w-full items-center gap-2.5 rounded-lg bg-superficie px-3 py-2 text-left text-[14px] hover:bg-marea-clara/60">
                        {icono}
                        <span className="flex-1">{texto}</span>
                        <span className="text-[12px] text-mar-suave">{ok ? 'aprobada' : 'pendiente'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 rounded-lg bg-superficie px-3 py-2 text-[14px]">
                        {icono}
                        <span className="flex-1">{texto}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section>
          <h3 className="font-display text-[15px] font-bold">Lo que abre</h3>
          {abreDirecto.length + abrePorSem.length === 0 ? (
            <p className="mt-1.5 text-[14px] text-mar-suave">No es previatura de ningún otro ramo.</p>
          ) : (
            <>
              <p className="mt-1 text-[13px] text-mar-suave">
                {totalAbre === 1 ? 'Desbloquea 1 ramo' : `Desbloquea ${totalAbre} ramos`} en la cadena completa.
              </p>
              <ul className="mt-2 space-y-1.5">
                {abreDirecto.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => onIr(h.id)} className="flex w-full items-center gap-2.5 rounded-lg bg-superficie px-3 py-2 text-left text-[14px] hover:bg-marea-clara/60">
                      <ArrowRight size={16} className="text-marea" />
                      <span className="flex-1">{h.nombre}</span>
                      <span className="text-[12px] text-mar-suave">sem. {h.semestre}</span>
                    </button>
                  </li>
                ))}
                {abrePorSem.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => onIr(h.id)} className="flex w-full items-center gap-2.5 rounded-lg bg-superficie px-3 py-2 text-left text-[14px] hover:bg-marea-clara/60">
                      <ArrowRight size={16} className="text-mar-suave" />
                      <span className="flex-1">
                        {h.nombre}
                        <span className="block text-[12px] text-mar-suave">exige tener aprobados los semestres anteriores</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {!soloLectura && (
        <div className="flex gap-2 border-t border-bruma bg-superficie px-5 py-3.5">
          <button
            type="button"
            onClick={onAlternar}
            className={`flex-1 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors ${
              estado === 'aprobada' ? 'bg-bruma text-tinta hover:bg-bruma/70' : 'bg-primario text-sobre-primario hover:bg-primario/90'
            }`}
          >
            {estado === 'aprobada' ? 'Desmarcar aprobada' : 'Marcar como aprobada'}
          </button>
          {(estado === 'disponible' || estado === 'condicional') && (
            <button
              type="button"
              onClick={onPlan}
              aria-pressed={enPlan}
              className={`rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                enPlan ? 'border-marea bg-marea text-white' : 'border-marea text-marea hover:bg-marea-clara/60'
              }`}
            >
              {enPlan ? 'En tu plan' : 'Agregar al plan'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Dato({ valor, nombre, borde }: { valor: number; nombre: string; borde?: boolean }) {
  return (
    <div className={`px-3 py-3 ${borde ? 'border-l border-bruma' : ''}`}>
      <dd className="font-display text-[28px] leading-none font-extrabold tabular-nums">{valor}</dd>
      <dt className="mt-1.5 text-[12px] leading-tight text-mar-suave">{nombre}</dt>
    </div>
  )
}

function EstadoAviso({ estado, pendientes }: { estado: Estado; pendientes: string[] }) {
  if (estado === 'aprobada')
    return (
      <p className="flex items-center gap-2 rounded-xl bg-marea-clara px-3.5 py-3 text-[14px] font-medium">
        <Check size={18} strokeWidth={3} className="text-marea" /> Ya la aprobaste.
      </p>
    )
  if (estado === 'disponible')
    return (
      <p className="flex items-center gap-2 rounded-xl bg-marea px-3.5 py-3 text-[14px] font-semibold text-white">
        <Check size={18} strokeWidth={3} /> Cumples las previaturas: puedes inscribirla.
      </p>
    )
  if (estado === 'adelantable')
    return (
      <p className="flex items-start gap-2 rounded-xl bg-superficie px-3.5 py-3 text-[14px] ring-1 ring-bruma">
        <Clock size={17} className="mt-0.5 shrink-0 text-mar-suave" />
        Cumples sus previaturas, pero corresponde a un semestre posterior al que te toca cursar.
      </p>
    )
  if (estado === 'condicional')
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 px-3.5 py-3 text-[14px] text-amber-900 dark:text-amber-200 ring-1 ring-amber-200 dark:ring-amber-800">
        <ShieldQuestion size={18} className="mt-px shrink-0" /> Para inscribirla necesitas la aprobación del Consejo de Carrera.
      </p>
    )
  return (
    <div className="flex items-start gap-2 rounded-xl bg-superficie px-3.5 py-3 text-[14px] ring-1 ring-bruma">
      <Lock size={17} className="mt-0.5 shrink-0 text-mar-suave" />
      <p>
        Aún no puedes inscribirla. Te falta: <strong className="font-semibold">{pendientes.join(', ')}</strong>.
      </p>
    </div>
  )
}
