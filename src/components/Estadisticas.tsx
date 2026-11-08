import { Info } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import type { Malla } from '../data/types'
import type { Estadisticas as Datos } from '../lib/estadisticas'

interface Props {
  malla: Malla
  datos: Datos
  onIr: (id: string) => void
  onVerMalla: () => void
}

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100))

/** Vista "Mis estadísticas": avance del estudiante en gráficos. */
export function Estadisticas({ malla, datos, onIr, onVerMalla }: Props) {
  const sinAvance = datos.titulo.aprobados === 0
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 pb-6 sm:px-6">
      {sinAvance && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-marea-clara/70 px-5 py-4 text-[14px]">
          <p>Aún no marcas ramos aprobados. Márcalos en la malla para ver tus estadísticas.</p>
          <button type="button" onClick={onVerMalla} className="h-9 rounded-full bg-primario px-4 font-semibold text-sobre-primario">
            Ir a la malla
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Hitos de la carrera" bajada="SCT aprobados de cada hito">
          <div className="flex justify-around gap-3 pt-1">
            <Anillo
              valor={datos.licenciatura.aprobados}
              total={datos.licenciatura.total}
              nombre="Licenciatura"
              detalle={`Semestres 1 al ${malla.licenciaturaTras}`}
            />
            <Anillo valor={datos.titulo.aprobados} total={datos.titulo.total} nombre="Título profesional" detalle="Malla completa" />
          </div>
        </Tarjeta>

        <Proyeccion datos={datos} />

        <RamosClave datos={datos} onIr={onIr} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarrasSemestre datos={datos} />
        </div>
        <BarrasArea datos={datos} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Tarjeta({ titulo, bajada, children }: { titulo: string; bajada?: string; children: ReactNode }) {
  return (
    <section className="flex h-full flex-col rounded-2xl bg-superficie p-5 ring-1 ring-bruma">
      <h2 className="font-display text-[17px] leading-tight font-bold">{titulo}</h2>
      {bajada && <p className="mt-0.5 text-[13px] text-mar-suave">{bajada}</p>}
      <div className="mt-4 flex-1">{children}</div>
    </section>
  )
}

/** Indicador circular de avance hacia un hito. */
function Anillo({ valor, total, nombre, detalle }: { valor: number; total: number; nombre: string; detalle: string }) {
  const r = 50
  const c = 2 * Math.PI * r
  const p = pct(valor, total)
  return (
    <figure className="flex w-[136px] flex-col items-center text-center">
      <svg viewBox="0 0 120 120" className="size-[112px] sm:size-[128px]" role="img" aria-label={`${nombre}: ${p} %, ${valor} de ${total} SCT`}>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="11" className="stroke-bruma" />
        {valor > 0 && (
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            strokeWidth="11"
            strokeLinecap="round"
            className="stroke-marea transition-[stroke-dasharray] duration-500"
            strokeDasharray={`${(c * valor) / total} ${c}`}
            transform="rotate(-90 60 60)"
          />
        )}
        <text x="60" y="62" textAnchor="middle" dominantBaseline="middle" className="fill-tinta font-display text-[26px] font-extrabold">
          {p}%
        </text>
      </svg>
      <figcaption className="mt-2">
        <span className="block text-[14px] font-semibold">{nombre}</span>
        <span className="block text-[12px] text-mar-suave tabular-nums">
          {valor} de {total} SCT
        </span>
        <span className="block text-[12px] text-mar-suave">{detalle}</span>
      </figcaption>
    </figure>
  )
}

function Proyeccion({ datos }: { datos: Datos }) {
  const { sctPendientes, cargaSemestral, porCreditos, porPreviaturas, minimo } = datos.proyeccion
  if (sctPendientes === 0) {
    return (
      <Tarjeta titulo="Proyección de egreso">
        <p className="font-display text-[28px] leading-tight font-extrabold">Malla completa</p>
        <p className="mt-2 text-[14px] text-mar-suave">Aprobaste todas las asignaturas de tu malla.</p>
      </Tarjeta>
    )
  }
  return (
    <Tarjeta titulo="Proyección de egreso" bajada="Semestres que te faltan, como mínimo">
      <p className="font-display leading-none font-extrabold">
        <span className="text-[44px] tabular-nums">{minimo}</span>
        <span className="ml-2 text-[20px]">{minimo === 1 ? 'semestre' : 'semestres'}</span>
      </p>
      <ul className="mt-4 space-y-2 text-[13px] leading-snug">
        <li className={porCreditos >= porPreviaturas ? '' : 'text-mar-suave'}>
          <strong className="font-semibold tabular-nums">{porCreditos}</strong> por créditos: te faltan {sctPendientes} SCT, con
          hasta {cargaSemestral} SCT por semestre.
        </li>
        <li className={porPreviaturas > porCreditos ? '' : 'text-mar-suave'}>
          <strong className="font-semibold tabular-nums">{porPreviaturas}</strong> por previaturas: tu cadena de ramos pendientes más
          larga tiene {porPreviaturas} {porPreviaturas === 1 ? 'eslabón' : 'eslabones'}, y cada uno toma al menos un semestre.
        </li>
      </ul>
      <p className="mt-3 flex items-start gap-2 rounded-lg bg-niebla px-3 py-2.5 text-[12px] leading-snug text-mar-suave">
        <Info size={15} className="mt-px shrink-0 text-marea" aria-hidden />
        <span>
          <strong className="font-semibold text-tinta">Estimación referencial.</strong> Supone que apruebas todos los ramos que
          inscribas y no considera el período en que se dicta cada uno, así que tu egreso real puede tomar más tiempo.
        </span>
      </p>
    </Tarjeta>
  )
}

function RamosClave({ datos, onIr }: { datos: Datos; onIr: (id: string) => void }) {
  const max = Math.max(1, ...datos.ramosClave.map((r) => r.abre))
  return (
    <Tarjeta titulo="Ramos clave pendientes" bajada="Los que más ramos desbloquean más adelante">
      {datos.ramosClave.length === 0 ? (
        <p className="text-[14px] text-mar-suave">No te quedan ramos que sean previatura de otros.</p>
      ) : (
        <ol className="space-y-2.5">
          {datos.ramosClave.map(({ a, abre }) => (
            <li key={a.id}>
              <button type="button" onClick={() => onIr(a.id)} className="group w-full text-left">
                <span className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-semibold group-hover:underline">{a.nombre}</span>
                  <span className="shrink-0 text-mar-suave tabular-nums">
                    abre {abre} {abre === 1 ? 'ramo' : 'ramos'}
                  </span>
                </span>
                <span className="mt-1 block h-2 rounded-full bg-bruma">
                  <span className="block h-full rounded-full bg-marea" style={{ width: `${(abre / max) * 100}%` }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </Tarjeta>
  )
}

/** Barras apiladas por semestre: SCT aprobados (abajo) y pendientes (arriba). */
function BarrasSemestre({ datos }: { datos: Datos }) {
  const [activo, setActivo] = useState<number | null>(null)
  const idTabla = useId()
  const max = Math.max(...datos.porSemestre.map((s) => s.sctTotal))
  const alto = 190
  const info = activo !== null ? datos.porSemestre[activo] : null

  return (
    <Tarjeta titulo="Avance por semestre" bajada="SCT aprobados y pendientes de cada semestre de la malla">
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-mar-suave">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-marea" /> Aprobados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-bruma" /> Pendientes
        </span>
      </div>

      <div className="relative">
        {/* Línea de referencia de 30 SCT */}
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-mar-suave/40" style={{ bottom: 24 + (30 / max) * alto }}>
          <span className="absolute -top-4 right-0 text-[11px] text-mar-suave">30 SCT</span>
        </div>

        <div className="flex items-end gap-1.5 sm:gap-2.5" onMouseLeave={() => setActivo(null)}>
          {datos.porSemestre.map((s, i) => {
            const hAprob = (s.sctAprobados / max) * alto
            const hPend = ((s.sctTotal - s.sctAprobados) / max) * alto
            return (
              <button
                key={s.semestre}
                type="button"
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onBlur={() => setActivo(null)}
                aria-label={`Semestre ${s.semestre}: ${s.sctAprobados} de ${s.sctTotal} SCT aprobados, ${s.ramosAprobados} de ${s.ramosTotal} ramos`}
                className="flex min-w-0 flex-1 flex-col items-stretch rounded-md pt-2 outline-offset-2 hover:bg-niebla"
                style={{ height: alto + 24 + 8 }}
              >
                <span className="flex flex-1 flex-col justify-end px-[12%]">
                  {hPend > 0 && (
                    <span
                      className={`block rounded-t-[4px] bg-bruma ${hAprob > 0 ? 'mb-[2px]' : 'rounded-b-[4px]'}`}
                      style={{ height: Math.max(hPend - (hAprob > 0 ? 2 : 0), 2) }}
                    />
                  )}
                  {hAprob > 0 && (
                    <span className={`block bg-marea ${hPend > 0 ? '' : 'rounded-t-[4px]'}`} style={{ height: hAprob }} />
                  )}
                </span>
                <span className={`h-6 pt-1.5 text-center text-[12px] tabular-nums ${activo === i ? 'font-bold' : 'text-mar-suave'}`}>
                  {s.semestre}
                </span>
              </button>
            )
          })}
        </div>

        {info && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-lg bg-mar px-3 py-2 text-[12px] leading-snug text-white shadow-lg"
            style={{ left: `${((activo! + 0.5) / datos.porSemestre.length) * 100}%` }}
          >
            <span className="block font-semibold">Semestre {info.semestre}</span>
            <span className="block tabular-nums">
              {info.sctAprobados} de {info.sctTotal} SCT ({pct(info.sctAprobados, info.sctTotal)} %)
            </span>
            <span className="block tabular-nums text-white/75">
              {info.ramosAprobados} de {info.ramosTotal} ramos aprobados
            </span>
          </div>
        )}
      </div>

      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer font-semibold text-mar-suave" aria-controls={idTabla}>
          Ver datos en tabla
        </summary>
        <table id={idTabla} className="mt-2 w-full text-left tabular-nums">
          <thead className="text-mar-suave">
            <tr>
              <th className="py-1 font-semibold">Semestre</th>
              <th className="py-1 text-right font-semibold">SCT aprobados</th>
              <th className="py-1 text-right font-semibold">Ramos aprobados</th>
            </tr>
          </thead>
          <tbody>
            {datos.porSemestre.map((s) => (
              <tr key={s.semestre} className="border-t border-bruma">
                <td className="py-1">{s.semestre}</td>
                <td className="py-1 text-right">
                  {s.sctAprobados} de {s.sctTotal}
                </td>
                <td className="py-1 text-right">
                  {s.ramosAprobados} de {s.ramosTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Tarjeta>
  )
}

/** Barras horizontales por área: cada área lleva su nombre, así el color nunca es la única pista. */
function BarrasArea({ datos }: { datos: Datos }) {
  return (
    <Tarjeta titulo="Avance por área de formación" bajada="SCT aprobados sobre el total de cada área">
      <ul className="space-y-3.5">
        {datos.porArea.map((a) => (
          <li key={a.area}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-semibold">{a.nombre}</span>
              <span className="shrink-0 text-mar-suave tabular-nums">
                {a.sctAprobados} de {a.sctTotal} SCT
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 rounded-full bg-bruma"
              role="img"
              aria-label={`${a.nombre}: ${pct(a.sctAprobados, a.sctTotal)} % aprobado`}
            >
              {a.sctAprobados > 0 && (
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(a.sctAprobados / a.sctTotal) * 100}%`, background: a.color }}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}
