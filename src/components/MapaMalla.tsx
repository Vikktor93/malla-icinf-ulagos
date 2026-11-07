import { CheckCheck } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Malla } from '../data/types'
import { ancestros, descendientes, type Estado, type Indice } from '../lib/malla'
import { Tarjeta, type Enfasis } from './Tarjeta'

interface Props {
  malla: Malla
  idx: Indice
  estados: Map<string, Estado>
  plan: Set<string>
  foco: string | null
  filtro: 'todo' | 'inscribir'
  busqueda: string
  soloLectura: boolean
  onAbrir: (id: string) => void
  onAlternar: (id: string) => void
  onHover: (id: string | null) => void
  onSemestre: (ids: string[], aprobar: boolean) => void
}

interface Linea {
  d: string
  tipo: 'previa' | 'abre'
  directa: boolean
  largo: number
}

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function MapaMalla(p: Props) {
  const { malla, idx, estados, foco } = p
  const lienzo = useRef<HTMLDivElement>(null)
  const [lineas, setLineas] = useState<Linea[]>([])
  const [tamano, setTamano] = useState({ w: 0, h: 0 })

  const relacion = useMemo(() => {
    if (!foco) return null
    return { previas: ancestros(foco, idx), abre: descendientes(foco, idx) }
  }, [foco, idx])

  const consulta = normalizar(p.busqueda.trim())

  const enfasisDe = (id: string): Enfasis => {
    if (relacion && foco) {
      if (id === foco) return 'foco'
      if (relacion.previas.has(id)) return 'previa'
      if (relacion.abre.has(id)) return 'abre'
      return 'atenuada'
    }
    if (consulta) return normalizar(idx.porId.get(id)!.nombre).includes(consulta) ? 'normal' : 'atenuada'
    if (p.filtro === 'inscribir') {
      const e = estados.get(id)
      return e === 'disponible' || e === 'condicional' ? 'normal' : 'atenuada'
    }
    return 'normal'
  }

  // Dibuja las conexiones del ramo enfocado: toda su cadena de previaturas y todo lo que abre.
  useLayoutEffect(() => {
    const el = lienzo.current
    if (!el) return
    const medir = () => {
      setTamano({ w: el.scrollWidth, h: el.scrollHeight })
      if (!foco || !relacion) {
        setLineas([])
        return
      }
      const base = el.getBoundingClientRect()
      const caja = (id: string) => el.querySelector<HTMLElement>(`[data-id="${id}"]`)?.getBoundingClientRect()
      const conjunto = new Set([foco, ...relacion.previas, ...relacion.abre])
      const out: Linea[] = []
      for (const id of conjunto) {
        const destino = idx.porId.get(id)!
        for (const q of destino.requisitos) {
          if (q.tipo !== 'curso' || !conjunto.has(q.id)) continue
          const a = caja(q.id)
          const b = caja(id)
          if (!a || !b) continue
          const x1 = a.right - base.left
          const y1 = a.top + a.height / 2 - base.top
          const x2 = b.left - base.left
          const y2 = b.top + b.height / 2 - base.top
          const dx = Math.max(28, (x2 - x1) / 2)
          const esPrevia = id === foco || relacion.previas.has(id)
          out.push({
            d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`,
            tipo: esPrevia ? 'previa' : 'abre',
            directa: id === foco || q.id === foco,
            largo: Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 1.3),
          })
        }
      }
      setLineas(out)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [foco, relacion, idx, malla])

  const columnas = Array.from({ length: malla.semestres }, (_, i) => i + 1)

  return (
    <div className="scroll-fino overflow-x-auto pb-6">
      <div ref={lienzo} className="relative mx-auto flex w-max gap-3 px-4 sm:px-6">
        {columnas.map((s) => {
          const ramos = malla.asignaturas.filter((a) => a.semestre === s)
          const sct = ramos.reduce((t, a) => t + a.sct, 0)
          const todas = ramos.every((a) => estados.get(a.id) === 'aprobada')
          const hechos = ramos.filter((a) => estados.get(a.id) === 'aprobada').reduce((t, a) => t + a.sct, 0)
          return (
            <div key={s} className="contents">
              <section aria-label={`Semestre ${s}`} className="flex w-[172px] flex-col gap-2.5">
                <header className="sticky top-0 z-10 -mx-1 flex items-end justify-between rounded-lg bg-niebla/95 px-1 pt-2 pb-1.5 backdrop-blur">
                  <div>
                    <h3 className="font-display text-[13px] leading-none font-semibold text-mar-suave">
                      Semestre <span className="text-[22px] font-extrabold text-tinta">{s}</span>
                    </h3>
                    <div className="mt-1.5 h-[3px] w-[110px] overflow-hidden rounded-full bg-bruma">
                      <div className="h-full rounded-full bg-marea transition-[width] duration-300" style={{ width: `${(hechos / sct) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-mar-suave tabular-nums">
                      {hechos} de {sct} SCT
                    </p>
                  </div>
                  {!p.soloLectura && (
                    <button
                      type="button"
                      onClick={() => p.onSemestre(ramos.map((a) => a.id), !todas)}
                      title={todas ? `Desmarcar semestre ${s}` : `Marcar todo el semestre ${s} como aprobado`}
                      aria-label={todas ? `Desmarcar semestre ${s}` : `Marcar todo el semestre ${s} como aprobado`}
                      className={`grid size-7 place-items-center rounded-full transition-colors ${
                        todas ? 'bg-marea text-white' : 'text-mar-suave hover:bg-white hover:text-marea'
                      }`}
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                </header>
                {ramos.map((a) => (
                  <Tarjeta
                    key={a.id}
                    a={a}
                    estado={estados.get(a.id)!}
                    enfasis={enfasisDe(a.id)}
                    enPlan={p.plan.has(a.id)}
                    soloLectura={p.soloLectura}
                    onAbrir={() => p.onAbrir(a.id)}
                    onAlternar={() => p.onAlternar(a.id)}
                    onHover={(dentro) => p.onHover(dentro ? a.id : null)}
                  />
                ))}
              </section>
              {s === malla.licenciaturaTras && <Hito texto="Licenciatura en Ciencias de la Ingeniería" />}
            </div>
          )
        })}
        <Hito texto="Título de Ingeniero Civil en Informática" final />

        <svg
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-20 overflow-visible"
          width={tamano.w}
          height={tamano.h}
        >
          {lineas.map((l, i) => (
            <path
              key={`${foco}-${i}`}
              d={l.d}
              fill="none"
              className="linea-dep"
              style={{ ['--largo' as string]: l.largo, stroke: l.tipo === 'previa' ? 'var(--color-tinta)' : 'var(--color-marea)' }}
              strokeWidth={l.directa ? 2.4 : 1.4}
              strokeOpacity={l.directa ? 0.95 : 0.55}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

function Hito({ texto, final }: { texto: string; final?: boolean }) {
  return (
    <div className={`flex w-8 shrink-0 items-center justify-center rounded-lg ${final ? 'bg-mar text-white' : 'bg-bruma text-tinta'}`}>
      <span className="font-display text-[12px] font-semibold whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{texto}</span>
    </div>
  )
}
