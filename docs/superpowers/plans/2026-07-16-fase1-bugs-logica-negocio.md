# Fase 1: bugs y lógica de negocio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar la duplicación de constantes/lógica de envío-precio entre `CarritoPage` y `PagoPage`, y prevenir el doble-submit en el flujo de pago, sin cambiar el comportamiento visible al usuario.

**Architecture:** Extraer las constantes de negocio (`TASA_COP`, umbral de envío gratis, costo de envío) y la función de cálculo a un módulo puro nuevo `src/utils/pricing.js` (sin estado, sin dependencias de React, mismo patrón que `src/hooks/useProductos.js`). `CarritoPage.jsx` y `PagoPage.jsx` importan de ahí. `PagoPage.jsx` gana un estado `enviando` que bloquea submits repetidos.

**Tech Stack:** React 19, Vite 8, Vitest 4 (jsdom, `globals: true` — no hace falta importar `describe`/`it`/`expect`, pero el estilo del repo ya los importa explícitamente en `useProductos.test.js`, así que seguimos ese estilo por consistencia).

## Global Constraints

- Nombres de variables/funciones en español (consistencia con el resto del proyecto — ver spec de migración React).
- Sin gestor de estado externo ni librerías nuevas.
- No modificar `CartContext.jsx` en esta fase (su refactor de memoización es Fase 2 — performance).
- No cambiar mensajes de UI, montos mostrados, ni el flujo de navegación existentes.
- Comentario JSDoc corto al inicio de cada función/módulo nuevo describiendo su responsabilidad (estándar ya usado en el repo).

---

### Task 1: Módulo de pricing puro con tests

**Files:**
- Create: `src/utils/pricing.js`
- Test: `src/utils/pricing.test.js`

**Interfaces:**
- Consumes: nada (módulo puro, sin dependencias externas).
- Produces:
  - `export const TASA_COP = 4200`
  - `export const ENVIO_GRATIS_DESDE_COP = 200000`
  - `export const COSTO_ENVIO_COP = 15000`
  - `export function calcularEnvioCOP(totalCOP, cantidadLineas)` → `number` (0 si `totalCOP >= ENVIO_GRATIS_DESDE_COP` o si `cantidadLineas === 0`; si no, `COSTO_ENVIO_COP`). Estas firmas las usan las Tasks 2 y 3.

- [ ] **Step 1: Write the failing test**

Crear `src/utils/pricing.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { TASA_COP, ENVIO_GRATIS_DESDE_COP, COSTO_ENVIO_COP, calcularEnvioCOP } from './pricing'

describe('calcularEnvioCOP', () => {
  it('cobra envío cuando el total está por debajo del umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP - 1, 2)).toBe(COSTO_ENVIO_COP)
  })

  it('es gratis cuando el total es exactamente el umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP, 2)).toBe(0)
  })

  it('es gratis cuando el total supera el umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP + 50000, 2)).toBe(0)
  })

  it('es gratis cuando el carrito está vacío, sin importar el total', () => {
    expect(calcularEnvioCOP(0, 0)).toBe(0)
  })
})

describe('constantes', () => {
  it('expone la tasa de conversión y el umbral esperados', () => {
    expect(TASA_COP).toBe(4200)
    expect(ENVIO_GRATIS_DESDE_COP).toBe(200000)
    expect(COSTO_ENVIO_COP).toBe(15000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/utils/pricing.test.js`
Expected: FAIL — `Failed to resolve import "./pricing"` (el archivo `pricing.js` todavía no existe).

- [ ] **Step 3: Write minimal implementation**

Crear `src/utils/pricing.js`:

```javascript
/**
 * Reglas de negocio de precio y envío (mock, sin backend).
 * Única fuente de verdad compartida entre CarritoPage y PagoPage.
 */

export const TASA_COP = 4200
export const ENVIO_GRATIS_DESDE_COP = 200000
export const COSTO_ENVIO_COP = 15000

/** Costo de envío en COP: gratis sobre el umbral o con carrito vacío. */
export function calcularEnvioCOP(totalCOP, cantidadLineas) {
  if (cantidadLineas === 0) return 0
  return totalCOP >= ENVIO_GRATIS_DESDE_COP ? 0 : COSTO_ENVIO_COP
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/utils/pricing.test.js`
Expected: PASS — 5 tests pasando.

