# Malla interactiva ICINF - Universidad de Los Lagos

Plataforma web para que estudiantes de Ingeniería Civil en Informática revisen su malla
(DU 416 para cohortes 2024-2026, o Malla 2027 en adelante), marquen sus ramos aprobados y vean
qué pueden inscribir.

**Plataforma en línea:** https://malla-icinf-ulagos.vercel.app/

## Funcionalidades

- Elección de malla (DU 416: 11 semestres, 330 SCT, 65 asignaturas / 2027: 10 semestres, 300 SCT, 56 asignaturas).
- Cada ramo muestra SCT, horas de docencia directa (DD) y trabajo autónomo (TA), área y estado:
  aprobada, puedes inscribirla, requiere Consejo de Carrera o con previaturas pendientes.
- Al pasar el cursor o enfocar un ramo se dibujan sus conexiones: toda la cadena de previaturas
  y todo lo que abre.
- Panel de detalle con previaturas (cumplidas o pendientes) y ramos que desbloquea.
- Inscripción acotada al semestre que le corresponde al estudiante (el más alto con algún ramo
  aprobado, más uno). El panel separa los ramos pendientes de semestres anteriores de los del
  semestre siguiente, ordenados por cuántos ramos abren.
- Plan de inscripción con contador de SCT y horas semanales. Si el plan supera el tope (30 SCT o
  los SCT oficiales del semestre, lo que sea mayor) aparece un aviso informativo, que no bloquea.
- Marcar un semestre completo de una vez, búsqueda y filtro de lo inscribible.
- Avance guardado automáticamente en el navegador (sin cuenta ni archivos) y botón para
  compartirlo por enlace.
- Descarga del avance en PDF, con el nombre del estudiante como dato opcional: resumen con la malla
  en miniatura, ramos que puede inscribir, plan de inscripción y estado de cada asignatura por
  semestre.
- Indicadores de avance: créditos y ramos aprobados, porcentaje hacia la Licenciatura (semestres
  1 al 8) y hacia el Título profesional (toda la malla).
- Guía integrada con el significado de cada estado y área, cómo marcar el avance, qué son los
  créditos SCT y cómo planificar la carga académica. El botón se anima hasta que el estudiante la
  abre por primera vez.
- Botón "Reportar problema" que abre un issue en este repositorio con la malla ya indicada.

## Stack tecnológico

