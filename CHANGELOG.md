# Registro de cambios

Todos los cambios relevantes de la plataforma se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa
[versionamiento semántico](https://semver.org/lang/es/).

## [1.4.1] - 2026-11-06

### Corregido

- La regla del período de dictación se aplicaba a todos los ramos. Ahora los ramos del semestre del
  estudiante se ofrecen siempre, y la regla se aplica solo a los ramos atrasados: un ramo pendiente
  de un semestre impar solo se ofrece cuando el estudiante cursa un semestre impar, y lo mismo con
  los pares.

### Cambiado

- El período ya no se elige ni se sugiere por fecha: se deduce del semestre que cursa el
  estudiante. Se quita el selector de período del panel de inscripción.
- Nuevo estado "Pendiente para otro período" en la malla, el detalle, la Guía y el PDF.

## [1.4.0] - 2026-11-06

Avanza en la fase 4: ajustes según la operación de la carrera.

### Agregado

- Período de dictación de cada asignatura: impares en el primer semestre del año, pares en el
  segundo, y excepciones para inglés, electivos de formación integral, prácticas, anteproyecto y
  proyecto de título, que se dictan en ambos.
- Selector de período en el panel de inscripción, sugerido según la fecha (inscripciones en marzo y
  agosto). Los ramos que se dictan en el otro período se muestran aparte.
- Período de dictación en el detalle de cada asignatura y en el PDF.
- Equivalencias SCT oficiales de la Universidad de Los Lagos en la Guía, con fórmulas y una
  calculadora de horas por asignatura.

## [1.3.0] - 2026-11-06

### Agregado

- Medición anónima de visitas con Vercel Web Analytics, sin cookies.
- Sección de privacidad en el README.

## [1.2.0] - 2026-11-06

### Agregado

- Sección "Sugerir mejoras" al final de la página, que abre una discusión en la categoría Ideas de
  GitHub Discussions.

## [1.1.0] - 2026-11-06

### Agregado

- Modo oscuro, con botón en la barra superior. Por defecto sigue el tema del sistema operativo y
  recuerda la elección del estudiante.

### Cambiado

- La animación del botón Guía queda permanente.
- El logo pasa de PNG a WebP (de 68 KB a 18 KB).

## [1.0.0] - 2026-11-06

Primera versión publicada en https://malla-icinf-ulagos.vercel.app/.

### Agregado

- Malla interactiva para la Malla DU 416 (cohortes 2024 a 2026) y la Malla 2027, con SCT, horas
  de docencia directa y trabajo autónomo, áreas y previaturas.
- Estados de cada ramo, conexiones visuales entre previaturas y panel de detalle por asignatura.
- Avance guardado en el navegador y enlace para compartirlo.
- Panel de inscripción acotado al semestre del estudiante, con ramos atrasados, contador de SCT y
  aviso informativo al superar el tope.
- Informe de avance en PDF, con nombre del estudiante opcional.
- Guía de uso integrada y opción para reportar problemas en GitHub.
- Indicadores de avance hacia la Licenciatura y el Título profesional.

[1.4.1]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.4.1
[1.4.0]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.4.0
[1.3.0]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.3.0
[1.2.0]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.2.0
[1.1.0]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.1.0
[1.0.0]: https://github.com/Vikktor93/malla-icinf-ulagos/releases/tag/v1.0.0
