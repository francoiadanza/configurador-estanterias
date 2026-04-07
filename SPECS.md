# Specs para Franco — Configurador 3D Mundo Estanterías

## Resumen

El componente `Estanteria3D.jsx` se integra al sitio de Mundo Estanterías como preview visual 3D
dentro del configurador de productos. El sitio ya maneja toda la UI (controles, carrito, WhatsApp).
Solo necesitamos de este repo el **componente 3D** y su lógica de rendering.

---

## Config que recibe el componente

El componente `Estanteria3D` recibe un único prop `config` con este shape exacto:

```js
{
  alto: 200,              // number — cm. Valores: 200 o 233
  profundidad: 30,        // number — cm. Valores: 30, 42 o 60
  estantes: 5,            // number — cantidad. Rango: 5 a 13
  kgEstante: 50,          // number — kg por estante. Rango: 50, 65, 80, 90, 100, 120, 150
  conFondo: false,        // boolean — fondo metálico trasero
  conLaterales: false,    // boolean — paneles laterales (por ahora on/off, después puede ser 0/1/2)
  regatones: 0,           // number — 0 = sin regatones, >0 = con regatones (4 unidades siempre)
  parante: "fino"         // string — "fino" | "grueso" | "industrial"
}
```

### Qué significa cada campo visualmente

| Campo | Efecto visual |
|-------|---------------|
| `alto` | Altura total de los 4 pilares (200cm o 233cm) |
| `profundidad` | Profundidad del mueble (30, 42 o 60 cm) |
| `estantes` | Cantidad de bandejas distribuidas uniformemente entre piso y techo |
| `kgEstante` | **Determina los refuerzos debajo de cada estante** (ver abajo) |
| `conFondo` | Muestra/oculta panel metálico trasero |
| `conLaterales` | Muestra/oculta paneles laterales |
| `regatones` | Muestra/oculta las 4 patas de apoyo (regatones cilíndricos) |
| `parante` | **Cambia el tamaño físico de los 4 pilares** (ver abajo) |

### Parante — dimensiones por tipo

Los pilares cambian de tamaño según el tipo de parante seleccionado:

| Tipo | Ancho × Profundidad | Cuándo se usa |
|------|---------------------|---------------|
| `"fino"` | 40mm × 40mm | Peso ≤ 50kg (o seleccionado manualmente) |
| `"grueso"` | 50mm × 50mm | Peso 65-120kg (o seleccionado manualmente). Único que permite altura 233cm |
| `"industrial"` | 70mm × 70mm | Peso ≥ 150kg (o seleccionado manualmente) |

### Refuerzos por kg/estante

Debajo de cada estante, la cantidad de nervios/refuerzos cambia según el kilaje:

| kg/estante | Refuerzos | Descripción visual |
|------------|-----------|-------------------|
| 50 | 0 | Estante liso por debajo (solo labios y barras, sin nervio central) |
| 65 – 90 | 1 | Un nervio central longitudinal debajo del estante |
| 100+ | 2 | Dos nervios paralelos separados ~1/3 del ancho cada uno |

### Ancho

El ancho siempre es **90cm fijo**. No va a cambiar.

### Escuadras

NO se renderizan en 3D. Se van a mostrar con una foto aparte.

---

## Página de test

La ruta `/test-estanterias` tiene una página con los controles exactos del configurador real
para que puedas testear todas las combinaciones. Incluye tabs para Estanterías y Estanrack.

---

## FASE 2: Estanrack (pendiente, no hacer todavía)

Para cuando se haga el componente `Estanrack3D.jsx`, estas son las specs completas:

### Config que va a recibir

```js
{
  vigas: 120,             // number — largo de viga en cm. Valores: 120, 150 o 180
  profundidad: 60,        // number — profundidad bastidor en cm. Valores: 60 o 90
  altura: 200,            // number — altura bastidor en cm. Valores: 200, 240 o 300
  pisos: 2,               // number — cantidad de pisos/niveles. Rango: 2 a 7 (máx depende de altura)
  tramos: 1,              // number — tramos iniciales (cada uno tiene 2 bastidores)
  extensiones: 0,         // number — extensiones (comparten 1 bastidor con el tramo anterior)
  pisoTipo: "sin"         // string — "sin" | "melamina" | "tablilla300" | "tablilla500"
}
```

### Descripción visual del Estanrack

El estanrack es estructuralmente DIFERENTE a una estantería:

**Bastidores (laterales):**
- Son tipo escalera: dos columnas verticales unidas por travesaños horizontales
- Las columnas tienen perforaciones tipo gota (no ovales como la estantería)
- Dimensiones: profundidad × altura (ej: 60×200cm, 90×300cm)

**Vigas (horizontales):**
- Son perfiles tipo C o cajón que se enganchan en los bastidores
- Van en pares (una adelante, una atrás) formando cada nivel/piso
- Largo: 120, 150 o 180 cm (esto es el "ancho" del tramo)
- NO son estantes planos — son vigas estructurales donde se apoya el piso

**Pisos (opcionales):**
- `"sin"` → Solo vigas, sin superficie (se ve la estructura)
- `"melamina"` → Placa de melamina blanca apoyada sobre las vigas
- `"tablilla300"` → Tablillas galvanizadas (listones paralelos). Cant por piso = viga_cm / 30
- `"tablilla500"` → Tablillas reforzadas (más gruesas, misma distribución)

**Módulos múltiples:**
- 1 tramo = 2 bastidores + (pisos × 2 vigas)
- 1 extensión = 1 bastidor + (pisos × 2 vigas) — comparte un bastidor con el tramo anterior
- Visualmente se ven los módulos lado a lado compartiendo la columna central

**Pisos máximos por altura:**
| Altura | Máx pisos |
|--------|-----------|
| 200cm  | 5 |
| 240cm  | 6 |
| 300cm  | 7 |

**Tablillas por piso:**
| Viga | Tablillas/piso |
|------|---------------|
| 120cm | 4 |
| 150cm | 5 |
| 180cm | 6 |

---

## Cómo actualizar el componente en el sitio

Cuando el componente esté listo, en el sitio de Mundo Estanterías hay una carpeta:
```
app/components/render3d/
  ├── Estanteria3D.jsx    ← REEMPLAZAR con la versión nueva
  ├── PreviewViewer3D.tsx  ← Wrapper (no tocar salvo cambio de API)
  ├── types.ts             ← Interfaz del config (actualizar si cambia el shape)
  └── index.ts             ← Re-exports
```

Solo hay que copiar el `Estanteria3D.jsx` nuevo a esa carpeta.
