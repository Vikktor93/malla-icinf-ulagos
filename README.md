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
            ├── Inscribir.tsx
            ├── MapaMalla.tsx
            ├── Tarjeta.tsx
        └── 📁data
            ├── mallas.ts
            ├── types.ts
        └── 📁lib
            ├── malla.ts
            ├── useProgreso.ts
        ├── App.tsx
        ├── index.css
        ├── main.tsx
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
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

## Próximos pasos

### 1. Exportar el avance a PDF

Que el avance (incluido el que se abre desde un enlace compartido) se pueda descargar como PDF,
con la malla y cohorte, los ramos aprobados por semestre, los SCT acumulados, el porcentaje de
avance y los ramos que puede inscribir.

### 2. Ramos atrasados según período de dictación

Si cada asignatura se dicta una vez al año, un ramo atrasado solo se puede inscribir en el período
en que se dicta (semestres impares o pares). Por definir si el panel de inscripción debe mostrar
los ramos atrasados solo cuando corresponde dictarlos.

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
