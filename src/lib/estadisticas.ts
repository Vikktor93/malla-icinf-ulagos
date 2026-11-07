import { AREAS } from '../data/mallas'
import type { AreaId, Asignatura, Malla } from '../data/types'
import { descendientes, SCT_RECOMENDADOS, type Indice } from './malla'

const sumaSCT = (xs: Asignatura[]) => xs.reduce((t, a) => t + a.sct, 0)

export interface AvanceSemestre {
  semestre: number
  sctTotal: number
  sctAprobados: number
  ramosTotal: number
  ramosAprobados: number
}

export interface AvanceArea {
  area: AreaId
  nombre: string
  color: string
  sctTotal: number
  sctAprobados: number
}

export interface RamoClave {
  a: Asignatura
  abre: number
}

export interface Estadisticas {
  porSemestre: AvanceSemestre[]
  porArea: AvanceArea[]
  licenciatura: { aprobados: number; total: number }
  titulo: { aprobados: number; total: number }
  ramosClave: RamoClave[]
  proyeccion: {
    sctPendientes: number
    /** Carga semestral usada para el cálculo: 30 SCT o el semestre más cargado de la malla */
    cargaSemestral: number
    /** Semestres necesarios solo por créditos, con esa carga */
    porCreditos: number
    /** Semestres necesarios por la cadena de previaturas más larga pendiente */
    porPreviaturas: number
    /** Estimación mínima: el mayor de los dos valores anteriores */
    minimo: number
  }
}

/**
 * Cadena más larga de ramos pendientes que dependen unos de otros. Cada eslabón necesita al menos
 * un semestre, así que es un mínimo de semestres para terminar, sin importar los créditos.
 */
function cadenaPendienteMasLarga(malla: Malla, aprobadas: Set<string>, idx: Indice): number {
  const pendientes = malla.asignaturas.filter((a) => !aprobadas.has(a.id))
  const memo = new Map<string, number>()
  const profundidad = (a: Asignatura): number => {
    const guardada = memo.get(a.id)
    if (guardada !== undefined) return guardada
    let max = 0
    for (const q of a.requisitos) {
      if (q.tipo === 'curso' && !aprobadas.has(q.id)) max = Math.max(max, profundidad(idx.porId.get(q.id)!))
      if (q.tipo === 'semestre') {
        for (const b of pendientes) if (b.semestre <= q.n) max = Math.max(max, profundidad(b))
      }
    }
    memo.set(a.id, max + 1)
    return max + 1
  }
  return pendientes.reduce((m, a) => Math.max(m, profundidad(a)), 0)
}

export function calcularEstadisticas(malla: Malla, aprobadas: Set<string>, idx: Indice): Estadisticas {
  const aprob = (xs: Asignatura[]) => xs.filter((a) => aprobadas.has(a.id))

  const porSemestre = Array.from({ length: malla.semestres }, (_, i) => {
    const ramos = malla.asignaturas.filter((a) => a.semestre === i + 1)
    return {
      semestre: i + 1,
      sctTotal: sumaSCT(ramos),
      sctAprobados: sumaSCT(aprob(ramos)),
      ramosTotal: ramos.length,
      ramosAprobados: aprob(ramos).length,
    }
  })

  // Las áreas se muestran en el orden fijo de AREAS, no ordenadas por avance
  const porArea = Object.values(AREAS)
    .map((area) => {
      const ramos = malla.asignaturas.filter((a) => a.area === area.id)
      return { area: area.id, nombre: area.nombre, color: area.color, sctTotal: sumaSCT(ramos), sctAprobados: sumaSCT(aprob(ramos)) }
    })
    .filter((a) => a.sctTotal > 0)

  const lic = malla.asignaturas.filter((a) => a.semestre <= malla.licenciaturaTras)

  const ramosClave = malla.asignaturas
    .filter((a) => !aprobadas.has(a.id))
    .map((a) => ({ a, abre: descendientes(a.id, idx).size }))
    .filter((r) => r.abre > 0)
    .sort((x, y) => y.abre - x.abre || x.a.semestre - y.a.semestre)
    .slice(0, 5)

  const sctPendientes = sumaSCT(malla.asignaturas) - sumaSCT(aprob(malla.asignaturas))
  // Con 30 SCT exactos la DU 416 daría un semestre de más, porque varios de sus semestres suman 31 o 32
  const cargaSemestral = Math.max(SCT_RECOMENDADOS, ...porSemestre.map((s) => s.sctTotal))
  const porCreditos = Math.ceil(sctPendientes / cargaSemestral)
  const porPreviaturas = cadenaPendienteMasLarga(malla, aprobadas, idx)

  return {
    porSemestre,
    porArea,
    licenciatura: { aprobados: sumaSCT(aprob(lic)), total: sumaSCT(lic) },
    titulo: { aprobados: sumaSCT(aprob(malla.asignaturas)), total: sumaSCT(malla.asignaturas) },
    ramosClave,
    proyeccion: { sctPendientes, cargaSemestral, porCreditos, porPreviaturas, minimo: Math.max(porCreditos, porPreviaturas) },
  }
}
