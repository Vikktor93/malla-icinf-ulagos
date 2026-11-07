import type { Area, AreaId, Asignatura, Dictacion, Malla, Requisito } from './types'

/**
 * Áreas de formación. Los colores siguen los de las mallas oficiales en PDF
 * (azul, naranjo, amarillo, verde, morado, gris) para que el estudiante los reconozca.
 */
export const AREAS: Record<AreaId, Area> = {
  basicas: { id: 'basicas', nombre: 'Ciencias básicas', color: '#3E6FB0', tinta: '#FFFFFF' },
  software: { id: 'software', nombre: 'Programación y software', color: '#E08A3C', tinta: '#2B1606' },
  sistemas: { id: 'sistemas', nombre: 'Sistemas e infraestructura', color: '#EBC24A', tinta: '#2E2203' },
  gestion: { id: 'gestion', nombre: 'Ingeniería y gestión', color: '#4E9258', tinta: '#FFFFFF' },
  electivos: { id: 'electivos', nombre: 'Electivos, prácticas y talleres', color: '#8A6FBF', tinta: '#FFFFFF' },
  general: { id: 'general', nombre: 'Formación general e inglés', color: '#8C9BA3', tinta: '#14232B' },
}

// Atajos para escribir los requisitos de forma compacta
const r = (...ids: string[]): Requisito[] => ids.map((id) => ({ tipo: 'curso', id }))
const SEM = (n: number): Requisito[] => [{ tipo: 'semestre', n }]
const CONSEJO: Requisito[] = [{ tipo: 'consejo' }]

type Fila = [id: string, nombre: string, area: AreaId, dd: number, ta: number, sct: number, req?: Requisito[]]

function semestres(def: Fila[][]): Asignatura[] {
  return def.flatMap((filas, i) =>
    filas.map(([id, nombre, area, dd, ta, sct, req = []], fila) => ({
      id, nombre, area, dd, ta, sct, requisitos: req, semestre: i + 1, fila,
    })),
  )
}

/**
 * Excepciones al período de dictación.
 * Por regla general, los ramos de semestres impares se dictan en el primer semestre del año y los de
 * semestres pares en el segundo. Las asignaturas listadas aquí se dictan en otro período. Cualquier
 * otra excepción la define la Dirección Docente (por ejemplo, por alta reprobación) y se agrega aquí.
 */
function conDictacion(asignaturas: Asignatura[], excepciones: Partial<Record<Dictacion, string[]>>): Asignatura[] {
  const porId = new Map<string, Dictacion>()
  for (const [dictacion, ids] of Object.entries(excepciones) as [Dictacion, string[]][]) {
    for (const id of ids) porId.set(id, dictacion)
  }
  for (const id of porId.keys()) {
    if (!asignaturas.some((a) => a.id === id)) throw new Error(`Excepción de dictación para un ramo inexistente: ${id}`)
  }
  return asignaturas.map((a) => (porId.has(a.id) ? { ...a, dictacion: porId.get(a.id) } : a))
}

