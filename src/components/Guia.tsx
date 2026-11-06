import { BookOpen, CheckCheck, FileDown, Link2, Lock, RotateCcw, Search, ShieldQuestion } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import logo from '../assets/logo-icinf.webp'
import { AREAS } from '../data/mallas'
import type { Asignatura } from '../data/types'
import type { Estado } from '../lib/malla'
import { Modal } from './Modal'
import { Tarjeta } from './Tarjeta'

type Pestana = 'malla' | 'inscribir'

export function Guia({ onCerrar }: { onCerrar: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('malla')
  return (
    <Modal titulo="Guía" subtitulo="Cómo usar la malla interactiva e inscribir tus ramos" icono={<BookOpen size={18} />} onCerrar={onCerrar}>
      <div className="sticky top-0 z-10 flex justify-center bg-niebla/95 px-5 pt-4 pb-3 backdrop-blur">
        <div className="flex rounded-full bg-white p-1 ring-1 ring-bruma" role="tablist" aria-label="Secciones de la guía">
          {(
            [
              ['malla', 'Usar la malla'],
              ['inscribir', 'Inscribir ramos'],
            ] as const
          ).map(([id, texto]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={pestana === id}
              onClick={() => setPestana(id)}
              className={`rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors ${
                pestana === id ? 'bg-mar text-white' : 'text-mar-suave hover:text-mar'
              }`}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-8 px-5 pt-3 pb-7 sm:px-7">{pestana === 'malla' ? <UsarMalla /> : <InscribirRamos />}</div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-[19px] font-bold">{titulo}</h3>
      <div className="mt-3 text-[14px] leading-relaxed">{children}</div>
    </section>
  )
}

function Item({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white text-marea ring-1 ring-bruma">{icono}</span>
      <div>
        <p className="font-semibold">{titulo}</p>
        <p className="text-mar-suave">{children}</p>
      </div>
    </li>
  )
}

const ejemplo = (nombre: string, area: Asignatura['area'], sct: number, dd: number, ta: number): Asignatura => ({
  id: `guia-${nombre}`,
  nombre,
  area,
  sct,
  dd,
  ta,
  semestre: 1,
  fila: 0,
  requisitos: [],
})

const ESTADOS: { estado: Estado; a: Asignatura; titulo: string; texto: string }[] = [
  {
    estado: 'aprobada',
    a: ejemplo('Programación', 'software', 7, 6, 5),
    titulo: 'Aprobada',
    texto: 'La marcaste como aprobada. Toma el color de su área.',
  },
  {
    estado: 'disponible',
    a: ejemplo('Cálculo II', 'basicas', 6, 6, 4),
    titulo: 'Puedes inscribirla',
    texto: 'Cumples sus previaturas y es de tu semestre o de uno anterior. Tiene borde verde.',
  },
  {
    estado: 'condicional',
    a: ejemplo('Práctica Profesional', 'electivos', 13, 0, 20),
    titulo: 'Requiere Consejo de Carrera',
    texto: 'Para inscribirla necesitas la aprobación del Consejo de Carrera. Tiene borde punteado.',
  },
  {
    estado: 'adelantable',
    a: ejemplo('Economía', 'gestion', 4, 4, 3),
    titulo: 'Semestre posterior',
    texto: 'Cumples sus previaturas, pero es de un semestre más adelante del que te toca cursar.',
  },
  {
    estado: 'bloqueada',
    a: ejemplo('Estructuras de Datos', 'software', 6, 4, 5),
    titulo: 'Previaturas pendientes',
    texto: 'Te falta aprobar alguna previatura. Se ve más tenue y con un candado.',
  },
]

const nada = () => {}

function UsarMalla() {
  return (
    <>
      <Seccion titulo="Estados de una asignatura">
        <ul className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {ESTADOS.map(({ estado, a, titulo, texto }) => (
            <li key={estado}>
              <div className="pointer-events-none w-[172px]" aria-hidden>
                <Tarjeta a={a} estado={estado} enfasis="normal" enPlan={false} soloLectura onAbrir={nada} onAlternar={nada} onHover={nada} />
              </div>
              <p className="mt-2 font-semibold">{titulo}</p>
              <p className="text-[13px] leading-snug text-mar-suave">{texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-mar-suave">
          Cada tarjeta muestra los créditos (SCT), las horas semanales de docencia directa (DD) y de trabajo autónomo (TA).
        </p>
      </Seccion>

      <Seccion titulo="Áreas de formación">
        <p className="text-mar-suave">La franja de color a la izquierda de cada tarjeta indica su área:</p>
        <ul className="mt-2.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {Object.values(AREAS).map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full" style={{ background: a.color }} /> {a.nombre}
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Marcar tu avance">
        <ul className="space-y-3.5">
          <Item icono={<span className="size-3.5 rounded-full border-2 border-current" />} titulo="Marca un ramo aprobado">
            Usa el círculo en la esquina de la tarjeta. Vuelve a presionarlo para desmarcarlo.
          </Item>
          <Item icono={<CheckCheck size={16} />} titulo="Marca un semestre completo">
            El botón junto a cada encabezado de semestre marca o desmarca todos sus ramos de una vez.
          </Item>
          <Item icono={<Search size={16} />} titulo="Busca y destaca">
            Escribe el nombre de un ramo para encontrarlo, o usa "Destacar lo que puedo inscribir" para atenuar el resto.
          </Item>
        </ul>
      </Seccion>

      <Seccion titulo="Conexiones entre ramos">
        <p>
          Pasa el cursor sobre un ramo (o tócalo en el celular) para ver sus conexiones en la malla. Las líneas{' '}
          <strong className="font-semibold">azul oscuro</strong> llegan desde sus previaturas y las líneas{' '}
          <strong className="font-semibold text-marea">verde marea</strong> van hacia los ramos que abre.
        </p>
        <svg viewBox="0 0 360 64" className="my-3 h-16 w-full max-w-[420px]" aria-hidden>
          <rect x="1" y="20" width="84" height="24" rx="6" fill="#fff" stroke="#D3DEE2" />
          <rect x="138" y="20" width="84" height="24" rx="6" fill="#fff" stroke="#123540" strokeWidth="2.5" />
          <rect x="275" y="4" width="84" height="24" rx="6" fill="#fff" stroke="#0E8A80" strokeWidth="2" />
          <rect x="275" y="36" width="84" height="24" rx="6" fill="#fff" stroke="#0E8A80" strokeWidth="2" />
          <path d="M85 32 C112 32 112 32 138 32" stroke="#123540" strokeWidth="2.4" fill="none" />
          <path d="M222 32 C248 32 248 16 275 16 M222 32 C248 32 248 48 275 48" stroke="#0E8A80" strokeWidth="2.4" fill="none" />
          <text x="43" y="36" textAnchor="middle" fontSize="10" fill="#4B6670">Previatura</text>
          <text x="180" y="36" textAnchor="middle" fontSize="10" fontWeight="700" fill="#123540">Ramo</text>
          <text x="317" y="20" textAnchor="middle" fontSize="10" fill="#4B6670">Abre</text>
          <text x="317" y="52" textAnchor="middle" fontSize="10" fill="#4B6670">Abre</text>
        </svg>
        <p className="text-mar-suave">
          Al hacer clic en un ramo se abre su detalle: estado, créditos y horas, cada previatura (cumplida o pendiente) y cuántos
          ramos desbloquea en total.
        </p>
      </Seccion>

      <Seccion titulo="Tu avance">
        <p className="text-mar-suave">
          La franja de colores de la parte superior representa toda la carrera: cada segmento es un ramo y su ancho son sus SCT.
          Junto a ella verás tus SCT aprobados, los ramos aprobados y tu avance hacia la Licenciatura (semestres 1 al 8) y hacia el Título profesional (toda la malla).
        </p>
        <ul className="mt-3.5 space-y-3.5">
          <Item icono={<Lock size={15} />} titulo="Se guarda en este navegador">
            No necesitas cuenta. Si cambias de computador o de navegador, usa el enlace para compartir tu avance.
          </Item>
          <Item icono={<Link2 size={16} />} titulo="Compartir avance">
            Copia un enlace con tus ramos aprobados, por ejemplo para revisarlo con tu profesor guía.
          </Item>
          <Item icono={<FileDown size={16} />} titulo="Descargar PDF">
            Genera un informe con tu malla, tu avance y los ramos que puedes inscribir. Puedes agregar tu nombre.
          </Item>
          <Item icono={<RotateCcw size={15} />} titulo="Reiniciar">
            Borra tu avance de la malla actual. Pide confirmación antes de hacerlo.
          </Item>
          <Item icono={<img src={logo} alt="" className="size-6" />} titulo="Cambiar de malla">
            Haz clic en el logo de la carrera para volver a la pantalla de inicio y elegir otra malla.
          </Item>
        </ul>
      </Seccion>
    </>
  )
}

/* ------------------------------------------------------------------ */

function InscribirRamos() {
  return (
    <>
      <Seccion titulo="¿Qué son los créditos SCT?">
        <p>
          El Sistema de Créditos Transferibles (SCT-Chile) mide la carga de trabajo total que te pide una asignatura: las horas
          de clases y también tu estudio personal. Según SCT-Chile, 1 crédito equivale a entre 24 y 31 horas de trabajo, y
          cada universidad fija su valor dentro de ese rango.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Dato valor="30 SCT" texto="un semestre a tiempo completo" />
          <Dato valor="60 SCT" texto="un año académico" />
          <Dato valor={`${300} SCT`} texto="la Malla 2027 completa (330 SCT la DU 416)" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 ring-1 ring-bruma">
            <p className="font-semibold">Docencia directa (DD)</p>
            <p className="text-mar-suave">Horas semanales con profesor: clases, ayudantías, laboratorios y talleres.</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-bruma">
            <p className="font-semibold">Trabajo autónomo (TA)</p>
            <p className="text-mar-suave">Horas semanales de trabajo personal: estudio, tareas, lecturas y proyectos.</p>
          </div>
        </div>
        <p className="mt-3 text-mar-suave">
          Ejemplo: Cálculo II tiene 6 DD y 4 TA, es decir, te pide unas 10 horas a la semana en total.
        </p>
      </Seccion>

      <Seccion titulo="Tu semestre">
        <p>
          La plataforma calcula qué semestre te corresponde cursar: el semestre más alto en que tienes al menos un ramo
          aprobado, más uno. El botón superior "Ramos para tu semestre" te muestra solo lo que puedes inscribir en ese semestre
          y los ramos que tengas pendientes de semestres anteriores.
        </p>
      </Seccion>

      <Seccion titulo="Qué inscribir primero">
        <ol className="space-y-3">
          <Paso n={1} titulo="Ramos pendientes de semestres anteriores">
            Aparecen primero y con borde ámbar. Priorízalos: pueden ser previatura de otros ramos y dejarlos para después te puede atrasar.
          </Paso>
          <Paso n={2} titulo="Ramos de tu semestre">
            Son los que corresponden a tu avance según la malla.
          </Paso>
          <Paso n={3} titulo="Los que abren más camino">
            Cada ramo indica cuántos ramos abre más adelante. Si tienes que elegir, prioriza los que abren más.
          </Paso>
        </ol>
      </Seccion>

      <Seccion titulo="Carga académica">
        <p>
          La carga recomendada es de <strong className="font-semibold">30 SCT por semestre</strong>. Al armar tu plan, el contador
          muestra cuántos SCT llevas.
        </p>
        <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-bruma">
          <p className="font-display text-[20px] font-bold tabular-nums">24 de 30 SCT</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bruma">
            <div className="h-full w-[80%] rounded-full bg-marea" />
          </div>
          <p className="mt-2.5 text-[13px] text-mar-suave">
            Si superas el tope, el contador cambia a ámbar y aparece un aviso. El tope es 30 SCT o los SCT que tu semestre suma
            en la malla, lo que sea mayor. Es solo informativo: no bloquea tu plan.
          </p>
        </div>
      </Seccion>

      <Seccion titulo="Requisitos especiales">
        <ul className="space-y-3.5">
          <Item icono={<ShieldQuestion size={16} className="text-ambar" />} titulo="Aprobación del Consejo de Carrera">
            Algunos ramos, como la Práctica Profesional o los Electivos Profesionales de la Malla 2027, requieren esta aprobación.
          </Item>
          <Item icono={<CheckCheck size={16} />} titulo="Semestres anteriores aprobados">
            Algunos ramos, como el Anteproyecto de Título, exigen tener aprobados todos los ramos hasta cierto semestre.
          </Item>
        </ul>
      </Seccion>

      <Seccion titulo="¿Tienes dudas?">
        <p className="text-mar-suave">
          Esta plataforma es una herramienta de apoyo: la inscripción oficial se realiza en los sistemas de la universidad. Si
          tienes dudas sobre la inscripción de asignaturas, acércate personalmente a la oficina de tu Dirección Docente.
        </p>
      </Seccion>
    </>
  )
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-bruma">
      <p className="font-display text-[24px] leading-none font-extrabold">{valor}</p>
      <p className="mt-1.5 text-[13px] leading-snug text-mar-suave">{texto}</p>
    </div>
  )
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mar font-display text-[15px] font-bold text-white">{n}</span>
      <div>
        <p className="font-semibold">{titulo}</p>
        <p className="text-mar-suave">{children}</p>
      </div>
    </li>
  )
}