- [ ] **Step 5: Commit**

```bash
git add src/utils/pricing.js src/utils/pricing.test.js
git commit -m "feat: extract pricing/shipping rules into src/utils/pricing.js"
```

---

### Task 2: CarritoPage usa el módulo de pricing compartido

**Files:**
- Modify: `src/pages/CarritoPage.jsx:1-18`

**Interfaces:**
- Consumes: `TASA_COP`, `ENVIO_GRATIS_DESDE_COP`, `calcularEnvioCOP` de `../utils/pricing` (Task 1).
- Produces: sin cambios de interfaz pública — `CarritoPage` sigue siendo un default export sin props.

- [ ] **Step 1: Reemplazar las constantes locales por el import compartido**

En `src/pages/CarritoPage.jsx`, reemplazar las líneas 1-18:

```javascript
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { imagenFallback } from '../utils/imagenes'
import { TASA_COP, ENVIO_GRATIS_DESDE_COP, calcularEnvioCOP } from '../utils/pricing'

/**
 * Página del carrito de compras (mock): líneas con imagen, talla, cantidad
 * editable y subtotal; resumen con envío y total; CTA hacia la página de pago.
 */
export default function CarritoPage() {
  const { lineas, totalUnidades, totalPrecio, actualizarCantidad, quitarItem } = useCart()
  const navigate = useNavigate()

  const totalCOP = totalPrecio * TASA_COP
  const envioGratis = totalCOP >= ENVIO_GRATIS_DESDE_COP
  const costoEnvioCOP = calcularEnvioCOP(totalCOP, lineas.length)
```

El resto del archivo (líneas 20 en adelante en la versión original) queda igual: sigue usando `envioGratis`, `costoEnvioCOP`, `totalCOP` y `ENVIO_GRATIS_DESDE_COP` tal como ya lo hacía.

- [ ] **Step 2: Verificar que no queden referencias a las constantes viejas**

Run: `grep -n "TASA_COP\|ENVIO_GRATIS_DESDE_COP" src/pages/CarritoPage.jsx`
Expected: solo aparecen en la línea del `import` y en los usos existentes (`envioGratis`, hint de envío gratis) — ninguna redefinición local (`const TASA_COP = ...` o `const ENVIO_GRATIS_DESDE_COP = ...`) debe quedar en el archivo.

- [ ] **Step 3: Correr los tests existentes para confirmar que nada se rompió**

Run: `pnpm vitest run`
Expected: todos los tests existentes (`CartContext.test.jsx`, `SessionContext.test.jsx`, `useProductos.test.js`, `pricing.test.js`) siguen en PASS. `CarritoPage.jsx` no tiene test propio hoy (fuera de alcance de esta fase, ver spec).

- [ ] **Step 4: Commit**

```bash
git add src/pages/CarritoPage.jsx
git commit -m "refactor: CarritoPage usa src/utils/pricing.js en vez de constantes locales"
```

---

### Task 3: PagoPage usa el módulo de pricing y agrega guardia de doble-submit

**Files:**
- Modify: `src/pages/PagoPage.jsx:1-69`

**Interfaces:**
- Consumes: `TASA_COP`, `calcularEnvioCOP` de `../utils/pricing` (Task 1).
- Produces: sin cambios de interfaz pública — `PagoPage` sigue siendo un default export sin props.

- [ ] **Step 1: Reemplazar la constante local por el import compartido y actualizar el cálculo de envío**

En `src/pages/PagoPage.jsx`, reemplazar la línea 5 (`const TASA_COP = 4200`) por el import, y reemplazar la línea 38 (`const envioCOP = totalCOP >= 200000 || lineas.length === 0 ? 0 : 15000`) por la llamada a `calcularEnvioCOP`:

```javascript
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { TASA_COP, calcularEnvioCOP } from '../utils/pricing'

const BANCOS_PSE = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
  'Banco de Occidente', 'Nequi', 'Daviplata', 'Banco Agrario',
]
```

Y dentro de `PagoPage()`, reemplazar:

```javascript
  const totalCOP = totalPrecio * TASA_COP
  const envioCOP = calcularEnvioCOP(totalCOP, lineas.length)
```

El resto de la función (validación, JSX) queda igual — `envioCOP` se sigue usando exactamente como antes.

