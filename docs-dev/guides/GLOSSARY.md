# Glosario de Conceptos Tecnicos

Este documento explica terminos que aparecen constantemente en el proyecto. Usalo como referencia cuando encuentres algo desconocido, no es necesario leerlo completo de una sola vez.

---

## Herramientas Necesarias

| Termino | Que es | Para que sirve |
|---------|--------|----------------|
| Node.js | Entorno para correr JavaScript en tu PC | Permite que el proyecto funcione localmente |
| npm | Gestor de paquetes (viene con Node) | Descargar librerias que el proyecto necesita |
| Git | Sistema de control de versiones | Guardar cambios de codigo y colaborar con el equipo |
| Editor de Codigo | Programa para escribir codigo (ej: VS Code) | Editar archivos del proyecto |

---

## Comandos Frecuentes

| Comando | Que hace | Ejemplo |
|---------|----------|---------|
| npm install | Descarga todas las librerias necesarias | `npm install` (primera vez, toma 1-2 min) |
| npm run dev | Inicia el servidor de desarrollo | `npm run dev` (luego abre http://localhost:3000) |
| npm run test | Ejecuta las pruebas del codigo | `npm run test` |
| git clone | Descarga un proyecto desde el repositorio | `git clone https://...` |
| git add | Marca cambios para guardar | `git add .` |
| git commit | Guarda cambios localmente | `git commit -m "descripcion del cambio"` |
| git push | Envia cambios al servidor | `git push` |

---

## Conceptos Principales

### Framework

Un framework es un conjunto de herramientas y convenciones que facilitan construir software. Establece una estructura base para que el equipo no tenga que definir todo desde cero.

En este proyecto se usan tres:

- React — para construir la interfaz (botones, pantallas, formularios)
- Electron — para empaquetar la app como aplicacion de escritorio
- Vite — para compilar el codigo durante el desarrollo

### TypeScript

Es JavaScript con tipos de dato declarados. Esto permite detectar errores antes de ejecutar el codigo.

```typescript
// Sin tipos
let precio = 100
// No queda claro si es un numero, texto u otro tipo de dato

// Con tipos
let precio: number = 100
// Queda explicito que precio es un numero
```

### Componente

En React, un componente es un bloque reutilizable de interfaz. Funciona como una funcion que devuelve elementos visuales.

```typescript
function Boton() {
  return <button>Haz clic</button>
}

// Se puede usar en multiples lugares
<Boton />
```

### Estado y Props

- Props: datos que se le pasan a un componente desde afuera, similar a parametros de una funcion
- State: datos que el componente maneja internamente y que pueden cambiar

```typescript
// Props: se pasa el color como parametro
<Boton color="azul" />

// State: el componente recuerda si fue clickeado
const [clickeado, setClickeado] = useState(false)
```

### Base de Datos

Es donde se guardan los datos de la aplicacion (productos, ventas, clientes). En este proyecto se usa SQLite, que guarda todo en un archivo con extension `.db`.

### Persistencia

Es la capacidad de conservar datos aunque la aplicacion se cierre y se vuelva a abrir. La base de datos se encarga de esto automaticamente.

### APIs e Integracion

Son los mecanismos que permiten que la aplicacion se comunique con servicios externos, por ejemplo consultar informacion de otro sistema o enviar notificaciones.

---

## Carpetas del Proyecto

| Carpeta | Contenido |
|---------|-----------|
| src/ | Todo el codigo fuente del proyecto |
| node_modules/ | Librerias descargadas por npm. No modificar su contenido |
| dist/ | Codigo compilado listo para produccion |
| .git/ | Informacion interna de Git. No modificar su contenido |

---

## Extensiones de Archivos

| Extension | Tipo de archivo | Ejemplo |
|-----------|-----------------|---------|
| .ts | TypeScript | `Product.ts` |
| .tsx | TypeScript con React | `ProductCard.tsx` |
| .json | Datos o configuracion | `package.json` |
| .db | Base de datos SQLite | `pos.db` |
| .md | Markdown (documentacion) | `README.md` |

---

## Errores Comunes

| Mensaje | Causa probable |
|---------|----------------|
| `command not found` | El programa no esta instalado |
| `No such file` | La ruta es incorrecta o hay un error tipografico |
| `Cannot find module` | Falta una dependencia, ejecuta `npm install` |
| `Port 3000 in use` | Otro proceso esta usando ese puerto, detienlo primero |
| `Module not found` | La ruta del import esta mal escrita |

---

## Como Reportar una Duda

Cuando no entiendas algo, incluye esta informacion al preguntar:

1. El termino o mensaje de error exacto
2. Donde lo encontraste (archivo, comando, etc.)
3. Que estabas haciendo cuando aparecio

Eso le permite a quien te responda darte una respuesta precisa en lugar de una generica.

---

## Recursos de Referencia

Si quieres profundizar en algun tema por tu cuenta:

- JavaScript: https://javascript.info/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Git: https://git-scm.com/book/es/v2