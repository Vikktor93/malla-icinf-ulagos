import type { Asignatura, Dictacion, Malla, Requisito } from '../data/types'

/**
 * - aprobada: ya la aprobó.
 * - disponible / condicional: cumple previaturas y corresponde a su próximo semestre o a uno anterior.
 * - adelantable: cumple previaturas, pero es de un semestre posterior al que le toca cursar.
 * - otroPeriodo: ramo pendiente de un semestre anterior que se dicta en el otro período del año.
 * - bloqueada: tiene previaturas pendientes.
 */
export type Estado = 'aprobada' | 'disponible' | 'condicional' | 'adelantable' | 'otroPeriodo' | 'bloqueada'

export interface Indice {
  porId: Map<string, Asignatura>
  /** id -> asignaturas que lo tienen como previatura directa */
  abre: Map<string, Asignatura[]>
  /** id -> asignaturas que exigen tener aprobado un semestre que incluye este ramo */
  abrePorSemestre: Map<string, Asignatura[]>
}

export function indexar(malla: Malla): Indice {
  const porId = new Map(malla.asignaturas.map((a) => [a.id, a]))
  const abre = new Map<string, Asignatura[]>()
  const abrePorSemestre = new Map<string, Asignatura[]>()
  for (const a of malla.asignaturas) {
    abre.set(a.id, [])
    abrePorSemestre.set(a.id, [])
  }
  for (const a of malla.asignaturas) {
    for (const q of a.requisitos) {
      if (q.tipo === 'curso') abre.get(q.id)!.push(a)
      if (q.tipo === 'semestre') {
        for (const b of malla.asignaturas) if (b.semestre <= q.n) abrePorSemestre.get(b.id)!.push(a)
      }
    }
  }
  return { porId, abre, abrePorSemestre }
}

export function requisitoCumplido(q: Requisito, malla: Malla, aprobadas: Set<string>): boolean {
  switch (q.tipo) {
    case 'curso':
      return aprobadas.has(q.id)
    case 'semestre':
      return malla.asignaturas.every((b) => b.semestre > q.n || aprobadas.has(b.id))
    case 'consejo':
      return true // no se puede verificar desde aquí: se marca como condicional
  }
}

export function estadoDe(a: Asignatura, malla: Malla, aprobadas: Set<string>): Estado {
  if (aprobadas.has(a.id)) return 'aprobada'
  const ok = a.requisitos.every((q) => requisitoCumplido(q, malla, aprobadas))
  if (!ok) return 'bloqueada'
  if (a.requisitos.some((q) => q.tipo === 'consejo')) return 'condicional'
  return 'disponible'
}

/**
 * Semestre que le corresponde cursar al estudiante: el semestre más alto en que tiene
 * al menos un ramo aprobado, más uno (sin pasarse del último semestre de la malla).
 */
export function semestreReferencia(malla: Malla, aprobadas: Set<string>): number {
  let max = 0
  for (const a of malla.asignaturas) if (aprobadas.has(a.id)) max = Math.max(max, a.semestre)
  return Math.min(max + 1, malla.semestres)
}

/* ---------- Período de dictación ---------- */

/** 1 = primer semestre del año (marzo a julio), 2 = segundo semestre (agosto a diciembre). */
export type Periodo = 1 | 2

export function dictacionDe(a: Asignatura): Dictacion {
  return a.dictacion ?? (a.semestre % 2 === 1 ? 'impar' : 'par')
}

export function seDictaEn(a: Asignatura, periodo: Periodo): boolean {
  const d = dictacionDe(a)
  return d === 'ambos' || (d === 'impar' && periodo === 1) || (d === 'par' && periodo === 2)
}

export function textoDictacion(a: Asignatura): string {
  const d = dictacionDe(a)
  return d === 'ambos' ? 'Ambos semestres del año' : d === 'impar' ? 'Primer semestre del año' : 'Segundo semestre del año'
}

/** Período del año en que se cursa un semestre de la malla: impares en el primero, pares en el segundo. */
export function periodoDeSemestre(semestre: number): Periodo {
  return semestre % 2 === 1 ? 1 : 2
}

export const nombrePeriodo = (p: Periodo) => (p === 1 ? 'primer semestre' : 'segundo semestre')

export interface OpcionesInscripcion {
  /** Período del año en que el estudiante cursa su semestre de referencia */
  periodo: Periodo
  /** Ramos pendientes de semestres anteriores que se dictan en ese período */
  atrasados: Asignatura[]
  /** Ramos del semestre de referencia que cumplen previaturas (todos se dictan en su período) */
  proximo: Asignatura[]
  /** Ramos pendientes de semestres anteriores que se dictan en el otro período */
  otroPeriodo: Asignatura[]
  /** Ramos del semestre de referencia que aún tienen previaturas pendientes */
  bloqueadosProximo: Asignatura[]
}

