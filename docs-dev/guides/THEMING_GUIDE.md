# Theming Guide — Componentes Compatibles con Claro y Oscuro

Esta guia explica como construir o modificar componentes para que funcionen bien con el sistema de tema del proyecto.

El objetivo es simple: no usar colores fijos ni estilos que se rompan al activar `dark`.

---

## Principio Base

El tema se controla con la clase `dark` en el elemento raiz y con variables CSS declaradas en [src/index.css](../../src/index.css).

Usa siempre clases semanticas como:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-muted-foreground`
- `border-border`
- `bg-accent`
- `text-accent-foreground`

No uses colores duros o aislados como `bg-white`, `text-black`, `border-gray-200` o `text-slate-500` salvo casos muy puntuales y justificados.

---

## Como Pensar un Nuevo Componente

Antes de escribir estilos, responde estas preguntas:

1. ¿El componente vive sobre el fondo general o dentro de una tarjeta?
2. ¿Tiene estado activo, hover, deshabilitado o de error?
3. ¿Necesita verse distinto en dark mode o ya puede resolverlo con tokens semanticos?

Regla practica:

- Fondo general: `bg-background`
- Contenedor elevado: `bg-card`
- Texto principal: `text-foreground`
- Texto secundario: `text-muted-foreground`
- Borde normal: `border-border`
- Estado activo: `bg-primary text-primary-foreground`

---

## Patrones Recomendados

### Tarjeta simple

```tsx
<div className="rounded-xl border bg-card p-4 text-card-foreground">
  <h2 className="text-sm font-semibold text-foreground">Titulo</h2>
  <p className="text-sm text-muted-foreground">Descripcion breve</p>
</div>
```

### Boton secundario

```tsx
<button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground">
  Accion
</button>
```

### Estado activo o seleccionado

```tsx
<button className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:opacity-95">
  Seleccionado
</button>
```

### Texto auxiliar

```tsx
<span className="text-xs text-muted-foreground">Informacion secundaria</span>
```

---

## Buenas Practicas

- Usa `bg-card` para paneles y modales, no blanco fijo.
- Usa `text-muted-foreground` para ayudas, etiquetas y metadatos.
- Usa `border-border` para contornos base.
- Usa `hover:bg-accent` para botones y items de navegacion.
- Si el componente tiene estados `active`, `selected` o `danger`, define clases semanticas para esos estados.
- Prefiere `cn(...)` cuando la clase cambie por estado o por variante.

Ejemplo:

```tsx
className={cn(
  "rounded-md px-3 py-2 text-sm transition-colors",
  isActive
    ? "bg-primary text-primary-foreground"
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
)}
```

---

## Lo Que No Debes Hacer

- No pongas `bg-white` en un contenedor que también debe verse bien en dark mode.
- No uses `text-gray-500` si el texto es parte del sistema de tema.
- No mezcles colores arbitrarios con tokens del sistema sin una razon clara.
- No agregues una segunda paleta por componente si el sistema global ya cubre el caso.

---

## Checklist Antes de Crear o Modificar Un Componente

1. ¿Se ve bien con el tema claro?
2. ¿Se ve bien con el tema oscuro?
3. ¿Usa tokens semanticos en lugar de colores fijos?
4. ¿Los estados hover, focus y disabled siguen siendo legibles?
5. ¿El borde, fondo y texto tienen contraste suficiente?
6. ¿El componente respeta `bg-background`, `bg-card`, `text-foreground` y `border-border`?

Si respondes "no" a una de esas preguntas, revisa las clases antes de hacer merge.

---

## Donde Ver Ejemplos Reales

- [src/interface/components/layout/AppLayout.tsx](../../src/interface/components/layout/AppLayout.tsx) — topbar, sidebar y toggle de tema.
- [src/interface/components/ui/button.tsx](../../src/interface/components/ui/button.tsx) — patron de variantes.
- [src/interface/components/sales/terminal/TicketSummary.tsx](../../src/interface/components/sales/terminal/TicketSummary.tsx) — panel con fondo, bordes y texto semantico.

---

## Nota Tecnica

El archivo [src/index.css](../../src/index.css) define las variables del tema y `tailwind.config.js` mapea esas variables a clases utilitarias.

Eso significa que, en la practica, el tema se resuelve con clases como `bg-card`, `text-foreground` y `border-border`, no con logica especial dentro del componente.

Si un componente requiere un color nuevo, primero intenta expresarlo como variable semantica. Solo crea una variable adicional si realmente representa un concepto reutilizable del sistema.