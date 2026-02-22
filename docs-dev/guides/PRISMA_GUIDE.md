# Configuracion de Base de Datos — Prisma + SQLite

Al terminar este documento deberias ser capaz de conectar el proyecto a una base de datos SQLite usando Prisma y ejecutar consultas desde el codigo.

Este proceso corresponde a la capa **infrastructure/database**, que es responsable de la persistencia de datos.

---

## Requisitos Previos

Antes de empezar, verifica que tienes:

| Herramienta      | Version minima | Verificacion                |
| ---------------- | -------------- | --------------------------- |
| Node.js          | v18 o mayor    | `node --version`            |
| npm              | v9 o mayor     | `npm --version`             |
| Proyecto clonado | —              | Debe existir `package.json` |

Si no has ejecutado esto aun:

```bash
npm install
```

Esto instala todas las dependencias del proyecto.

---

## Paso 1 — Instalar Prisma

Desde la raiz del proyecto ejecuta:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

### Que hace esto

Instala dos componentes distintos:

**prisma**

* Es la herramienta de desarrollo
* Permite generar el cliente y sincronizar la base de datos
* Solo se usa durante desarrollo

**@prisma/client**

* Es la libreria que usa el codigo para hacer consultas
* Es la que usan los repositories

### Por que se instala en la raiz

Porque Prisma pertenece a toda la aplicacion, no solo a una carpeta especifica.

Esto permite que cualquier parte de infrastructure pueda usarlo.

---

## Paso 2 — Inicializar Prisma

Ejecuta:

```bash
npx prisma init
```

Esto crea:

```
prisma/
   schema.prisma

.env
```

### Que es schema.prisma

Es el archivo que le dice a Prisma:

* Que tipo de base de datos usamos
* Donde esta ubicada

---

## Paso 3 — Crear el archivo de base de datos 

Dentro de la carpeta prisma crea el archivo:

```
prisma/pos.db
```

Puedes hacerlo desde VSCode:

Click derecho → New File → escribir:

```
pos.db
```

### Por que es necesario

SQLite guarda toda la base de datos en un archivo fisico.

Si el archivo no existe, la conexion falla.

---

## Paso 4 — Configurar la conexion

Abre el archivo:

```
.env
```

y agrega:

```env
DATABASE_URL="file:./pos.db"
```

### Que significa esto

Le dice a Prisma:

* usa SQLite
* el archivo esta en la carpeta prisma

Es una ruta relativa, lo que permite que funcione en cualquier computadora.

---

## Paso 5 — Crear las tablas

Ejecuta el script SQL para crear las tablas:

Ejemplo:

* role
* user
* product
* provider
* sale
* sale_item
* inventory_movement

### Por que este paso es importante

Define la estructura de la base de datos.

Sin esto, Prisma no tiene nada que leer.

---

## Paso 6 — Importar la estructura a Prisma 

Ejecuta:

```bash
npx prisma db pull
```

### Que hace este comando

Lee la base de datos y genera automaticamente los modelos en:

```
prisma/schema.prisma
```

Esto evita escribir los modelos manualmente.

Mantiene Prisma sincronizado con la base de datos real.

---

## Paso 7 — Generar el cliente Prisma

Ejecuta:

```bash
npx prisma generate
```

### Que hace este comando

Genera el cliente en:

```
node_modules/@prisma/client
```

Este cliente permite hacer consultas desde TypeScript.

Ejemplo:

```ts
prisma.product.findMany()
```

---

## Paso 8 — Crear el cliente Prisma

Crear archivo:

```
src/infrastructure/database/prismaClient.ts
```

Contenido:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

### Por que se hace esto

Centraliza la conexion.

Todos los repositories usaran este cliente.

Esto sigue el principio de separacion de responsabilidades.

---

## Paso 9 — Probar la conexion 

Crear archivo:

```
src/infrastructure/database/testConnection.ts
```

Contenido:

```ts
import { prisma } from "./prismaClient.js";

async function main() {

    console.log("Conectando...");

    const products = await prisma.product.findMany();

    console.log(products);

}

main();
```

Ejecutar:

```bash
npx ts-node src/infrastructure/database/testConnection.ts
```

Resultado esperado:

```
Conectando...
[]
```

Esto confirma que Prisma funciona correctamente.

---

## Paso 12 — Verificar que todo funciona

Ejecuta:

```bash
npx prisma studio
```

Se abrira una interfaz web donde puedes ver las tablas.

Si ves las tablas, todo esta configurado correctamente.

---

## Resultado Final

Despues de completar estos pasos, el proyecto tiene:

* Base de datos SQLite funcional
* Prisma configurado
* Conexion funcionando
* Cliente listo para usar
* Infrastructure lista para implementar repositories

---

## Problemas Comunes

### Error: Unable to open database file

Verifica que exista:

```
prisma/pos.db
```

---

### Error: Cannot find module @prisma/client

Ejecuta:

```bash
npx prisma generate
```

---

### Error: DATABASE_URL incorrecto

Verifica que `.env` tenga:

```
DATABASE_URL="file:./pos.db"
```

---

## Justificacion Arquitectonica

Prisma se usa porque:

* Proporciona tipado fuerte
* Reduce errores
* Facilita consultas
* Permite cambiar de SQLite a PostgreSQL en el futuro

Se ubica en infrastructure porque es un detalle tecnico, no logica de negocio.

El core nunca depende directamente de Prisma.

---