/**
 * Ramos que el estudiante puede inscribir en su semestre de referencia.
 * Los ramos de ese semestre se ofrecen siempre. La regla del período de dictación se aplica solo a
 * los ramos atrasados: un ramo reprobado o pendiente de un semestre impar solo se puede tomar cuando
 * el estudiante cursa un semestre impar, y lo mismo para los pares.
 */
export function opcionesInscripcion(malla: Malla, estados: Map<string, Estado>, referencia: number): OpcionesInscripcion {
  // calcularEstados ya marca como 'otroPeriodo' los atrasados que no se dictan en este período
  const inscribible = (a: Asignatura) => {
    const e = estados.get(a.id)
    return e === 'disponible' || e === 'condicional'
  }
  return {
    periodo: periodoDeSemestre(referencia),
    atrasados: malla.asignaturas.filter((a) => a.semestre < referencia && inscribible(a)),
    proximo: malla.asignaturas.filter((a) => a.semestre === referencia && inscribible(a)),
    otroPeriodo: malla.asignaturas.filter((a) => estados.get(a.id) === 'otroPeriodo'),
    bloqueadosProximo: malla.asignaturas.filter((a) => a.semestre === referencia && estados.get(a.id) === 'bloqueada'),
  }
}

/** Carga recomendada por semestre (referencial, nunca bloquea la inscripción). */
export const SCT_RECOMENDADOS = 30

/**
 * Tope para el aviso de sobrecarga: 30 SCT o los SCT oficiales del semestre, lo que sea mayor.
 * Así, quien inscribe su semestre tal como viene en la malla (p. ej. 32 SCT en el semestre 1
 * de la DU 416) no recibe el aviso.
 */
export function topeSCT(malla: Malla, semestre: number): number {
  const oficial = malla.asignaturas.filter((a) => a.semestre === semestre).reduce((t, a) => t + a.sct, 0)
  return Math.max(SCT_RECOMENDADOS, oficial)
}

/** Estados de todos los ramos, considerando el semestre de referencia del estudiante. */
export function calcularEstados(malla: Malla, aprobadas: Set<string>, referencia: number): Map<string, Estado> {
  const m = new Map<string, Estado>()
  const periodo = periodoDeSemestre(referencia)
  for (const a of malla.asignaturas) {
    const e = estadoDe(a, malla, aprobadas)
    const cumple = e === 'disponible' || e === 'condicional'
    if (cumple && a.semestre > referencia) m.set(a.id, 'adelantable')
    else if (cumple && a.semestre < referencia && !seDictaEn(a, periodo)) m.set(a.id, 'otroPeriodo')
    else m.set(a.id, e)
  }
  return m
}

export function textoRequisito(q: Requisito, idx: Indice): string {
  if (q.tipo === 'curso') return idx.porId.get(q.id)?.nombre ?? q.id
  if (q.tipo === 'semestre') return `Semestres 1 al ${q.n} aprobados`
  return 'Aprobación del Consejo de Carrera'
}

/** Todas las asignaturas que dependen (directa o indirectamente) de `id` */
export function descendientes(id: string, idx: Indice): Set<string> {
  const out = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const actual = pila.pop()!
    for (const h of [...(idx.abre.get(actual) ?? []), ...(idx.abrePorSemestre.get(actual) ?? [])]) {
      if (!out.has(h.id)) {
        out.add(h.id)
        pila.push(h.id)
      }
    }
  }
  return out
}

/** Todas las previaturas (directas o indirectas) de `id`, solo por ramo */
export function ancestros(id: string, idx: Indice): Set<string> {
  const out = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const a = idx.porId.get(pila.pop()!)
    for (const q of a?.requisitos ?? []) {
      if (q.tipo === 'curso' && !out.has(q.id)) {
        out.add(q.id)
        pila.push(q.id)
      }
    }
  }
  return out
}

/* ---------- Guardar y compartir avance ---------- */

/** Codifica las aprobadas como un mapa de bits en base64url (orden de la malla). */
export function codificar(malla: Malla, aprobadas: Set<string>): string {
  const bytes = new Uint8Array(Math.ceil(malla.asignaturas.length / 8))
  malla.asignaturas.forEach((a, i) => {
    if (aprobadas.has(a.id)) bytes[i >> 3] |= 1 << (i & 7)
  })
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodificar(malla: Malla, txt: string): Set<string> {
  const out = new Set<string>()
  try {
    const bin = atob(txt.replace(/-/g, '+').replace(/_/g, '/'))
    malla.asignaturas.forEach((a, i) => {
      const b = bin.charCodeAt(i >> 3)
      if (b & (1 << (i & 7))) out.add(a.id)
    })
  } catch {
    /* enlace inválido: se ignora */
  }
  return out
}
