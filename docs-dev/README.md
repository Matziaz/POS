# Documentacion Para Desarrolladores

Esta carpeta contiene todo lo que necesitas para empezar a trabajar en el proyecto.

## Documentos Disponibles

1. **[GLOSSARY.md](./guides/GLOSSARY.md)** (15 min) — Si es tu primer proyecto web
   - Que es un framework, Node.js, npm, Git
   - Conceptos tecnicos explicados en lenguaje simple
   - Mensajes de error comunes y que significan

2. **[QUICKSTART.md](./guides/QUICKSTART.md)** (90 min) — Setup y arquitectura
   - Setup paso a paso
   - Como entender la arquitectura del proyecto
   - Primeras tareas recomendadas
   - Troubleshooting

3. **[DEVELOPMENT.md](./guides/DEVELOPMENT.md)** (30 min) — Consulta permanente
   - Convenciones de codigo
   - Estructura detallada del proyecto
   - Comandos utiles
   - Problemas comunes y como resolverlos

4. **[THEMING_GUIDE.md](./guides/THEMING_GUIDE.md)** (15 min) — Como construir componentes compatibles con claro y oscuro
   - Uso correcto de variables CSS y clases semanticas
   - Patrones para nuevos componentes
   - Checklist rapido antes de merge

5. **[README_SOFT_DELETE_PRODUCTOS.md](./README_SOFT_DELETE_PRODUCTOS.md)** — Borrado logico y restauracion de productos
   - Cambio de delete fisico a soft delete
   - Restauracion con stock manual desde una pagina dedicada
   - Ajustes necesarios en Prisma, IPC, repositorios y store/hook UI

## Por Donde Empezar

**Paso 1 — Solo si nunca trabajaste con desarrollo web:**
Lee [GLOSSARY.md](./guides/GLOSSARY.md) antes de cualquier otra cosa (15 min).

**Paso 2 — Todos, el primer dia:**
Lee [QUICKSTART.md](./guides/QUICKSTART.md). Cubre el setup completo, la arquitectura y el troubleshooting (90 min).

**Paso 3 — Durante el proyecto:**
Consulta [DEVELOPMENT.md](./guides/DEVELOPMENT.md) cuando necesites recordar convenciones o comandos.

**Paso 4 — Cuando agregues componentes nuevos:**
Lee [THEMING_GUIDE.md](./guides/THEMING_GUIDE.md) antes de tocar estilos. Te dice como usar el sistema de tema sin romper compatibilidad con modo oscuro.

## Referencias Rapidas

| Si necesitas...                 | Ve a                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| Entender que construimos        | [../docs/vision.md](../docs/vision.md)                                   |
| Saber por que estas tecnologias | [../docs/decisiones-arquitectura.md](../docs/decisiones-arquitectura.md) |
| Ver el plan de desarrollo       | [../docs/roadmap.md](../docs/roadmap.md)                                 |
