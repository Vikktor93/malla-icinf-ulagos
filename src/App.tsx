import { BookOpen, FileDown, Flag, Link2, ListChecks, RotateCcw, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Cinta } from './components/Cinta'
import { Detalle } from './components/Detalle'
import { Guia } from './components/Guia'
import { Inscribir } from './components/Inscribir'
import { MapaMalla } from './components/MapaMalla'
import { Reportar } from './components/Reportar'
import { AREAS, MALLAS } from './data/mallas'
import type { Malla } from './data/types'
import { calcularEstados, indexar, semestreReferencia } from './lib/malla'
import { useProgreso } from './lib/useProgreso'
import logo from './assets/logo-icinf.png'

type Vista = { tipo: 'detalle'; id: string } | { tipo: 'inscribir' } | null

export default function App() {
  const prog = useProgreso()
  const { malla } = prog
  if (!malla) return <Bienvenida onElegir={prog.elegirMalla} />
  return <Plataforma key={malla.id} prog={prog} malla={malla} />
}

function Plataforma({ prog, malla }: { prog: ReturnType<typeof useProgreso>; malla: Malla }) {
  const idx = useMemo(() => indexar(malla), [malla])
  const [vista, setVista] = useState<Vista>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todo' | 'inscribir'>('todo')
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [dialogoPDF, setDialogoPDF] = useState(false)
  const [guia, setGuia] = useState(false)
  const [reportar, setReportar] = useState(false)
  const [nombre, setNombre] = useState(() => {
    try {
      return localStorage.getItem('icinf:nombre') ?? ''
    } catch {
      return ''
    }
  })
  const soloLectura = prog.viendoCompartido

  const referencia = useMemo(() => semestreReferencia(malla, prog.aprobadas), [malla, prog.aprobadas])
  const estados = useMemo(() => calcularEstados(malla, prog.aprobadas, referencia), [malla, prog.aprobadas, referencia])

  const total = malla.asignaturas.reduce((t, a) => t + a.sct, 0)
  const sctAprob = malla.asignaturas.filter((a) => prog.aprobadas.has(a.id)).reduce((t, a) => t + a.sct, 0)
  const lic = malla.asignaturas.filter((a) => a.semestre <= malla.licenciaturaTras)
  const licTotal = lic.reduce((t, a) => t + a.sct, 0)
  const licAprob = lic.filter((a) => prog.aprobadas.has(a.id)).reduce((t, a) => t + a.sct, 0)
  const disponibles = [...estados.values()].filter((e) => e === 'disponible' || e === 'condicional').length
  const carreraCompleta = prog.aprobadas.size === malla.asignaturas.length

  const seleccion = vista?.tipo === 'detalle' ? vista.id : null
  const foco = hover ?? seleccion

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setVista(null)
      setDialogoPDF(false)
    }
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 2600)
    return () => clearTimeout(t)
  }, [aviso])

  const compartir = async () => {
    const url = prog.enlace()
    try {
      await navigator.clipboard.writeText(url)
      setAviso('Enlace copiado. Quien lo abra verá tu avance.')
    } catch {
      prompt('Copia este enlace para compartir tu avance:', url)
    }
  }

  const exportarPDF = async () => {
    const limpio = nombre.trim()
    try {
      localStorage.setItem('icinf:nombre', limpio)
    } catch {
      /* noop */
    }
    setGenerandoPDF(true)
    try {
      const { descargarPDF } = await import('./lib/pdf')
      await descargarPDF({
        malla,
        aprobadas: prog.aprobadas,
        estados,
        referencia,
        // En un avance compartido no se incluye el plan propio
        plan: soloLectura ? new Set() : prog.plan,
        nombre: limpio,
      })
      setDialogoPDF(false)
      setAviso('PDF descargado.')
    } catch {
      setAviso('No se pudo generar el PDF. Inténtalo de nuevo.')
    } finally {
      setGenerandoPDF(false)
    }
  }

  const cerrarGuia = useCallback(() => setGuia(false), [])
  const cerrarReportar = useCallback(() => setReportar(false), [])

  const otra = malla.id === 'du416' ? MALLAS['2027'] : MALLAS.du416

  return (
    <div className="min-h-dvh">
      {/* Barra superior */}
      <header className="bg-mar text-white">
        <div className="mx-auto max-w-[1500px] px-4 pt-5 pb-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={prog.volverInicio}
                title="Volver a elegir malla"
                aria-label="Volver a la pantalla de inicio para elegir malla"
                className="shrink-0 rounded-full transition-transform hover:scale-105"
              >
                <img src={logo} alt="" className="size-14 sm:size-16" />
              </button>
              <div>
              <p className="text-[13px] text-white/65">Ingeniería Civil en Informática, Universidad de Los Lagos</p>
              <h1 className="mt-1 font-display text-[30px] leading-none font-extrabold sm:text-[38px]">
                {malla.nombre}
                <span className="ml-3 align-middle text-[14px] font-medium text-white/65 sm:text-[15px]">{malla.cohortes}</span>
              </h1>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
            <nav className="flex gap-2" aria-label="Ayuda">
              <button
                type="button"
                onClick={() => setGuia(true)}
                className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
              >
                <BookOpen size={15} /> Guía
              </button>
              <button
                type="button"
                onClick={() => setReportar(true)}
                className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Flag size={15} /> Reportar problema
              </button>
            </nav>
            <div className="flex rounded-full bg-white/10 p-1" role="radiogroup" aria-label="Elegir malla">
              {[MALLAS.du416, MALLAS['2027']].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={m.id === malla.id}
                  onClick={() => prog.elegirMalla(m.id)}
                  className={`rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors ${
                    m.id === malla.id ? 'bg-white text-mar' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {m.id === 'du416' ? 'DU 416 (2024 a 2026)' : 'Malla 2027'}
                </button>
              ))}
            </div>
            </div>
          </div>

          <div className="mt-6">
            <Cinta malla={malla} estados={estados} onFoco={setHover} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Cifra valor={`${sctAprob}`} sufijo={`de ${total} SCT`} texto={`${Math.round((sctAprob / total) * 100)}% de la carrera`} />
            <Cifra valor={`${prog.aprobadas.size}`} sufijo={`de ${malla.asignaturas.length}`} texto="ramos aprobados" />
            <Cifra valor={`${Math.round((licAprob / licTotal) * 100)}%`} texto="hacia la Licenciatura" />
            <button
              type="button"
              onClick={() => setVista({ tipo: 'inscribir' })}
              className="ml-auto flex items-center gap-2 rounded-full bg-[#5fc7bb] px-5 py-2.5 text-[15px] font-bold text-mar transition-colors hover:bg-[#7dd6cb]"
            >
              <ListChecks size={18} />
              {carreraCompleta
                ? 'Completaste la malla'
                : `Ramos para tu semestre ${referencia}`}
              {!carreraCompleta && (
                <span className="rounded-full bg-mar/15 px-2 py-px text-[13px] tabular-nums">{disponibles}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {soloLectura && (
        <div className="border-b border-amber-200 bg-amber-50 text-amber-950">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2.5 text-[14px] sm:px-6">
            <p className="flex-1">Estás viendo un avance compartido. Tu propio avance no ha cambiado.</p>
            <button type="button" onClick={prog.adoptarCompartido} className="rounded-full bg-mar px-3.5 py-1.5 font-semibold text-white">
              Usar este avance como mío
            </button>
            <button type="button" onClick={prog.descartarCompartido} className="rounded-full px-3.5 py-1.5 font-semibold ring-1 ring-amber-300">
              Volver a mi avance
            </button>
          </div>
        </div>
      )}

      {/* Herramientas */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2.5 px-4 pt-5 pb-3 sm:px-6">
        <label className="relative">
          <span className="sr-only">Buscar asignatura</span>
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mar-suave" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar asignatura"
            className="h-9 w-56 rounded-full bg-white pr-8 pl-9 text-[14px] ring-1 ring-bruma placeholder:text-mar-suave/80 focus:ring-2 focus:ring-marea focus:outline-none"
          />
          {busqueda && (
            <button type="button" onClick={() => setBusqueda('')} aria-label="Borrar búsqueda" className="absolute top-1/2 right-2 -translate-y-1/2 text-mar-suave">
              <X size={15} />
            </button>
          )}
        </label>
        <button
          type="button"
          aria-pressed={filtro === 'inscribir'}
          onClick={() => setFiltro((f) => (f === 'todo' ? 'inscribir' : 'todo'))}
          className={`h-9 rounded-full px-4 text-[14px] font-semibold transition-colors ${
            filtro === 'inscribir' ? 'bg-marea text-white' : 'bg-white text-mar ring-1 ring-bruma hover:ring-marea'
          }`}
        >
          Destacar lo que puedo inscribir
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={compartir} className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold ring-1 ring-bruma hover:ring-marea">
            <Link2 size={16} /> Compartir avance
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDialogoPDF((v) => !v)}
              aria-expanded={dialogoPDF}
              className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold ring-1 ring-bruma hover:ring-marea"
            >
              <FileDown size={16} /> Descargar PDF
            </button>
            {dialogoPDF && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  exportarPDF()
                }}
                className="absolute top-11 right-0 z-30 w-[300px] rounded-2xl bg-white p-4 shadow-[0_12px_40px_-12px_rgba(18,53,64,0.45)] ring-1 ring-bruma"
              >
                <label htmlFor="nombre-pdf" className="block text-[14px] font-semibold">
                  Nombre del estudiante <span className="font-normal text-mar-suave">(opcional)</span>
                </label>
                <input
                  id="nombre-pdf"
                  autoFocus
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Aparecerá en el encabezado del PDF"
                  className="mt-2 h-10 w-full rounded-lg bg-niebla px-3 text-[14px] ring-1 ring-bruma placeholder:text-mar-suave/70 focus:ring-2 focus:ring-marea focus:outline-none"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialogoPDF(false)} className="h-9 rounded-full px-3 text-[14px] font-semibold text-mar-suave">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={generandoPDF}
                    className="h-9 rounded-full bg-mar px-4 text-[14px] font-semibold text-white hover:bg-mar/90 disabled:opacity-60"
                  >
                    {generandoPDF ? 'Generando PDF…' : 'Descargar PDF'}
                  </button>
                </div>
              </form>
            )}
          </div>
          {!soloLectura &&
            (confirmarReinicio ? (
              <span className="flex items-center gap-1.5 text-[14px]">
                <button
                  type="button"
                  onClick={() => {
                    prog.reiniciar()
                    setConfirmarReinicio(false)
                  }}
                  className="h-9 rounded-full bg-red-700 px-4 font-semibold text-white"
                >
                  Borrar mi avance
                </button>
                <button type="button" onClick={() => setConfirmarReinicio(false)} className="h-9 rounded-full px-3 font-semibold text-mar-suave">
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarReinicio(true)}
                title="Reiniciar avance"
                aria-label="Reiniciar avance"
                className="grid size-9 place-items-center rounded-full bg-white text-mar-suave ring-1 ring-bruma hover:text-mar"
              >
                <RotateCcw size={16} />
              </button>
            ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Leyenda />
      </div>
      <details className="mx-4 rounded-xl bg-white/60 px-3 py-2 ring-1 ring-bruma md:hidden">
        <summary className="cursor-pointer text-[14px] font-semibold">Ver simbología</summary>
        <div className="-mx-4 mt-2">
          <Leyenda />
        </div>
      </details>

      <main className="mt-2">
        <MapaMalla
          malla={malla}
          idx={idx}
          estados={estados}
          plan={prog.plan}
          foco={foco}
          filtro={filtro}
          busqueda={busqueda}
          soloLectura={soloLectura}
          onAbrir={(id) => setVista({ tipo: 'detalle', id })}
          onAlternar={prog.alternar}
          onHover={setHover}
          onSemestre={prog.fijarVarias}
        />
      </main>

      <footer className="mx-auto max-w-[1500px] px-4 pb-8 text-[13px] leading-relaxed text-mar-suave sm:px-6">
        <p className="border-t border-bruma pt-4 text-center text-balance">
          Tu avance se guarda solo en este navegador. Esta herramienta es referencial: la inscripción oficial y la validación de
          previaturas se realizan en los sistemas de la universidad. ¿Ingresaste en otra cohorte? Cambia a la{' '}
          <button type="button" onClick={() => prog.elegirMalla(otra.id)} className="font-semibold text-mar underline underline-offset-2">
            {otra.nombre}
          </button>
          . Plataforma desarrollada por{' '}
          <a
            href="https://github.com/Vikktor93/malla-icinf-ulagos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-mar underline underline-offset-2"
          >
            @Vikktor93
          </a>
          .
        </p>
      </footer>

      {/* Panel lateral */}
      <div
        className={`fixed inset-0 z-30 bg-mar/25 transition-opacity duration-200 sm:hidden ${vista ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setVista(null)}
      />
      <aside
        aria-hidden={!vista}
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-[420px] bg-niebla shadow-[-12px_0_40px_-12px_rgba(18,53,64,0.35)] transition-transform duration-250 ease-out ${
          vista ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {vista?.tipo === 'detalle' && (
          <Detalle
            key={vista.id}
            a={idx.porId.get(vista.id)!}
            malla={malla}
            idx={idx}
            estados={estados}
            aprobadas={prog.aprobadas}
            enPlan={prog.plan.has(vista.id)}
            soloLectura={soloLectura}
            onIr={(id) => setVista({ tipo: 'detalle', id })}
            onAlternar={() => prog.alternar(vista.id)}
            onPlan={() => prog.alternarPlan(vista.id)}
            onCerrar={() => setVista(null)}
          />
        )}
        {vista?.tipo === 'inscribir' && (
          <Inscribir
            malla={malla}
            idx={idx}
            estados={estados}
            referencia={referencia}
            plan={prog.plan}
            soloLectura={soloLectura}
            onPlan={prog.alternarPlan}
            onLimpiar={prog.limpiarPlan}
            onIr={(id) => setVista({ tipo: 'detalle', id })}
            onCerrar={() => setVista(null)}
          />
        )}
      </aside>

      {guia && <Guia onCerrar={cerrarGuia} />}
      {reportar && <Reportar malla={malla} onCerrar={cerrarReportar} />}

      {aviso && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-mar px-5 py-2.5 text-[14px] font-medium text-white shadow-lg">
          {aviso}
        </div>
      )}
    </div>
  )
}

function Cifra({ valor, sufijo, texto }: { valor: string; sufijo?: string; texto: string }) {
  return (
    <p className="leading-tight">
      <span className="font-display text-[26px] font-extrabold tabular-nums">{valor}</span>
      {sufijo && <span className="ml-1.5 text-[14px] font-semibold text-white/80">{sufijo}</span>}
      <span className="block text-[13px] text-white/65">{texto}</span>
    </p>
  )
}

function Leyenda() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 text-[13px] text-mar-suave sm:px-6">
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[auto_1fr] lg:gap-x-10">
        {/* Estados del ramo */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] bg-[#3E6FB0]" /> Aprobada (color de su área)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] bg-white ring-2 ring-marea" /> Puedes inscribirla
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] bg-white outline-2 outline-dashed outline-ambar" /> Requiere Consejo de Carrera
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] bg-white opacity-60 ring-1 ring-bruma" /> Con previaturas pendientes
          </span>
        </div>
        {/* Áreas de formación */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
          {Object.values(AREAS).map((a) => (
            <span key={a.id} className="flex items-center gap-1.5">
              <span className="h-3.5 w-1 rounded-full" style={{ background: a.color }} /> {a.nombre}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[12.5px]">
        Pasa el cursor o toca un ramo para ver sus conexiones: en azul oscuro sus previaturas, en verde marea lo que abre.
      </p>
    </div>
  )
}

function Bienvenida({ onElegir }: { onElegir: (id: Malla['id']) => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-mar px-5 py-12 text-white">
      <div className="w-full max-w-[920px]">
        <img src={logo} alt="Logo de Ingeniería Civil en Informática, Universidad de Los Lagos" className="mb-7 size-24 sm:size-28" />
        <p className="text-[14px] text-white/65">Ingeniería Civil en Informática, Universidad de Los Lagos</p>
        <h1 className="mt-3 font-display text-[40px] leading-[1.02] font-extrabold sm:text-[60px] md:whitespace-nowrap">
          ¿Con qué malla estudias?
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-white/80">
          Marca los ramos que ya aprobaste y verás qué puedes inscribir, cuántos créditos llevas y qué abre cada asignatura.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[MALLAS.du416, MALLAS['2027']].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onElegir(m.id)}
              className="group rounded-2xl bg-white/[0.07] p-6 text-left ring-1 ring-white/15 transition-colors hover:bg-white hover:text-mar"
            >
              <span className="block font-display text-[30px] leading-none font-extrabold">{m.nombre}</span>
              <span className="mt-2 block text-[16px] font-semibold">{m.cohortes}</span>
              <span className="mt-4 block text-[14px] opacity-70">
                {m.semestres} semestres, {m.asignaturas.reduce((t, a) => t + a.sct, 0)} SCT, {m.asignaturas.length} asignaturas
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
