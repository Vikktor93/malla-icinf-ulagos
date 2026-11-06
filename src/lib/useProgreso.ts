import { useCallback, useEffect, useMemo, useState } from 'react'
import { MALLAS } from '../data/mallas'
import type { Malla } from '../data/types'
import { codificar, decodificar } from './malla'

type MallaId = Malla['id']

interface Guardado {
  aprobadas: string[]
  plan: string[]
}

const CLAVE_MALLA = 'icinf:malla'
const clave = (id: MallaId) => `icinf:avance:${id}`

function leer(id: MallaId): Guardado {
  try {
    const raw = localStorage.getItem(clave(id))
    if (raw) return JSON.parse(raw) as Guardado
  } catch {
    /* almacenamiento no disponible */
  }
  return { aprobadas: [], plan: [] }
}

function escribir(id: MallaId, g: Guardado) {
  try {
    localStorage.setItem(clave(id), JSON.stringify(g))
  } catch {
    /* sin almacenamiento: el avance vive solo en esta sesión */
  }
}

function leerMallaElegida(): MallaId | null {
  try {
    const v = localStorage.getItem(CLAVE_MALLA)
    return v === 'du416' || v === '2027' ? v : null
  } catch {
    return null
  }
}

/** Lee un avance compartido desde el enlace: #m=2027&a=xxxx */
function leerEnlace(): { malla: MallaId; aprobadas: Set<string> } | null {
  const p = new URLSearchParams(location.hash.slice(1))
  const m = p.get('m')
  const a = p.get('a')
  if ((m === 'du416' || m === '2027') && a !== null) {
    return { malla: m, aprobadas: decodificar(MALLAS[m], a) }
  }
  return null
}

export function useProgreso() {
  const [compartido, setCompartido] = useState(leerEnlace)
  const [mallaId, setMallaId] = useState<MallaId | null>(() => compartido?.malla ?? leerMallaElegida())
  const [datos, setDatos] = useState<Record<MallaId, Guardado>>(() => ({
    du416: leer('du416'),
    '2027': leer('2027'),
  }))

  const malla = mallaId ? MALLAS[mallaId] : null

  // Si el enlace compartido llega y la persona no tiene avance propio, se adopta directamente.
  useEffect(() => {
    if (compartido && datos[compartido.malla].aprobadas.length === 0) {
      const g = { aprobadas: [...compartido.aprobadas], plan: [] }
      setDatos((d) => ({ ...d, [compartido.malla]: g }))
      escribir(compartido.malla, g)
      setCompartido(null)
      history.replaceState(null, '', location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const viendoCompartido = compartido !== null && compartido.malla === mallaId

  const aprobadas = useMemo(
    () => (viendoCompartido ? compartido!.aprobadas : new Set(mallaId ? datos[mallaId].aprobadas : [])),
    [viendoCompartido, compartido, datos, mallaId],
  )
  const plan = useMemo(() => new Set(mallaId ? datos[mallaId].plan : []), [datos, mallaId])

  const actualizar = useCallback(
    (f: (g: Guardado) => Guardado) => {
      if (!mallaId) return
      setDatos((d) => {
        const g = f(d[mallaId])
        escribir(mallaId, g)
        return { ...d, [mallaId]: g }
      })
    },
    [mallaId],
  )

  const elegirMalla = useCallback((id: MallaId) => {
    setMallaId(id)
    try {
      localStorage.setItem(CLAVE_MALLA, id)
    } catch {
      /* noop */
    }
  }, [])

  const alternar = useCallback(
    (id: string) =>
      actualizar((g) => {
        const s = new Set(g.aprobadas)
        const quitar = s.has(id)
        if (quitar) s.delete(id)
        else s.add(id)
        return { aprobadas: [...s], plan: g.plan.filter((p) => p !== id) }
      }),
    [actualizar],
  )

  const fijarVarias = useCallback(
    (ids: string[], aprobar: boolean) =>
      actualizar((g) => {
        const s = new Set(g.aprobadas)
        ids.forEach((id) => (aprobar ? s.add(id) : s.delete(id)))
        return { aprobadas: [...s], plan: g.plan.filter((p) => !s.has(p)) }
      }),
    [actualizar],
  )

  const alternarPlan = useCallback(
    (id: string) =>
      actualizar((g) => ({
        ...g,
        plan: g.plan.includes(id) ? g.plan.filter((p) => p !== id) : [...g.plan, id],
      })),
    [actualizar],
  )

  const limpiarPlan = useCallback(() => actualizar((g) => ({ ...g, plan: [] })), [actualizar])
  const reiniciar = useCallback(() => actualizar(() => ({ aprobadas: [], plan: [] })), [actualizar])

  const enlace = useCallback(() => {
    if (!malla) return ''
    return `${location.origin}${location.pathname}#m=${malla.id}&a=${codificar(malla, aprobadas)}`
  }, [malla, aprobadas])

  const adoptarCompartido = useCallback(() => {
    if (!compartido) return
    const g = { aprobadas: [...compartido.aprobadas], plan: [] }
    setDatos((d) => ({ ...d, [compartido.malla]: g }))
    escribir(compartido.malla, g)
    setCompartido(null)
    history.replaceState(null, '', location.pathname)
  }, [compartido])

  const descartarCompartido = useCallback(() => {
    setCompartido(null)
    history.replaceState(null, '', location.pathname)
  }, [])

  return {
    malla,
    elegirMalla,
    aprobadas,
    plan,
    alternar,
    fijarVarias,
    alternarPlan,
    limpiarPlan,
    reiniciar,
    enlace,
    viendoCompartido,
    adoptarCompartido,
    descartarCompartido,
  }
}
