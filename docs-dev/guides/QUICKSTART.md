# Getting Started — Primer Dia de Desarrollo

Al terminar este documento deberias ser capaz de ejecutar `npm run dev` y ver la aplicacion en el navegador.

---

## Requisitos Previos

Antes de empezar, verifica que tienes instalado lo siguiente:

| Herramienta | Version minima | Descarga |
|-------------|---------------|---------|
| Node.js (incluye npm) | v18 o mayor | https://nodejs.org/ — elige la version LTS |
| Git | Cualquier version reciente | https://git-scm.com/ |
| Editor de codigo | — | VS Code recomendado: https://code.visualstudio.com/ |

Para verificar que esten instalados, abre PowerShell o Terminal y ejecuta:

```bash
node --version   # Debe mostrar v18 o mayor
npm --version    # Debe mostrar v9 o mayor
git --version    # Debe mostrar cualquier version
```

Si alguno devuelve error, instalalo antes de continuar. Si nunca trabajaste con estas herramientas, lee primero [GLOSSARY.md](./GLOSSARY.md).

---

## Paso 1 — Setup Inicial (15 minutos)

Ejecuta los siguientes comandos en orden:

```bash
# Navega a la carpeta del proyecto
cd ruta/donde/esta/el/proyecto

# Instala las dependencias (toma 1-2 minutos la primera vez)
npm install

# Crea tu archivo de configuracion local
cp .env.example .env.local
# En Windows, si da error, copia .env.example manualmente y renombralo .env.local

# Inicia el servidor de desarrollo
npm run dev
```

---

## Paso 2 — Verifica que Funciona (5 minutos)

Despues de ejecutar `npm run dev`, abre tu navegador y ve a:

```
http://localhost:3000
```

Deberias ver la pantalla inicial del proyecto. En PowerShell o Terminal deberia aparecer algo similar a:

```
VITE v5.0.8  ready in 245 ms
Local:   http://localhost:3000/
```

Notas importantes:
- Deja PowerShell o Terminal abierto mientras trabajas. Si lo cierras, el servidor se detiene.
- Para detener el servidor presiona `Ctrl+C`.
- Para volver a iniciarlo ejecuta `npm run dev` de nuevo.

Si no ves nada despues de un minuto, revisa la seccion de problemas comunes al final de este documento.

---

## Paso 3 — Lee la Documentacion (30-45 minutos)

Lee en este orden. Cada documento da contexto para el siguiente:

1. [../README.md](../README.md) — Contexto general y stack tecnologico (5 min)
2. [../docs/vision.md](../docs/vision.md) — Por que existe el proyecto y que problema resuelve (5 min)
3. [../docs/decisiones-arquitectura.md](../docs/decisiones-arquitectura.md) — Por que se eligieron estas tecnologias (10 min)
4. [./guides/DEVELOPMENT.md](./guides/DEVELOPMENT.md) — Convenciones de codigo y flujo de trabajo (15 min)
5. [../docs/roadmap.md](../docs/roadmap.md) — Plan de los 6 sprints (10 min)

No es necesario memorizar todo. El objetivo es entender por que el proyecto esta estructurado asi y saber donde buscar cuando tengas dudas.

---

## Paso 4 — Explora la Estructura del Proyecto (15 minutos)

Abre la carpeta `src/` y observa como esta organizada:

```
src/
├── core/           Logica de negocio sin dependencias externas
├── domain/         Reglas especificas por tipo de comercio
├── infrastructure/ Base de datos y APIs
├── interface/      Componentes React y logica visual
└── shared/         Tipos, constantes y utilidades compartidas
```

Abre el archivo `index.ts` de cada carpeta. Cada uno explica que tipo de codigo va ahi y que no debe incluirse.

---

## Comandos Utiles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run lint         # Revisa el codigo en busca de errores de estilo
npm run type-check   # Verifica tipos de TypeScript
npm run test         # Ejecuta las pruebas
npm run format       # Formatea el codigo automaticamente
```

---

## Problemas Comunes

### "npm command not found" o "npm no es reconocido"

Node.js no esta instalado o no esta en el PATH del sistema.

1. Descarga e instala Node.js desde https://nodejs.org/ eligiendo la version LTS.
2. Reinicia PowerShell o Terminal.
3. Verifica con `node --version`.

### "No such file or directory" al copiar .env.example

Estas en la carpeta equivocada. Verifica tu ubicacion actual:

```bash
pwd       # Mac o Linux
cd        # Windows, muestra la ruta actual
```

Navega a la carpeta raiz del proyecto e intenta de nuevo.

### "node_modules not found" al ejecutar npm run dev

Olvidaste ejecutar `npm install`. Ejecutalo y luego vuelve a intentar.

### npm install tarda mas de 15 minutos o se detiene

Verifica que tengas al menos 1GB de espacio libre en disco. Si la conexion es lenta puede tomar hasta 10 minutos. Si no avanza, cancela con `Ctrl+C` y reintenta con:

```bash
npm install --legacy-peer-deps
```

### "Cannot find module '@/...'" al abrir un archivo

Es normal durante la primera compilacion. Espera a que `npm run dev` termine de compilar (2-3 minutos).

### El navegador muestra "Cannot GET localhost:3000"

Vite no esta corriendo. Verifica que PowerShell muestre mensajes de compilacion. Si no, detien el proceso con `Ctrl+C` y ejecuta `npm run dev` de nuevo.

Si el problema persiste, limpia las dependencias y reinstala:

```bash
rm -rf node_modules
npm install
npm run dev
```

### No entiendo el mensaje de error

Copia el texto completo del error y comparte con el tech lead indicando que estabas haciendo cuando aparecio.

---

## Preguntas Frecuentes

**Que hace npm install exactamente?**
Descarga todas las librerias que el proyecto necesita. La primera vez ocupa aproximadamente 500MB y toma 1-2 minutos. Es normal que tarde.

**Que hace npm run dev?**
Inicia un servidor local que detecta cambios en el codigo y recarga la aplicacion automaticamente. Debe estar corriendo mientras trabajas.

**Cuanta RAM necesito?**
Minimo 4GB. Con 8GB el entorno corre con comodidad. Si tienes exactamente 4GB, cierra otros programas antes de ejecutar npm install.

**Puedo usar un editor distinto a VS Code?**
Si. VS Code es recomendado por su integracion con TypeScript, pero cualquier editor funciona.

**Puedo modificar la estructura de carpetas del proyecto?**
No sin acordarlo primero con el equipo. Si tienes una propuesta, planteala en el standup.

**Cuando empezamos a trabajar en funcionalidades?**
Despues del Sprint Planning. Las tareas especificas por area se asignan ahi.