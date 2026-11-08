import type { jsPDF } from 'jspdf'
import type { Malla } from '../data/types'
import type { Estadisticas } from './estadisticas'
import { BRUMA, MAR, MAR_SUAVE, MAREA, NIEBLA } from './pdfColores'

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100))

/**
 * Dibuja la página "Mis estadísticas" del informe (A4 horizontal), con los mismos gráficos que la
 * vista de la plataforma. Todo se dibuja con trazos vectoriales: queda nítido al imprimir y el texto
 * se puede seleccionar. En papel no hay tooltips, así que cada barra lleva su valor escrito.
 */
export function dibujarEstadisticas(doc: jsPDF, malla: Malla, e: Estadisticas) {
  const W = 297
  const M = 12
  const gap = 6

  doc.setTextColor(MAR)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('Mis estadísticas', M, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MAR_SUAVE)
  doc.text(`${malla.nombre}, ${malla.cohortes.toLowerCase()}`, W - M, 17, { align: 'right' })

  const tarjeta = (x: number, y: number, w: number, h: number, titulo: string, bajada: string) => {
    doc.setFillColor('#FFFFFF')
    doc.setDrawColor(BRUMA)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, w, h, 3, 3, 'FD')
    doc.setTextColor(MAR)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text(titulo, x + 5, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(MAR_SUAVE)
    doc.text(bajada, x + 5, y + 12.5)
  }

  /* ---------------- Fila 1: hitos, proyección y ramos clave ---------------- */
  const y1 = 23
  const h1 = 70
  const w1 = (W - 2 * M - 2 * gap) / 3

  // Hitos
  let x = M
  tarjeta(x, y1, w1, h1, 'Hitos de la carrera', 'SCT aprobados de cada hito')
  anillo(doc, x + w1 * 0.27, y1 + 37, e.licenciatura.aprobados, e.licenciatura.total, 'Licenciatura', `Semestres 1 al ${malla.licenciaturaTras}`)
  anillo(doc, x + w1 * 0.73, y1 + 37, e.titulo.aprobados, e.titulo.total, 'Título profesional', 'Malla completa')

  // Proyección de egreso
  x += w1 + gap
  const p = e.proyeccion
  tarjeta(x, y1, w1, h1, 'Proyección de egreso', 'Semestres que faltan, como mínimo')
  doc.setTextColor(MAR)
  doc.setFont('helvetica', 'bold')
  if (p.sctPendientes === 0) {
    doc.setFontSize(18)
    doc.text('Malla completa', x + 5, y1 + 30)
  } else {
    doc.setFontSize(30)
    doc.text(String(p.minimo), x + 5, y1 + 28)
    const anchoNum = doc.getTextWidth(String(p.minimo))
    doc.setFontSize(13)
    doc.text(p.minimo === 1 ? 'semestre' : 'semestres', x + 7 + anchoNum, y1 + 28)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const lineas = [
      `${p.porCreditos} por créditos: faltan ${p.sctPendientes} SCT, con hasta ${p.cargaSemestral} SCT por semestre.`,
      `${p.porPreviaturas} por previaturas: la cadena de ramos pendientes más larga tiene ${p.porPreviaturas} ${p.porPreviaturas === 1 ? 'eslabón' : 'eslabones'}.`,
    ]
    let yy = y1 + 36
    for (const l of lineas) {
      const partes = doc.splitTextToSize(l, w1 - 10) as string[]
      doc.text(partes, x + 5, yy, { lineHeightFactor: 1.25 })
      yy += partes.length * 3.5 + 1.2
    }
    // Nota con ícono de información, sobre fondo suave
    doc.setFontSize(7)
    const nota = doc.splitTextToSize(
      'Estimación referencial: supone que se aprueban todos los ramos inscritos y no considera el período en que se dicta cada uno, así que el egreso real puede tomar más tiempo.',
      w1 - 19,
    ) as string[]
    const altoNota = nota.length * 2.9 + 3.6
    const yNota = y1 + h1 - 4 - altoNota
    doc.setFillColor(NIEBLA)
    doc.roundedRect(x + 4, yNota, w1 - 8, altoNota, 1.5, 1.5, 'F')
    doc.setDrawColor(MAREA)
    doc.setLineWidth(0.3)
    doc.circle(x + 8, yNota + 3.4, 1.6, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(MAREA)
    doc.text('i', x + 8, yNota + 4.4, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(MAR_SUAVE)
    doc.text(nota, x + 11.5, yNota + 4.3)
  }

  // Ramos clave pendientes
  x += w1 + gap
  tarjeta(x, y1, w1, h1, 'Ramos clave pendientes', 'Los que más ramos desbloquean más adelante')
  if (e.ramosClave.length === 0) {
    doc.setFontSize(8.5)
    doc.setTextColor(MAR_SUAVE)
    doc.text('No quedan ramos que sean previatura de otros.', x + 5, y1 + 22)
  } else {
    const max = Math.max(...e.ramosClave.map((r) => r.abre))
    e.ramosClave.forEach(({ a, abre }, i) => {
      const yy = y1 + 22 + i * 9.6
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(MAR)
      const nombre = doc.splitTextToSize(a.nombre, w1 - 34)[0] as string
      doc.text(nombre, x + 5, yy)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(MAR_SUAVE)
      doc.text(`abre ${abre} ${abre === 1 ? 'ramo' : 'ramos'}`, x + w1 - 5, yy, { align: 'right' })
      barra(doc, x + 5, yy + 1.8, w1 - 10, 1.8, abre / max, MAREA)
    })
  }

  /* ---------------- Fila 2: avance por semestre y por área ---------------- */
  const y2 = y1 + h1 + gap
  const h2 = 186 - y2
  const wSem = (W - 2 * M - gap) * (2 / 3)
  const wArea = W - 2 * M - gap - wSem

  // Avance por semestre (barras apiladas)
  x = M
  tarjeta(x, y2, wSem, h2, 'Avance por semestre', 'SCT aprobados y pendientes de cada semestre de la malla')
  leyenda(doc, x + wSem - 5, y2 + 8)
  const base = y2 + h2 - 9
  const altoMax = h2 - 30
  const maxSct = Math.max(...e.porSemestre.map((s) => s.sctTotal))
  const n = e.porSemestre.length
  const paso = (wSem - 10) / n
  const anchoBarra = paso * 0.58
  const escala = altoMax / maxSct

  // Línea de referencia de 30 SCT
  const yRef = base - 30 * escala
  doc.setDrawColor(MAR_SUAVE)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(x + 5, yRef, x + wSem - 5, yRef)
  doc.setLineDashPattern([], 0)

  e.porSemestre.forEach((s, i) => {
    const bx = x + 5 + i * paso + (paso - anchoBarra) / 2
    const hAprob = s.sctAprobados * escala
    const hPend = (s.sctTotal - s.sctAprobados) * escala
    const separacion = hAprob > 0 && hPend > 0 ? 0.6 : 0
    // Solo el extremo superior de la barra va redondeado; la base queda recta sobre el eje
    if (hPend > 0) {
      doc.setFillColor(BRUMA)
      segmento(doc, bx, base - hAprob - hPend, anchoBarra, hPend - separacion, true, true)
    }
    if (hAprob > 0) {
      doc.setFillColor(MAREA)
      segmento(doc, bx, base - hAprob, anchoBarra, hAprob, hPend === 0, true)
    }
    // Valor escrito sobre cada barra y número de semestre debajo
    // Fondo blanco detrás del valor, para que la línea de referencia no lo cruce
    const etiqueta = `${s.sctAprobados}/${s.sctTotal}`
    doc.setFontSize(6.5)
    const ancho = doc.getTextWidth(etiqueta) + 1.6
    const yEtiqueta = base - hAprob - hPend - 1.5
    doc.setFillColor('#FFFFFF')
    doc.rect(bx + anchoBarra / 2 - ancho / 2, yEtiqueta - 2.4, ancho, 3.2, 'F')
    doc.setTextColor(MAR)
    doc.text(etiqueta, bx + anchoBarra / 2, yEtiqueta, { align: 'center' })
    doc.setFontSize(7.5)
    doc.setTextColor(MAR_SUAVE)
    doc.text(String(s.semestre), bx + anchoBarra / 2, base + 4.5, { align: 'center' })
  })
  doc.setDrawColor(BRUMA)
  doc.setLineWidth(0.3)
  doc.line(x + 5, base, x + wSem - 5, base)

  // Avance por área de formación
  x = M + wSem + gap
  tarjeta(x, y2, wArea, h2, 'Avance por área de formación', 'SCT aprobados sobre el total de cada área')
  const pasoArea = (h2 - 24) / e.porArea.length
  e.porArea.forEach((a, i) => {
    const yy = y2 + 23 + i * pasoArea
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(MAR)
    doc.text(a.nombre, x + 5, yy)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(MAR_SUAVE)
    doc.text(`${a.sctAprobados} de ${a.sctTotal} SCT`, x + wArea - 5, yy, { align: 'right' })
    barra(doc, x + 5, yy + 2, wArea - 10, 2.2, a.sctTotal ? a.sctAprobados / a.sctTotal : 0, a.color)
  })
}

/** Rectángulo de una barra vertical, con el extremo superior redondeado si corresponde. */
function segmento(doc: jsPDF, x: number, y: number, w: number, h: number, redondeadoArriba: boolean, rectoAbajo: boolean) {
  if (h <= 0) return
  const r = Math.min(1, h / 2)
  if (!redondeadoArriba) {
    doc.rect(x, y, w, h, 'F')
    return
  }
  doc.roundedRect(x, y, w, h, r, r, 'F')
  if (rectoAbajo && h > r) doc.rect(x, y + h - r, w, r, 'F')
}

/** Barra horizontal con fondo gris y relleno proporcional, de extremos redondeados. */
function barra(doc: jsPDF, x: number, y: number, w: number, h: number, fraccion: number, color: string) {
  doc.setFillColor(BRUMA)
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F')
  if (fraccion > 0) {
    doc.setFillColor(color)
    doc.roundedRect(x, y, Math.max(w * fraccion, h), h, h / 2, h / 2, 'F')
  }
}

/** Indicador circular: anillo gris con un arco de avance que parte arriba y avanza en sentido horario. */
function anillo(doc: jsPDF, cx: number, cy: number, valor: number, total: number, nombre: string, detalle: string) {
  const r = 12.5
  const grosor = 3.4
  doc.setLineWidth(grosor)
  doc.setDrawColor(BRUMA)
  doc.circle(cx, cy, r, 'S')
  if (valor > 0) {
    doc.setDrawColor(MAREA)
    doc.setLineCap('round')
    const fin = (Math.min(valor / total, 1) * 2 * Math.PI)
    const pasos = Math.max(2, Math.ceil(fin / 0.08))
    let px = cx
    let py = cy - r
    for (let i = 1; i <= pasos; i++) {
      const ang = -Math.PI / 2 + (fin * i) / pasos
      const nx = cx + r * Math.cos(ang)
      const ny = cy + r * Math.sin(ang)
      doc.line(px, py, nx, ny)
      px = nx
      py = ny
    }
    doc.setLineCap('butt')
  }
  doc.setLineWidth(0.2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(MAR)
  doc.text(`${pct(valor, total)}%`, cx, cy + 1.6, { align: 'center' })
  doc.setFontSize(8.5)
  doc.text(nombre, cx, cy + r + 8, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(MAR_SUAVE)
  doc.text(`${valor} de ${total} SCT`, cx, cy + r + 12, { align: 'center' })
  doc.text(detalle, cx, cy + r + 15.5, { align: 'center' })
}

/** Leyenda de la barra apilada y de la línea de referencia, alineada a la derecha. */
function leyenda(doc: jsPDF, derecha: number, y: number) {
  doc.setFontSize(7.5)
  doc.setTextColor(MAR_SUAVE)
  let x = derecha
  // Línea de referencia (último elemento, a la derecha)
  const ref = 'Referencia 30 SCT'
  x -= doc.getTextWidth(ref)
  doc.text(ref, x, y)
  x -= 7
  doc.setDrawColor(MAR_SUAVE)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(x, y - 1.1, x + 5, y - 1.1)
  doc.setLineDashPattern([], 0)
  x -= 6
  const items: [string, string][] = [
    ['Aprobados', MAREA],
    ['Pendientes', BRUMA],
  ]
  for (const [texto, color] of [...items].reverse()) {
    x -= doc.getTextWidth(texto)
    doc.setTextColor(MAR_SUAVE)
    doc.text(texto, x, y)
    x -= 4.2
    doc.setFillColor(color)
    doc.roundedRect(x, y - 2.6, 3, 3, 0.6, 0.6, 'F')
    x -= 6
  }
}
