import { useCallback, useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'icinf:tema'

/** Tema inicial: el elegido por el estudiante o, si no eligió, el de su sistema operativo. */
function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch {
    /* sin almacenamiento */
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#0f2c35' : '#123540')
  }, [tema])

  const alternarTema = useCallback(() => {
    setTema((t) => {
      const nuevo = t === 'oscuro' ? 'claro' : 'oscuro'
      try {
        localStorage.setItem(CLAVE, nuevo)
      } catch {
        /* noop */
      }
      return nuevo
    })
  }, [])

  return { tema, alternarTema }
}
