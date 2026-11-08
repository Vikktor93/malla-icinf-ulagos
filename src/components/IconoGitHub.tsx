import { siGithub } from 'simple-icons'

/** Ícono oficial de GitHub, tomado del paquete simple-icons (Lucide ya no incluye íconos de marcas). */
export function IconoGitHub({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={`inline-block fill-current ${className}`}>
      <path d={siGithub.path} />
    </svg>
  )
}