- [ ] **Step 2: Agregar el estado `enviando` y la guardia de doble-submit**

Agregar el nuevo estado junto a los demás `useState` (después de `pedidoConfirmado`):

```javascript
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)
  const [enviando, setEnviando] = useState(false)
```

Modificar la función `pagar()` para que ignore submits repetidos y resetee `enviando` solo en el camino de error (en éxito la página cambia a la vista de confirmación, así que no hace falta resetear):

```javascript
  function pagar(e) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    const mensajeError = validar()
    if (mensajeError) {
      setError(mensajeError)
      setEnviando(false)
      return
    }
    // Simulación: genera un número de pedido y limpia todo. Los datos de
    // tarjeta se descartan aquí mismo — nunca se persisten.
    const orden = `SS-${Date.now().toString(36).toUpperCase()}`
    setNumero(''); setTitular(''); setVence(''); setCvv('')
    setPedidoConfirmado(orden)
    vaciarCarrito()
  }
```

- [ ] **Step 3: Deshabilitar el botón de submit mientras `enviando` es `true`**

Ubicar el `<button type="submit" ...>` (línea 222-224 en el archivo original) y agregar el atributo `disabled`:

```javascript
            <button type="submit" className="btn-primary-full pay-submit" disabled={enviando}>
              {metodo === 'contraentrega' ? 'Confirmar pedido' : `Pagar $${(totalCOP + envioCOP).toLocaleString('es-CO')} COP`}
            </button>
```

- [ ] **Step 4: Verificar que no quede la constante local vieja**

Run: `grep -n "const TASA_COP\|totalCOP >= 200000" src/pages/PagoPage.jsx`
Expected: sin coincidencias — la constante y el cálculo inline viejos ya no existen en el archivo.

- [ ] **Step 5: Correr los tests existentes para confirmar que nada se rompió**

Run: `pnpm vitest run`
Expected: todos los tests siguen en PASS (`PagoPage.jsx` no tiene test propio hoy, fuera de alcance de esta fase).

- [ ] **Step 6: Commit**

```bash
git add src/pages/PagoPage.jsx
git commit -m "fix: PagoPage usa src/utils/pricing.js y evita doble-submit"
```

---

### Task 4: Verificación manual del flujo completo

**Files:** ninguno (solo verificación, sin cambios de código).

**Interfaces:** N/A.

- [ ] **Step 1: Levantar el servidor de desarrollo**

Run: `pnpm dev`
Expected: Vite arranca sin errores en `http://localhost:5173/`.

- [ ] **Step 2: Verificar el flujo carrito → pago con envío pagado**

En el navegador: agregar al carrito un producto cuyo subtotal en USD, multiplicado por `4200`, sea menor a `200000` COP (es decir, menor a ~US$47.6). Ir a `/carrito`: debe mostrar "Envío: $15.000 COP" y el hint "Envío gratis en pedidos superiores a $200.000 COP". Ir a `/pago`: el resumen lateral debe mostrar el mismo costo de envío y el mismo total que en el carrito.

Expected: los montos de envío/total coinciden exactamente entre `/carrito` y `/pago` (antes del fix ya coincidían por casualidad al tener los mismos valores hardcodeados dos veces; ahora coinciden porque vienen de la misma función).

- [ ] **Step 3: Verificar el flujo con envío gratis**

Agregar suficientes unidades para que el subtotal en COP supere `200000`. Ir a `/carrito`: debe mostrar "Envío: Gratis" y no debe aparecer el hint. Ir a `/pago`: debe mostrar "Envío: Gratis" también.

Expected: ambas páginas muestran "Gratis" de forma consistente.

- [ ] **Step 4: Verificar la guardia de doble-submit**

En `/pago` con método "Contra entrega" (no requiere validación de formulario), hacer clic en "Confirmar pedido" y observar: el botón debe quedar visualmente deshabilitado inmediatamente, y la página debe navegar a la vista de "¡Pedido confirmado!" con un único número de orden.

Expected: no hay forma de generar dos números de orden desde un mismo submit; el botón se deshabilita al primer clic.

- [ ] **Step 5: Correr la suite completa una última vez**

Run: `pnpm vitest run`
Expected: todos los tests en PASS (incluye los 5 nuevos de `pricing.test.js`).

No hay commit en esta tarea (es solo verificación).
