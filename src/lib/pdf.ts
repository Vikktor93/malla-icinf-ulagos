import logo from '../assets/logo-icinf.png'
import { AREAS } from '../data/mallas'
import type { Asignatura, Malla } from '../data/types'
import { topeSCT, type Estado } from './malla'

interface Datos {
  malla: Malla
  aprobadas: Set<string>
  estados: Map<string, Estado>
  referencia: number
  plan: Set<string>
  /** Nombre del estudiante (opcional) para el encabezado */
  nombre?: string
}

const MAR = '#123540'
const MAR_SUAVE = '#4B6670'
const MAREA = '#0E8A80'
const BRUMA = '#D3DEE2'
const AMBAR = '#B7791F'
const SITIO = 'malla-icinf-ulagos.vercel.app'
const URL_SITIO = 'https://malla-icinf-ulagos.vercel.app/'

const ETIQUETA: Record<Estado, string> = {
  aprobada: 'Aprobada',
  disponible: 'Puede inscribirla',
  condicional: 'Requiere Consejo de Carrera',
  adelantable: 'Semestre posterior',
  bloqueada: 'Previaturas pendientes',
}

async function imagenComoDataURL(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob()
    return await new Promise((ok, error) => {
      const r = new FileReader()
      r.onload = () => ok(r.result as string)
      r.onerror = error
      r.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const sumaSCT = (xs: Asignatura[]) => xs.reduce((t, a) => t + a.sct, 0)

/** Genera y descarga el informe de avance en PDF. Las librerías se cargan solo al usarlo. */
export async function descargarPDF({ malla, aprobadas, estados, referencia, plan, nombre = '' }: Datos) {
  const [{ jsPDF }, { default: autoTable }, logoData] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    imagenComoDataURL(logo),
  ])

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const hoy = new Date()
  const fecha = hoy.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

  const total = sumaSCT(malla.asignaturas)
  const aprob = malla.asignaturas.filter((a) => aprobadas.has(a.id))
  const sctAprob = sumaSCT(aprob)
  const lic = malla.asignaturas.filter((a) => a.semestre <= malla.licenciaturaTras)
  const licPct = Math.round((sumaSCT(lic.filter((a) => aprobadas.has(a.id))) / sumaSCT(lic)) * 100)
  const completa = aprob.length === malla.asignaturas.length

  /* ---------------- Página 1: resumen y malla ---------------- */
  const W = 297
  const M = 12

  doc.setFillColor(MAR)
  doc.rect(0, 0, W, 30, 'F')
  if (logoData) doc.addImage(logoData, 'PNG', M, 5, 20, 20)
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  // Con nombre, el título sube para dejar espacio a una tercera línea
  const yTitulo = nombre ? 11.5 : 14
  doc.text('Informe de Avance Académico', M + 25, yTitulo)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text('Ingeniería Civil en Informática, Universidad de Los Lagos', M + 25, yTitulo + 6.5)
  if (nombre) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Estudiante: ${nombre}`, M + 25, yTitulo + 12.5)
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(malla.nombre, W - M, 13, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(malla.cohortes, W - M, 18.5, { align: 'right' })
  doc.text(`Generado el ${fecha}`, W - M, 23.5, { align: 'right' })

  const cifras: [string, string][] = [
    [`${sctAprob} de ${total} SCT`, `${Math.round((sctAprob / total) * 100)}% de la carrera`],
    [`${aprob.length} de ${malla.asignaturas.length}`, 'ramos aprobados'],
    [`${licPct}%`, 'hacia la Licenciatura'],
    [completa ? 'Malla completa' : `Semestre ${referencia}`, completa ? 'todos los ramos aprobados' : 'le corresponde cursar'],
  ]
  cifras.forEach(([valor, texto], i) => {
    const x = M + i * 62
    doc.setTextColor(MAR)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(valor, x, 41)
    doc.setTextColor(MAR_SUAVE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(texto, x, 46)
  })

  // Malla en miniatura
  const top = 55
  const gap = 2
  const colW = (W - 2 * M - gap * (malla.semestres - 1)) / malla.semestres
  const maxFilas = Math.max(...Array.from({ length: malla.semestres }, (_, i) => malla.asignaturas.filter((a) => a.semestre === i + 1).length))
  const cardH = Math.min(18, (186 - top - 7) / maxFilas - 1.4)

  for (let s = 1; s <= malla.semestres; s++) {
    const x = M + (s - 1) * (colW + gap)
    const ramos = malla.asignaturas.filter((a) => a.semestre === s)
    doc.setTextColor(MAR)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.text(`Semestre ${s}`, x, top)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(MAR_SUAVE)
    doc.text(`${sumaSCT(ramos.filter((a) => aprobadas.has(a.id)))} de ${sumaSCT(ramos)} SCT`, x, top + 3.4)
    if (s === referencia && !completa) {
      doc.setFillColor(MAREA)
      doc.rect(x, top + 4.8, colW, 0.8, 'F')
    }

    ramos.forEach((a, i) => {
      const y = top + 7 + i * (cardH + 1.4)
      const e = estados.get(a.id)!
      const area = AREAS[a.area]
      if (e === 'aprobada') {
        doc.setFillColor(area.color)
        doc.roundedRect(x, y, colW, cardH, 1.2, 1.2, 'F')
        doc.setTextColor(area.tinta)
      } else {
        const inscribible = e === 'disponible' || e === 'condicional'
        doc.setFillColor('#FFFFFF')
        doc.setDrawColor(inscribible ? (e === 'condicional' ? AMBAR : MAREA) : BRUMA)
        doc.setLineWidth(inscribible ? 0.6 : 0.25)
        doc.roundedRect(x, y, colW, cardH, 1.2, 1.2, 'FD')
        doc.setFillColor(area.color)
        doc.rect(x + 0.6, y + 1.5, 0.8, cardH - 3, 'F')
        doc.setTextColor(e === 'bloqueada' || e === 'adelantable' ? MAR_SUAVE : MAR)
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.6)
      const lineas = doc.splitTextToSize(a.nombre, colW - 3.6).slice(0, 3) as string[]
      doc.text(lineas, x + 2.2, y + 2.9)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.4)
      doc.text(`${a.sct} SCT`, x + 2.2, y + cardH - 1.3)
    })
  }

  // Simbología
  const ly = 192
  const simbolos: [string, (x: number) => void][] = [
    ['Aprobada (color de su área)', (x) => {
      doc.setFillColor(AREAS.basicas.color)
      doc.roundedRect(x, ly - 2.6, 3.2, 3.2, 0.6, 0.6, 'F')
    }],
    ['Puede inscribirla', (x) => {
      doc.setFillColor('#FFFFFF'); doc.setDrawColor(MAREA); doc.setLineWidth(0.6)
      doc.roundedRect(x, ly - 2.6, 3.2, 3.2, 0.6, 0.6, 'FD')
    }],
    ['Requiere Consejo de Carrera', (x) => {
      doc.setFillColor('#FFFFFF'); doc.setDrawColor(AMBAR); doc.setLineWidth(0.6)
      doc.roundedRect(x, ly - 2.6, 3.2, 3.2, 0.6, 0.6, 'FD')
    }],
    ['Pendiente', (x) => {
      doc.setFillColor('#FFFFFF'); doc.setDrawColor(BRUMA); doc.setLineWidth(0.3)
      doc.roundedRect(x, ly - 2.6, 3.2, 3.2, 0.6, 0.6, 'FD')
    }],
  ]
  let lx = M
  doc.setFontSize(7.5)
  for (const [texto, dibujar] of simbolos) {
    dibujar(lx)
    doc.setTextColor(MAR_SUAVE)
    doc.text(texto, lx + 4.5, ly)
    lx += 4.5 + doc.getTextWidth(texto) + 8
  }
  doc.setFillColor(MAREA)
  doc.rect(lx, ly - 1.3, 6, 0.8, 'F')
  doc.text('Semestre que le corresponde cursar', lx + 8, ly)

  /* ---------------- Página 2: inscripción y detalle ---------------- */
  doc.addPage('a4', 'portrait')
  const WP = 210
  let y = 18

  const titulo = (texto: string) => {
    doc.setTextColor(MAR)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(texto, M, y)
    y += 3
  }
  const estiloTabla = {
    theme: 'plain' as const,
    margin: { left: M, right: M, bottom: 16 },
    styles: { font: 'helvetica', fontSize: 8.5, textColor: MAR, cellPadding: 1.3, lineColor: BRUMA, lineWidth: { bottom: 0.2 } },
    headStyles: { fontStyle: 'bold' as const, textColor: MAR_SUAVE, fontSize: 8 },
  }
  const finTabla = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  const inscribible = (a: Asignatura) => {
    const e = estados.get(a.id)
    return e === 'disponible' || e === 'condicional'
  }

  if (!completa) {
    titulo(`Semestre ${referencia}: ramos que puede inscribir`)
    const atrasados = malla.asignaturas.filter((a) => a.semestre < referencia && inscribible(a))
    const proximo = malla.asignaturas.filter((a) => a.semestre === referencia && inscribible(a))
    const filas = [...atrasados, ...proximo].map((a) => [
      a.nombre + (estados.get(a.id) === 'condicional' ? ' (requiere Consejo de Carrera)' : ''),
      a.semestre < referencia ? `Atrasado (sem. ${a.semestre})` : `Semestre ${a.semestre}`,
      String(a.sct),
      plan.has(a.id) ? 'Sí' : '',
    ])
    if (filas.length) {
      autoTable(doc, {
        ...estiloTabla,
        startY: y,
        head: [['Asignatura', 'Semestre', 'SCT', 'En su plan']],
        body: filas,
        columnStyles: { 1: { cellWidth: 38 }, 2: { cellWidth: 14, halign: 'right' }, 3: { cellWidth: 20, halign: 'center' } },
      })
      y = finTabla() + 6
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(MAR_SUAVE)
      doc.text('No tiene ramos disponibles para inscribir en este semestre.', M, y + 4)
      y += 10
    }

    const enPlan = malla.asignaturas.filter((a) => plan.has(a.id) && inscribible(a))
    const tope = topeSCT(malla, referencia)
    const sctPlan = sumaSCT(enPlan)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(sctPlan > tope ? AMBAR : MAR)
    const resumenPlan = enPlan.length
      ? `Plan de inscripción: ${sctPlan} de ${tope} SCT en ${enPlan.length} ${enPlan.length === 1 ? 'ramo' : 'ramos'}.` +
        (sctPlan > tope ? ' Supera el tope semestral recomendado.' : '')
      : 'No ha armado un plan de inscripción.'
    doc.text(resumenPlan, M, y)
    y += 12
  }

  titulo('Detalle por semestre')
  const cuerpo: (string | { content: string; colSpan: number; styles: object })[][] = []
  for (let s = 1; s <= malla.semestres; s++) {
    const ramos = malla.asignaturas.filter((a) => a.semestre === s)
    cuerpo.push([
      {
        content: `Semestre ${s}   ${sumaSCT(ramos.filter((a) => aprobadas.has(a.id)))} de ${sumaSCT(ramos)} SCT aprobados`,
        colSpan: 6,
        styles: { fontStyle: 'bold', fillColor: '#E6EDEF', textColor: MAR },
      },
    ])
    for (const a of ramos) {
      cuerpo.push([a.nombre, AREAS[a.area].nombre, String(a.sct), String(a.dd), String(a.ta), ETIQUETA[estados.get(a.id)!]])
    }
  }
  autoTable(doc, {
    ...estiloTabla,
    startY: y,
    head: [['Asignatura', 'Área', 'SCT', 'DD', 'TA', 'Estado']],
    body: cuerpo,
    styles: { ...estiloTabla.styles, fontSize: 7.6, cellPadding: 1.05 },
    columnStyles: {
      1: { cellWidth: 40, textColor: MAR_SUAVE },
      2: { cellWidth: 10, halign: 'right' },
      3: { cellWidth: 9, halign: 'right' },
      4: { cellWidth: 9, halign: 'right' },
      5: { cellWidth: 36 },
    },
    didParseCell: (d) => {
      if (d.section === 'body' && d.column.index === 5 && d.cell.raw === 'Aprobada') {
        d.cell.styles.textColor = MAREA
        d.cell.styles.fontStyle = 'bold'
      }
    },
  })

  /* ---------------- Pie de página en todas las páginas ---------------- */
  const paginas = doc.getNumberOfPages()
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    const ancho = p === 1 ? W : WP
    const alto = p === 1 ? 210 : 297
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(MAR_SUAVE)
    // Línea 1: "Documento referencial generado en <enlace>."
    const y1 = alto - 10
    let x = M
    const previo = 'Documento referencial generado en '
    doc.text(previo, x, y1)
    x += doc.getTextWidth(previo)
    doc.setTextColor(MAREA)
    doc.textWithLink(SITIO, x, y1, { url: URL_SITIO })
    doc.setDrawColor(MAREA)
    doc.setLineWidth(0.15)
    doc.line(x, y1 + 0.5, x + doc.getTextWidth(SITIO), y1 + 0.5)
    x += doc.getTextWidth(SITIO)
    doc.setTextColor(MAR_SUAVE)
    doc.text('.', x, y1)
    // Línea 2: advertencia
    doc.text(
      'Este documento no es oficial y no reemplaza el registro académico oficial de la Universidad de Los Lagos. Es de uso interno.',
      M,
      alto - 6.5,
    )
    doc.text(`Página ${p} de ${paginas}`, ancho - M, alto - 6.5, { align: 'right' })
  }

  const iso = hoy.toISOString().slice(0, 10)
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  doc.save(`avance-icinf-${malla.id}${slug ? `-${slug}` : ''}-${iso}.pdf`)
}