| Tecnología | Uso en la plataforma |
|---|---|
| [React 19](https://react.dev/) | Interfaz y estado de la aplicación |
| [TypeScript 7](https://www.typescriptlang.org/) | Tipado de los datos de las mallas y de la lógica de previaturas |
| [Vite 8](https://vite.dev/) | Servidor de desarrollo y compilación para producción |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos y diseño responsive |
| [Lucide](https://lucide.dev/) | Íconos |
| [jsPDF 4](https://github.com/parallax/jsPDF) y [jsPDF-AutoTable 5](https://github.com/simonbengtsson/jsPDF-AutoTable) | Generación del informe de avance en PDF |
| [Fontsource](https://fontsource.org/) | Tipografías Bricolage Grotesque e Instrument Sans, incluidas en el sitio |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter) | Revisión de calidad del código |
| [Vercel](https://vercel.com/) | Hosting y despliegue automático desde GitHub |
| `localStorage` del navegador | Guardado del avance del estudiante, sin servidor ni cuentas |

## Optimizaciones implementadas

**Rendimiento**

- **Carga diferida del PDF:** las librerías para generar el PDF (unos 250 KB comprimidos) se
  descargan solo cuando el estudiante presiona "Descargar PDF". La carga inicial de JavaScript es
  de unos 90 KB comprimidos.
- **Sitio estático:** no hay servidor ni base de datos. Vercel entrega los archivos desde su red de
  distribución (CDN), lo que hace que la plataforma cargue rápido y no tenga costos de operación.
- **Fuentes incluidas en el sitio:** las tipografías se sirven desde el mismo dominio con
  Fontsource, sin depender de Google Fonts.
- **Cálculos precalculados y memorizados:** las relaciones entre ramos (qué abre cada uno) se
  indexan una sola vez por malla, y los estados de los ramos se recalculan solo cuando cambia el
  avance.
- **Líneas de conexión eficientes:** las curvas entre ramos se dibujan en una sola capa SVG y se
  recalculan solo al cambiar el ramo enfocado o el tamaño de la ventana.

**Experiencia de uso**

- **Avance sin cuenta:** se guarda automáticamente en el navegador.
- **Enlaces cortos para compartir:** el avance se codifica como un mapa de bits en base64url, así
  que el enlace pesa unos pocos caracteres aunque la malla tenga más de 60 ramos.
- **PDF liviano:** usa fuentes estándar, por lo que el archivo pesa poco y su texto se puede
  seleccionar y buscar.

**Accesibilidad**

- Navegación con teclado, foco visible, etiquetas para lectores de pantalla y cierre de ventanas
  con Esc.
- Respeta la preferencia de movimiento reducido del sistema operativo en animaciones y
  transiciones.
- Diseño adaptado a celulares, tablets y computadores.

## Estructura

```
└── 📁malla-icinf
    └── 📁public
        ├── apple-touch-icon.png
        ├── favicon.svg
    └── 📁src
        └── 📁assets
            ├── logo-icinf.png
        └── 📁components
            ├── Cinta.tsx
            ├── Detalle.tsx
            ├── Guia.tsx
            ├── Inscribir.tsx
            ├── MapaMalla.tsx
            ├── Modal.tsx
            ├── Reportar.tsx
            ├── Tarjeta.tsx
        └── 📁data
            ├── mallas.ts
            ├── types.ts
        └── 📁lib
            ├── malla.ts
            ├── pdf.ts
            ├── useProgreso.ts
        ├── App.tsx
        ├── index.css
        ├── main.tsx
    ├── .gitignore
    ├── .oxlintrc.json
    ├── CHANGELOG.md
    ├── index.html
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

Previaturas especiales soportadas en `mallas.ts`:

- `r('id-ramo', ...)` previatura por asignatura
- `SEM(8)` semestres 1 al 8 aprobados
- `CONSEJO` aprobación del Consejo de Carrera (se muestra como condicional)

## Desarrollo

```bash
npm install
npm run dev      
npm run build    
```

## Despliegue en Vercel

La plataforma está publicada en https://malla-icinf-ulagos.vercel.app/ y conectada a este
repositorio:

- Cada `git push` a `main` genera y publica una nueva versión automáticamente.
- Vercel detecta Vite: build `npm run build`, salida `dist`. No requiere variables de entorno.
- Si un despliegue falla, el detalle está en Vercel → *Deployments* → *Build Logs*. Antes de
  hacer push conviene correr `npm run build` localmente, que es el mismo comando que usa Vercel.

## Fases del proyecto

### Fase 1: Malla interactiva

- [x] Transcripción de la Malla DU 416 y de la Malla 2027 con SCT, DD, TA, áreas y previaturas
- [x] Estados de cada ramo y conexiones visuales entre previaturas
- [x] Panel de detalle por asignatura
- [x] Avance guardado en el navegador y enlace para compartirlo
- [x] Despliegue en Vercel

### Fase 2: Planificación de la inscripción

- [x] Semestre de referencia del estudiante
- [x] Separación de ramos atrasados y ramos del semestre siguiente
- [x] Contador de SCT con aviso informativo al superar el tope
- [x] Nota para consultar dudas en la Dirección Docente

### Fase 3: Exportación y ayuda

- [x] Informe de avance en PDF, con nombre del estudiante opcional
- [x] Guía de uso integrada
- [x] Reporte de problemas a través de GitHub
- [x] Indicadores de avance hacia la Licenciatura y el Título profesional

### Fase 4: Ajustes según la operación de la carrera

- [ ] Mostrar los ramos atrasados solo en el período en que se dictan (por definir)
- [ ] Incorporar en la Guía el valor oficial de 1 SCT en la Universidad de Los Lagos
- [ ] Canal para reportar problemas sin necesidad de una cuenta de GitHub

### Fase 5: Cuentas y datos centralizados (Supabase)

- [ ] Inicio de sesión con correo institucional y avance sincronizado entre dispositivos
- [ ] Panel para que la Dirección de Carrera edite la malla sin modificar código
- [ ] Estadísticas agregadas para planificar la oferta de asignaturas

## Versionamiento

La plataforma usa [versionamiento semántico](https://semver.org/lang/es/) con el formato
`MAYOR.MENOR.PARCHE`:

| Parte | Cuándo cambia | Ejemplo |
|---|---|---|
| **MAYOR** | Cambios de fondo en la plataforma o en cómo se guarda el avance | Incorporar una nueva malla o cuentas de usuario con Supabase |
| **MENOR** | Nuevas funcionalidades que no afectan lo existente | Agregar la exportación a PDF o la Guía |
| **PARCHE** | Correcciones de errores, datos de la malla, textos o estilos | Corregir una previatura o los SCT de una asignatura |

Cada versión publicada se marca con una etiqueta de Git (por ejemplo `v1.0.0`) y se registra en
[GitHub Releases](https://github.com/Vikktor93/malla-icinf-ulagos/releases).
El detalle de los cambios de cada versión está en el [CHANGELOG](CHANGELOG.md).

## Licencia

El código de esta plataforma se distribuye bajo la [licencia MIT](LICENSE).

Los planes de estudio (asignaturas, créditos, horas y previaturas) corresponden a la información
oficial de la Universidad de Los Lagos y se incluyen solo como referencia. La licencia MIT cubre el
código, no esos contenidos ni el logo de la carrera.

## Desarrollo y contacto

Plataforma desarrollada por **Victor Saldivia Vera**, académico del Departamento de Ciencias de la
Ingeniería, Universidad de Los Lagos.

Si tienes dudas o consultas sobre el uso de la plataforma, contáctame a través de
[GitHub](https://github.com/Vikktor93) o abre un
[issue](https://github.com/Vikktor93/malla-icinf-ulagos/issues) en este repositorio.

---

**Versión:** 1.0.0 | **Última actualización:** 6 de noviembre de 2026
