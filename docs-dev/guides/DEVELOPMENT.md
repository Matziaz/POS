# Guia de Desarrollo — Cenzontle POS

## Setup Inicial

### Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Instalacion

```bash
# Clonar el repositorio
git clone <repo-url>
cd pos-adaptable

# Instalar dependencias
npm install

# Crear archivo de configuracion local
cp .env.example .env.local
```

---

## Estructura del Proyecto

```
src/
├── core/                      # Logica de negocio pura (sin dependencias de UI o BD)
│   ├── entities/              # Entidades del dominio (Producto, Venta, etc)
│   ├── repositories/          # Interfaces de repositorio
│   ├── services/              # Servicios de dominio
│   └── errors/                # Errores personalizados
│
├── domain/                    # Modelos y contextos de negocio
│   ├── contextos/             # Contextos especificos por tipo de comercio
│   └── rules/                 # Reglas de negocio
│
├── infrastructure/            # Implementacion tecnica
│   ├── database/              # SQLite + Prisma
│   ├── persistence/           # Guardado y lectura de datos
│   ├── hardware/              # Integracion con impresoras y escaneres
│   └── config/                # Configuracion de la aplicacion
│
├── interface/                 # Presentacion (React)
│   ├── components/            # Componentes React reutilizables
│   ├── pages/                 # Paginas y pantallas principales
│   ├── hooks/                 # Hooks personalizados
│   └── store/                 # Estado global (Zustand)
│
├── shared/                    # Codigo compartido
│   ├── types/                 # Tipos compartidos
│   ├── utils/                 # Utilidades
│   └── constants/             # Constantes
│
└── main.tsx                   # Punto de entrada de React
```

---

## Comandos de Desarrollo

```bash
# Iniciar en modo desarrollo (React + Electron)
npm run dev

# Solo servidor React (http://localhost:3000)
npm run react-dev

# Solo Electron (sin hot-reload de React)
npm run electron

# Compilar para produccion
npm run build

# Ejecutar tests
npm run test

# Ver tests en UI
npm run test:ui

# Revisar tipos
npm run type-check

# Linting
npm run lint

# Formatear codigo
npm run format
```

---

## Principios de Desarrollo

### Separacion de Responsabilidades

Cada capa tiene una funcion especifica y no debe mezclarse con las demas:

- core: logica sin IO
- infrastructure: detalles tecnicos
- interface: solo presentacion

### Tipado Fuerte

Todo debe estar tipado con TypeScript. No usar `any`. Preferir tipos explicitos sobre inferencia cuando el tipo no es evidente.

### Testing

Las entidades de core deben estar 100% cubiertas por pruebas. La razon de concentrar logica en core es precisamente que es la capa mas facil de testear de forma aislada.

### Convenciones de Codigo

- Nombres descriptivos en ingles
- PascalCase para clases y tipos
- camelCase para funciones y variables
- Imports ordenados: tipos, modulos internos, librerias de terceros

### Acceso entre Capas

Interface no debe importar directamente desde infrastructure. Toda comunicacion debe pasar por las interfaces definidas en core.

```typescript
// Incorrecto
import { DatabaseService } from '@infrastructure/database'

// Correcto
import { ProductRepository } from '@core/repositories'
```

---

## Commits y Git

Usa mensajes descriptivos que indiquen el tipo de cambio, la capa afectada y una descripcion breve:

```
feat(core): add Product entity
fix(interface): correct total calculation
test(core): add ProductService tests
refactor(infrastructure): improve database connection
```

---

## Resolucion de Problemas Comunes

### "Cannot find module"

```bash
npm install
# Verifica que los paths en tsconfig.json esten alineados con vite.config.ts
```

### Cambios no reflejados en Electron

Reinicia Electron completamente con `Ctrl+C` y vuelve a ejecutar `npm run dev`.

### Problemas con SQLite en Raspberry Pi

```bash
sudo apt-get install build-essential
npm install --force
```