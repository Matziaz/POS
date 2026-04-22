# Documentacion para Desarrolladores

Esta carpeta contiene la documentacion necesaria para trabajar en el proyecto POS.

## Guias de Desarrollo

Documentacion tecnica y convenciones del proyecto (en carpeta `/guides`):

- **[GLOSSARY.md](./guides/GLOSSARY.md)** (15 min) — Conceptos basicos
  - Terminos web, Node.js, npm, Git explicados
  - Mensajes de error comunes

- **[QUICKSTART.md](./guides/QUICKSTART.md)** (90 min) — Setup inicial
  - Instalacion y configuracion paso a paso
  - Arquitectura general del proyecto
  - Troubleshooting

- **[DEVELOPMENT.md](./guides/DEVELOPMENT.md)** (30 min) — Referencia constante
  - Convenciones de codigo
  - Estructura del proyecto
  - Comandos utiles

- **[THEMING_GUIDE.md](./guides/THEMING_GUIDE.md)** (15 min) — Componentes con tema
  - Usar variables CSS correctamente
  - Compatibilidad light/dark mode
  - Checklist antes de merge

- **[PRISMA_GUIDE.md](./guides/PRISMA_GUIDE.md)** — Base de datos con Prisma
  - Modelos y relaciones
  - Migraciones

- **[RUN_CURRENT_STATE_README.md](./guides/RUN_CURRENT_STATE_README.md)** — Como ejecutar el proyecto
  - Comandos para desarrollo
  - Configuracion de base de datos

## Features Documentadas

Documentacion de features completadas y cambios tecnicos (en carpeta `/features`):

### Gestion de Datos
- **SOFT_DELETE_PRODUCTOS.md** — Borrado logico de productos
- **CONFIGURACION_INICIAL_DB_SCHEMA.md** — Setup inicial y schema

### Terminal de Venta
- **APERTURA_CAJA_TERMINAL_VENTAS.md** — Apertura de caja en terminal
- **PAGINACION_VENTAS.md** — Paginacion del historial de ventas
- **FILTROS_VENTAS.md** — Filtros por fecha y hora en historial

### Inventario
- **CONTACTOS_INVENTARIO.md** — Gestion de contactos e inventario
- **PAGINACION_PRODUCTOS.md** — Paginacion de productos en inventario
- **FILTROS_PRODUCTOS.md** — Estado de filtros/ordenamiento de productos
- **INVENTORY_DEMO_IMPROVEMENTS.md** — Mejoras en UI de inventario

## Documentacion de Sprints

- **[sprint 1/](./sprint%201/)** — Primera iteracion (cerrada)
- **[sprint 2/](./sprint%202/)** — Segunda iteracion (cerrada)
  - CHANGELOG.md — Cambios realizados
  - EXECUTIVE_SUMMARY.md — Resumen ejecutivo
- **[sprint 3/](./sprint%203/)** — Tercera iteracion (en progreso)

## Por Donde Empezar

Si es tu primer proyecto web:
1. Lee [GLOSSARY.md](./guides/GLOSSARY.md) (15 min)
2. Luego [QUICKSTART.md](./guides/QUICKSTART.md) (90 min)

Si ya conoces desarrollo web:
1. Comienza con [QUICKSTART.md](./guides/QUICKSTART.md)
2. Consulta [DEVELOPMENT.md](./guides/DEVELOPMENT.md) segun sea necesario

## Referencias Rapidas

| Necesito...                     | Ver                                                                      |
| ------------------------------- | ---------- |
| Vision del proyecto             | [../docs/vision.md](../docs/vision.md)                                   |
| Decisiones arquitectonicas      | [../docs/decisiones-arquitectura.md](../docs/decisiones-arquitectura.md) |
| Plan de desarrollo              | [../docs/roadmap.md](../docs/roadmap.md)                                 |
