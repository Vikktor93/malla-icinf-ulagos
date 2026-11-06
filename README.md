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
- "Puedes inscribir": lista de ramos disponibles, ordenados por cuántos ramos abren, con un plan
  de inscripción que suma SCT y horas semanales.
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

### 2. Botón "Puedes inscribir" acotado al semestre siguiente

Hoy el botón cuenta todos los ramos cuyas previaturas están cumplidas, sin importar el semestre.
Por ejemplo, un estudiante con los semestres 1 al 6 aprobados ve "Puedes inscribir 19 ramos",
porque también se cuentan ramos de semestres superiores sin previatura. Un estudiante puede
tomarlo de forma literal.

Cambio a realizar:

- Mostrar solo los ramos del semestre siguiente al último semestre completo (en el ejemplo, el
  semestre 7).
- Definir cómo tratar los ramos pendientes de semestres anteriores (rezagados), que también
  deberían ofrecerse para inscripción.
- Cambiar el texto del botón para que no se lea como un número de ramos a inscribir, por ejemplo
  "Ver ramos para tu próximo semestre".

### 3. Límite de 30 SCT semestrales

Mostrar un mensaje visible, en el panel de inscripción y junto al botón, que indique que la suma de
las asignaturas inscritas no debe superar los 30 SCT semestrales, y avisar cuando el plan del
estudiante lo supere.