/* ------------------------------------------------------------------ */
/* Malla DU 416 — 11 semestres, 330 SCT (cohortes 2024, 2025 y 2026)  */
/* ------------------------------------------------------------------ */
export const MALLA_DU416: Malla = {
  id: 'du416',
  nombre: 'Malla DU 416',
  nombreCorto: 'DU 416',
  cohortes: 'Cohortes 2024, 2025 y 2026',
  semestres: 11,
  licenciaturaTras: 8,
  asignaturas: conDictacion(semestres([
    // Semestre 1
    [
      ['intro-mat', 'Introducción a la Matemática', 'basicas', 6, 11, 11],
      ['quimica', 'Química', 'basicas', 3, 5, 5],
      ['taller-intro', 'Taller de Introducción a la Ingeniería Informática', 'sistemas', 3, 4, 4],
      ['programacion', 'Programación', 'software', 6, 5, 7],
      ['hab-comunicativas', 'Habilidades Comunicativas para Ingenieros', 'general', 3, 5, 5],
    ],
    // Semestre 2
    [
      ['intro-calculo', 'Introducción al Cálculo', 'basicas', 5, 5, 6, r('intro-mat')],
      ['algebra', 'Álgebra', 'basicas', 5, 5, 6],
      ['intro-fisica', 'Introducción a la Física', 'basicas', 5, 6, 7],
      ['poo', 'Programación Orientada a Objetos', 'software', 4, 4, 5, r('programacion')],
      ['ciudadania-1', 'Ciudadanía I', 'general', 2, 1, 2],
      ['afi-1', 'Electivo AFI I', 'general', 2, 1, 2],
    ],
    // Semestre 3
    [
      ['calculo-dif-int', 'Cálculo Diferencial e Integral', 'basicas', 5, 5, 6, r('intro-calculo')],
      ['algebra-sup', 'Álgebra Superior', 'basicas', 5, 5, 6, r('algebra')],
      ['fisica-newton', 'Física Newtoniana', 'basicas', 5, 6, 7, r('intro-fisica', 'intro-calculo')],
      ['estructuras-datos', 'Estructuras de Datos', 'software', 4, 4, 5, r('programacion')],
      ['taller-prog-aplicada', 'Taller de Programación Aplicada', 'software', 2, 5, 4, r('poo')],
      ['ingles-1', 'Inglés I', 'general', 2, 3, 3],
    ],
    // Semestre 4
    [
      ['calculo-multi', 'Cálculo Multivariable', 'basicas', 5, 5, 6, r('calculo-dif-int')],
      ['estructuras-discretas', 'Estructuras Discretas', 'basicas', 3, 5, 5, r('algebra')],
      ['electromagnetismo', 'Electromagnetismo', 'basicas', 3, 5, 5, r('fisica-newton', 'calculo-dif-int')],
      ['mod-paradigmas', 'Modelamiento y Paradigmas de Programación', 'software', 3, 4, 4],
      ['automatas', 'Autómatas y Lenguajes Formales', 'software', 3, 4, 4],
      ['ingles-2', 'Inglés II', 'general', 2, 3, 3, r('ingles-1')],
      ['afi-2', 'Electivo AFI II', 'general', 2, 1, 2],
    ],
    // Semestre 5
    [
      ['ecuaciones-dif', 'Ecuaciones Diferenciales', 'basicas', 4, 6, 6, r('calculo-multi')],
      ['estadistica', 'Estadística y Probabilidad', 'basicas', 3, 5, 5],
      ['fisica-moderna', 'Física Moderna y Ondas', 'basicas', 3, 4, 4],
      ['algoritmos', 'Análisis y Diseño de Algoritmos', 'software', 3, 5, 5],
      ['bases-datos', 'Bases de Datos', 'software', 5, 5, 6, r('mod-paradigmas')],
      ['ingles-3', 'Inglés III', 'general', 2, 3, 3, r('ingles-2')],
    ],
    // Semestre 6
    [
      ['calculo-numerico', 'Cálculo Numérico', 'basicas', 4, 6, 6, r('calculo-multi')],
      ['ing-sistemas', 'Ingeniería de Sistemas', 'gestion', 3, 5, 5],
      ['bd-avanzadas', 'Bases de Datos Avanzadas', 'software', 3, 5, 5, r('bases-datos')],
      ['web-moviles', 'Tecnologías Web y Móviles', 'software', 4, 4, 5],
      ['diseno-digital', 'Taller de Diseño Digital', 'sistemas', 3, 5, 5, r('electromagnetismo')],
      ['ingles-4', 'Inglés IV', 'general', 2, 3, 3, r('ingles-3')],
      ['afi-3', 'Electivo AFI III', 'general', 2, 1, 2],
    ],
    // Semestre 7
    [
      ['economia', 'Economía', 'gestion', 3, 5, 5],
      ['gestion-empresas', 'Gestión de Empresas', 'gestion', 3, 5, 5],
      ['sist-informacion', 'Sistemas de Información', 'gestion', 3, 4, 4, r('ing-sistemas')],
      ['taller-ing-informatica', 'Taller de Ingeniería Informática', 'gestion', 2, 6, 5, r('web-moviles')],
      ['arq-computadores', 'Arquitectura de Computadores', 'sistemas', 3, 4, 4],
      ['ingles-inf-1', 'Inglés para Informáticos I', 'gestion', 2, 3, 3, r('ingles-4')],
      ['practica-intermedia', 'Práctica Intermedia', 'electivos', 0, 8, 5, r('bases-datos')],
    ],
    // Semestre 8
    [
      ['contabilidad', 'Contabilidad y Costos', 'gestion', 3, 4, 4],
      ['ing-software', 'Ingeniería de Software', 'gestion', 3, 5, 5, r('mod-paradigmas')],
      ['inv-operativa', 'Investigación Operativa', 'gestion', 3, 5, 5, r('algebra-sup')],
      ['formulacion-proyectos', 'Formulación y Evaluación de Proyectos', 'gestion', 3, 5, 5],
      ['sist-operativos', 'Sistemas Operativos', 'sistemas', 4, 4, 5, r('arq-computadores')],
      ['ingles-inf-2', 'Inglés para Informáticos II', 'gestion', 2, 3, 3, r('ingles-inf-1')],
      ['afi-4', 'Electivo AFI IV', 'general', 2, 1, 2],
    ],
    // Semestre 9
    [
      ['ia', 'Inteligencia Artificial', 'software', 4, 4, 5, r('automatas')],
      ['taller-ing-software', 'Taller de Ingeniería de Software', 'gestion', 2, 6, 5, r('ing-software')],
      ['electivo-prof-1', 'Electivo Profesional I', 'electivos', 3, 5, 5],
      ['electivo-prof-2', 'Electivo Profesional II', 'electivos', 3, 5, 5],
      ['redes', 'Redes y Comunicaciones', 'sistemas', 4, 4, 5],
      ['innovacion', 'Innovación y Emprendimiento en Informática', 'gestion', 2, 6, 5],
    ],
    // Semestre 10
    [
      ['taller-integracion', 'Taller de Integración Tecnológica', 'gestion', 2, 6, 5, r('taller-ing-software')],
      ['anteproyecto', 'Anteproyecto de Título', 'gestion', 2, 6, 5, SEM(9)],
      ['electivo-prof-3', 'Electivo Profesional III', 'electivos', 3, 5, 5],
      ['electivo-prof-4', 'Electivo Profesional IV', 'electivos', 3, 5, 5],
      ['sist-distribuidos', 'Sistemas Distribuidos', 'sistemas', 4, 4, 5, r('redes')],
      ['seguridad', 'Seguridad Informática', 'software', 4, 4, 5, r('taller-ing-informatica')],
    ],
    // Semestre 11
    [
      ['proyecto-titulo', 'Proyecto de Título', 'gestion', 4, 25, 18, r('anteproyecto')],
      ['practica-profesional', 'Práctica Profesional', 'electivos', 0, 19, 12, SEM(8)],
    ],
  ]), {
    // Inglés, electivos AFI, prácticas, anteproyecto y proyecto de título se dictan en ambos períodos
    ambos: [
      'ingles-1', 'ingles-2', 'ingles-3', 'ingles-4', 'ingles-inf-1', 'ingles-inf-2',
      'afi-1', 'afi-2', 'afi-3', 'afi-4',
      'practica-intermedia', 'practica-profesional',
      'anteproyecto', 'proyecto-titulo',
    ],
  }),
}

