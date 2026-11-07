/** Correo de contacto para reportes y sugerencias de quienes no tienen cuenta de GitHub. */
export const CORREO_CONTACTO = 'victor.saldivia@ulagos.cl'

/** Enlace mailto con asunto y cuerpo ya escritos. */
export function enlaceCorreo(asunto: string, cuerpo: string) {
  // encodeURIComponent (y no URLSearchParams) para que los espacios queden como %20 en todos los clientes de correo
  return `mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
}
