/**
 * Período del año en que se dicta una asignatura:
 * - impar: primer semestre del año (marzo a julio)
 * - par: segundo semestre del año (agosto a diciembre)
 * - ambos: se dicta en los dos períodos
 */
export type Dictacion = 'impar' | 'par' | 'ambos'

export type AreaId = 'basicas' | 'software' | 'sistemas' | 'gestion' | 'electivos' | 'general'

export type Requisito =
  | { tipo: 'curso'; id: string }
  | { tipo: 'semestre'; n: number } // todos los ramos hasta el semestre n aprobados
  | { tipo: 'consejo' } // aprobación del Consejo de Carrera

export interface Asignatura {
  id: string
  nombre: string
  semestre: number
  area: AreaId
  dd: number // horas de docencia directa (o "aula" en semestres finales)
  ta: number // horas de trabajo autónomo
  sct: number
  requisitos: Requisito[]
  /** Fila visual dentro del semestre (orden del documento oficial) */
  fila: number
  /** Excepción al período de dictación. Si no se indica, sigue la paridad de su semestre. */
  dictacion?: Dictacion
}

export interface Malla {
  id: 'du416' | '2027'
  nombre: string
  nombreCorto: string
  cohortes: string
  semestres: number
  licenciaturaTras: number
  asignaturas: Asignatura[]
}

export interface Area {
  id: AreaId
  nombre: string
  color: string
  tinta: string // color del texto sobre el fondo del área
}