/* ------------------------------------------------------------------ */
/* Malla 2027 — 10 semestres, 300 SCT (cohorte 2027 en adelante)      */
/* ------------------------------------------------------------------ */
export const MALLA_2027: Malla = {
  id: '2027',
  nombre: 'Malla 2027',
  nombreCorto: '2027',
  cohortes: 'Cohorte 2027 en adelante',
  semestres: 10,
  licenciaturaTras: 8,
  asignaturas: conDictacion(semestres([
    // Semestre 1
    [
      ['calculo-1', 'Cálculo I', 'basicas', 6, 4, 6],
      ['algebra-1', 'Álgebra I', 'basicas', 6, 4, 6],
      ['taller-intro', 'Taller de Introducción a la Ingeniería', 'sistemas', 4, 8, 8],
      ['programacion', 'Programación', 'software', 6, 5, 7],
      ['comunicacion', 'Comunicación', 'general', 2, 3, 3],
    ],
    // Semestre 2
    [
      ['calculo-2', 'Cálculo II', 'basicas', 6, 4, 6, r('calculo-1')],
      ['algebra-2', 'Álgebra II', 'basicas', 6, 4, 6, r('algebra-1')],
      ['fisica-general', 'Física General', 'basicas', 6, 4, 6],
      ['prog-avanzada', 'Programación Avanzada', 'software', 4, 5, 6, r('programacion')],
      ['quimica', 'Química', 'basicas', 2, 4, 4],
      ['ciudadania', 'Ciudadanía', 'general', 2, 1, 2],
    ],
    // Semestre 3
    [
      ['calculo-multi', 'Cálculo Multivariable', 'basicas', 5, 5, 6, r('calculo-2')],
      ['estructuras-discretas', 'Estructuras Discretas', 'basicas', 3, 5, 5, r('algebra-1')],
      ['electromagnetismo', 'Electromagnetismo', 'basicas', 4, 5, 6, r('calculo-2')],
      ['estructuras-datos', 'Estructuras de Datos', 'software', 4, 5, 6, r('prog-avanzada')],
      ['economia', 'Economía', 'gestion', 4, 3, 4],
      ['ingles-1', 'Inglés I', 'general', 2, 3, 3],
    ],
    // Semestre 4
    [
      ['ecuaciones-dif', 'Ecuaciones Diferenciales', 'basicas', 5, 5, 6, r('calculo-multi')],
      ['estadistica', 'Estadística y Probabilidad', 'basicas', 4, 4, 5, r('calculo-2')],
      ['opticas-ondas', 'Ópticas y Ondas', 'basicas', 4, 6, 6, r('electromagnetismo')],
      ['bases-datos', 'Bases de Datos', 'software', 6, 6, 8],
      ['electivo-area-1', 'Electivo de Área de Conocimiento I', 'electivos', 2, 1, 2],
      ['ingles-2', 'Inglés II', 'general', 2, 3, 3, r('ingles-1')],
    ],
    // Semestre 5
    [
      ['calculo-numerico', 'Cálculo Numérico', 'basicas', 4, 4, 5, r('ecuaciones-dif')],
      ['sist-digitales', 'Sistemas Digitales', 'sistemas', 4, 4, 5, r('electromagnetismo')],
      ['frontend', 'Tecnologías Frontend', 'software', 4, 5, 6, r('bases-datos')],
      ['big-data', 'Big Data', 'software', 4, 6, 6, r('bases-datos')],
      ['automatas', 'Teoría de Autómatas', 'software', 4, 4, 5, r('estructuras-discretas')],
      ['ingles-3', 'Inglés III', 'general', 2, 3, 3, r('ingles-2')],
    ],
    // Semestre 6
    [
      ['algoritmos', 'Análisis y Diseño de Algoritmos', 'software', 3, 4, 4],
      ['electivo-fi', 'Electivo Formación Integral', 'general', 2, 1, 2],
      ['backend', 'Tecnologías Backend (ULAB 1)', 'software', 4, 5, 6, r('frontend')],
      ['arq-computadores', 'Arquitectura de Computadores', 'software', 4, 4, 5],
      ['ia', 'Inteligencia Artificial', 'software', 5, 3, 5, r('automatas')],
      ['ingles-ingenieria', 'Inglés para Ingeniería', 'general', 2, 3, 3, r('ingles-3')],
      ['practica-intermedia', 'Práctica Intermedia', 'electivos', 0, 8, 5, r('bases-datos')],
    ],
    // Semestre 7
    [
      ['inv-operativa', 'Investigación Operativa', 'gestion', 4, 4, 5, r('algebra-2')],
      ['ing-software', 'Ingeniería de Software', 'gestion', 4, 6, 6, r('bases-datos')],
      ['sist-operativos', 'Sistemas Operativos', 'sistemas', 4, 4, 5],
      ['redes', 'Redes y Comunicación', 'sistemas', 6, 3, 6, r('arq-computadores')],
      ['deep-learning', 'Deep Learning', 'sistemas', 4, 4, 5, r('ia')],
      ['ingles-tecnico', 'Inglés Técnico para Informática', 'general', 2, 3, 3, r('ingles-ingenieria')],
    ],
    // Semestre 8
    [
      ['nube', 'Tecnologías en la Nube', 'sistemas', 4, 7, 7, r('redes')],
      ['taller-ing-software', 'Taller de Ingeniería de Software (ULAB 2)', 'gestion', 2, 4, 4, r('ing-software')],
      ['sist-informacion', 'Sistemas de Información', 'gestion', 4, 6, 6],
      ['seguridad', 'Seguridad Informática', 'sistemas', 4, 7, 7, r('redes')],
      ['electivo-area-2', 'Electivo de Área de Conocimiento II', 'gestion', 2, 1, 2],
      ['formulacion-proyectos', 'Formulación y Evaluación de Proyectos', 'gestion', 4, 3, 4],
    ],
    // Semestre 9
    [
      ['practica-profesional', 'Práctica Profesional', 'electivos', 0, 20, 13, CONSEJO],
      ['taller-proyectos', 'Taller de Proyectos Informáticos (ULAB 3)', 'electivos', 2, 4, 4, r('backend')],
      ['electivo-prof-1', 'Electivo Profesional I', 'electivos', 4, 3, 4, CONSEJO],
      ['electivo-prof-2', 'Electivo Profesional II', 'electivos', 4, 3, 4, CONSEJO],
      ['anteproyecto', 'Anteproyecto de Título', 'gestion', 3, 5, 5, SEM(8)],
    ],
    // Semestre 10
    [
      ['electivo-prof-3', 'Electivo Profesional III', 'electivos', 4, 3, 4, CONSEJO],
      ['electivo-prof-4', 'Electivo Profesional IV', 'electivos', 4, 3, 4, CONSEJO],
      ['proyecto-titulo', 'Proyecto de Título', 'gestion', 3, 31, 22, r('anteproyecto')],
    ],
  ]), {
    // Inglés, electivo de formación integral, prácticas, anteproyecto y proyecto de título
    ambos: [
      'ingles-1', 'ingles-2', 'ingles-3', 'ingles-ingenieria', 'ingles-tecnico',
      'electivo-fi',
      'practica-intermedia', 'practica-profesional',
      'anteproyecto', 'proyecto-titulo',
    ],
  }),
}

export const MALLAS = { du416: MALLA_DU416, '2027': MALLA_2027 } as const
