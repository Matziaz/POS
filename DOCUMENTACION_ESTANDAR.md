# Estandar de Documentacion del Proyecto

Documento que establece el estandar para mantener consistencia en la organizacion de documentacion en el proyecto.

## Estructura General

El proyecto tiene DOS carpetas principales de documentacion:

### 1. `/docs` - Documentacion Estrategica

Contiene documentacion de alto nivel, visiones y decisiones arquitectonicas.

Estructura:
```
docs/
├── README.md (indice principal)
├── product/
│   ├── vision.md
│   └── ... (otros docs de producto)
├── architecture/
│   ├── decisiones-arquitectura.md
│   └── ... (otros docs arquitectonicos)
└── planning/
    ├── roadmap.md
    └── ... (otros docs de planificacion)
```

Contenido permitido:
- Documentacion de producto y vision
- Decisiones arquitectonicas
- Roadmaps y planificacion estrategica
- Documentacion de alto nivel

NO incluir:
- Documentacion tecnica de features (usar docs-dev/features)
- Guias de desarrollo (usar docs-dev/guides)
- Historico de sprints (usar docs-dev/sprint*)

### 2. `/docs-dev` - Documentacion de Desarrollo

Contiene documentacion tecnica, guias de desarrollo y documentacion de sprints.

Estructura:
```
docs-dev/
├── README.md (indice principal)
├── guides/ (6 documentos de desarrollo)
│   ├── GLOSSARY.md
│   ├── QUICKSTART.md
│   ├── DEVELOPMENT.md
│   ├── THEMING_GUIDE.md
│   ├── PRISMA_GUIDE.md
│   └── RUN_CURRENT_STATE_README.md
├── features/ (documentacion de features)
│   ├── SOFT_DELETE_PRODUCTOS.md
│   ├── APERTURA_CAJA_TERMINAL_VENTAS.md
│   ├── ... (otros features)
├── sprint 1/ (historico)
├── sprint 2/ (historico)
│   ├── CHANGELOG.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── planning/
│   └── team/
└── sprint 3/ (actual/futuro)
    ├── onboarding/
    └── team/
```

Contenido permitido:
- Guias de desarrollo (DEVELOPMENT.md, QUICKSTART.md, etc)
- Documentacion de features completadas o en progreso
- Historico de sprints (CHANGELOG.md, EXECUTIVE_SUMMARY.md)
- Informacion de onboarding
- Asignaciones de equipo

NO incluir:
- Documentacion estrategica (usar docs/)
- Visiones de producto (usar docs/product)
- Decisiones arquitectonicas generales (usar docs/architecture)

## Reglas para Ambas Carpetas

1. **README.md obligatorio**: Cada carpeta principal debe tener README.md que indexe su contenido
2. **Sin archivos sueltos en raiz**: Solo README.md en la raiz, todo lo demas en subcarpetas
3. **Nombres descriptivos**: Nombres de carpetas en minusculas, archivos sin prefijos innecesarios
4. **Sin emojis**: Documentacion limpia sin caracteres decorativos
5. **Estructura clara**: Subcarpetas tematicas para agrupar contenido relacionado
6. **Referencias cruzadas**: README.md debe mencionar la otra carpeta

## Guia para Agregar Nuevo Contenido

### Nuevo documento de producto o estrategia
- Carpeta: `/docs`
- Subcarpeta: `product/`, `architecture/`, `planning/` o crear nueva segun tema
- Archivo: `nombre-descriptivo.md` (en minusculas con guiones)
- Actualizar: `/docs/README.md`

### Nueva guia de desarrollo
- Carpeta: `/docs-dev/guides`
- Archivo: `NOMBRE_GUIDE.md` (MAYUSCULAS)
- Actualizar: `/docs-dev/README.md`

### Documentacion de feature
- Carpeta: `/docs-dev/features`
- Archivo: `NOMBRE_FEATURE.md` (MAYUSCULAS)
- Actualizar: `/docs-dev/README.md`

### Documentacion de sprint
- Carpeta: `/docs-dev/sprint [N]/`
- Archivo: Usar subcarpetas (planning, team, progress, onboarding)
- Mantener estandar de nombres de la carpeta del sprint

## Mantenimiento

- Revisar y actualizar README.md cuando se agregue nuevo contenido
- Eliminar archivos redundantes (duplicados)
- Mover documentacion a carpeta correcta si esta mal ubicada
- Mantener links relativos en README.md activos

## Referencias

Para mantener esta estructura actualizada, consultar este documento como fuente de verdad.
