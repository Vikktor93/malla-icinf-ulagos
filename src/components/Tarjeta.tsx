import { CalendarClock, Check, Lock, ShieldQuestion } from 'lucide-react'
import { AREAS } from '../data/mallas'
import type { Asignatura } from '../data/types'
import type { Estado } from '../lib/malla'

export type Enfasis = 'normal' | 'foco' | 'previa' | 'abre' | 'atenuada'

interface Props {
  a: Asignatura
  estado: Estado
  enfasis: Enfasis
  enPlan: boolean
  soloLectura: boolean
  onAbrir: () => void
  onAlternar: () => void
  onHover: (dentro: boolean) => void
}

const etiquetaEstado: Record<Estado, string> = {
  aprobada: 'Aprobada',
  disponible: 'Puedes inscribirla',
  condicional: 'Requiere aprobación del Consejo de Carrera',
  adelantable: 'Corresponde a un semestre posterior',
  otroPeriodo: 'Pendiente, se dicta en el otro período del año',
  bloqueada: 'Tiene previaturas pendientes',
}

export function Tarjeta({ a, estado, enfasis, enPlan, soloLectura, onAbrir, onAlternar, onHover }: Props) {
  const area = AREAS[a.area]
  const aprobada = estado === 'aprobada'

  const fondo = aprobada ? area.color : 'var(--color-superficie)'
  const tinta = aprobada ? area.tinta : undefined

  const anillo =
    enfasis === 'foco'
      ? 'ring-[3px] ring-tinta'
      : enfasis === 'previa'
        ? 'ring-2 ring-tinta/70'
        : enfasis === 'abre'
          ? 'ring-2 ring-marea'
          : estado === 'disponible'
            ? 'ring-2 ring-marea/80'
            : estado === 'condicional'
              ? 'outline-2 outline-dashed outline-ambar/80'
              : 'ring-1 ring-bruma'

  const atenuar = enfasis === 'atenuada' ? 'opacity-30' : estado === 'bloqueada' && enfasis === 'normal' ? 'opacity-70' : ''

  return (
    <div
      data-id={a.id}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative flex h-[96px] w-full flex-col rounded-[10px] text-left transition-[opacity,box-shadow] duration-150 ${anillo} ${atenuar}`}
      style={{ background: fondo, color: tinta }}
    >
      {/* Franja del área: identifica el área sin teñir toda la tarjeta */}
      {!aprobada && (
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-[4px] rounded-r-full"
          style={{ background: area.color, opacity: estado === 'bloqueada' ? 0.5 : 1 }}
        />
      )}

      <button
        type="button"
        onClick={onAbrir}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={`${a.nombre}. ${etiquetaEstado[estado]}. ${a.sct} SCT. Ver detalle`}
        className="flex min-h-0 flex-1 flex-col rounded-[10px] py-2 pr-2.5 pl-3.5 text-left"
      >
        <span className={`line-clamp-3 pr-6 text-[13px] leading-[1.22] font-semibold ${estado === 'bloqueada' && !aprobada ? 'text-mar-suave' : ''}`}>
          {a.nombre}
        </span>
        <span className="mt-auto flex items-baseline gap-2 text-[11px] whitespace-nowrap tabular-nums">
          <span className="font-display text-[15px] font-bold">
            {a.sct}
            <span className="ml-0.5 text-[10px] font-semibold opacity-75">SCT</span>
          </span>
          <span className="opacity-70">{a.dd} DD</span>
          <span className="opacity-70">{a.ta} TA</span>
          {enPlan && !aprobada && (
            <span title="En tu plan" className="ml-auto self-center rounded-full bg-marea px-1.5 text-[10px] leading-[16px] font-semibold text-white">Plan</span>
          )}
        </span>
      </button>

      {/* Marcar aprobada */}
      <button
        type="button"
        onClick={onAlternar}
        disabled={soloLectura}
        title={aprobada ? 'Desmarcar' : 'Marcar como aprobada'}
        aria-label={aprobada ? `Desmarcar ${a.nombre}` : `Marcar ${a.nombre} como aprobada`}
        aria-pressed={aprobada}
        className={`absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full transition-colors ${
          aprobada
            ? 'bg-white/90 text-mar'
            : estado === 'bloqueada' || estado === 'otroPeriodo'
              ? 'text-mar-suave/70 hover:bg-bruma'
              : 'border border-bruma text-transparent hover:border-marea hover:text-marea'
        } disabled:cursor-default`}
      >
        {aprobada ? (
          <Check size={15} strokeWidth={3} />
        ) : estado === 'bloqueada' ? (
          <Lock size={13} />
        ) : estado === 'otroPeriodo' ? (
          <CalendarClock size={13} />
        ) : estado === 'condicional' ? (
          <ShieldQuestion size={14} className="text-ambar" />
        ) : (
          <Check size={14} strokeWidth={3} />
        )}
      </button>
    </div>
  )
}
