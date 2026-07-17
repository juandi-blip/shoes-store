# Fase 1: bugs y lógica de negocio — Shoes'sStore 2.0

## Contexto

Se realizó una auditoría integral del frontend React (arquitectura, performance, responsive/CSS, lógica de negocio, testing, accesibilidad, SEO) sobre el estado actual del proyecto (migración React completada, ver `docs/superpowers/specs/2026-06-30-frontend-react-migration-design.md`). El usuario definió como prioridad las cuatro áreas (bugs/lógica, performance, accesibilidad/responsive, SEO/testing) organizadas en **fases secuenciales**, empezando por bugs y lógica de negocio.

Este documento cubre únicamente la **Fase 1**. Las fases siguientes (performance; accesibilidad/responsive; SEO/testing) se diseñarán y planearán por separado, una vez esta fase esté implementada y verificada.

## Hallazgos de la auditoría que motivan esta fase

De los hallazgos originales bajo "Lógica de negocio" y "Arquitectura", se verificó cada uno leyendo el código actual. Confirmados:

1. **Duplicación de reglas de precio/envío** — `src/pages/CarritoPage.jsx:5-6,17-18` y `src/pages/PagoPage.jsx:5,37-38` redefinen independientemente `TASA_COP = 4200`, el umbral de envío gratis (`200000` / `ENVIO_GRATIS_DESDE_COP`) y el costo de envío fijo (`15000`). No hay una única fuente de verdad: un cambio en un archivo no se refleja en el otro.
2. **Sin guardia de doble-submit** — `src/pages/PagoPage.jsx:56-69` (`pagar()`) no previene que un doble clic antes del re-render dispare `vaciarCarrito()` y genere dos números de orden simulados.

Descartado tras verificación (falso positivo): "PerfilPage accesible sin sesión real" — `src/pages/PerfilPage.jsx:13-15` ya redirige a `/login` cuando `usuario` es `null`. No requiere cambio.

## Objetivo

Eliminar la duplicación de constantes/lógica de negocio entre `CarritoPage` y `PagoPage`, y prevenir el doble-submit en el flujo de pago, sin alterar el comportamiento ni la UX visibles para el usuario.

## Decisiones

- **Extracción a utilidad pura**: nuevo módulo `src/utils/pricing.js`, sin estado ni dependencias de React — mismo patrón que las funciones puras ya existentes en `src/hooks/useProductos.js`.
- **API del módulo**:
  - `TASA_COP` (constante, `4200`)
  - `ENVIO_GRATIS_DESDE_COP` (constante, `200000`)
  - `COSTO_ENVIO_COP` (constante, `15000`)
  - `calcularEnvioCOP(totalCOP, cantidadLineas)` — función pura que devuelve el costo de envío en COP aplicando las mismas reglas que hoy (gratis si `totalCOP >= ENVIO_GRATIS_DESDE_COP` o si `cantidadLineas === 0`; si no, `COSTO_ENVIO_COP`).
- **Sin cambio de UX**: mismos mensajes, mismo flujo de pago, mismos montos mostrados. Es una corrección interna (single source of truth), no una feature nueva.
- **Guardia de doble-submit**: nuevo estado local `enviando` (boolean) en `PagoPage`. `pagar()` retorna temprano si `enviando` es `true`; se activa al iniciar el submit y el botón queda `disabled` mientras tanto (se resetea solo si hay error de validación, ya que en éxito la página cambia a la vista de confirmación).
- **No se toca** `CartContext.jsx` en esta fase (el re-render excesivo del `value` del provider es un hallazgo de *performance*, corresponde a la Fase 2), aunque comparte archivo temático con `CarritoPage`/`PagoPage`.

## Arquitectura

```
src/
├── utils/
│   ├── pricing.js       # nuevo: constantes + calcularEnvioCOP()
│   └── pricing.test.js  # nuevo: casos umbral (por debajo/igual/encima), carrito vacío
├── pages/
│   ├── CarritoPage.jsx  # importa de utils/pricing.js en vez de redefinir constantes
│   └── PagoPage.jsx     # importa de utils/pricing.js; agrega estado `enviando`
```

### Flujo de datos

Sin cambios en el flujo general (`CartContext` → `CarritoPage`/`PagoPage` vía `useCart()`). El único cambio es de dónde vienen las constantes de negocio: antes definidas localmente en cada página, ahora importadas de `utils/pricing.js`.

### Manejo de errores

Sin cambios visibles. La validación de formulario de pago (`validar()`) permanece igual. El guardia de doble-submit no introduce mensajes de error nuevos — simplemente ignora submits repetidos mientras uno está en curso.

### Testing

- `src/utils/pricing.test.js`: prueba `calcularEnvioCOP` para total por debajo del umbral, total igual al umbral, total por encima del umbral, y carrito vacío (0 líneas) — cubre la lógica que hoy no tiene ningún test.
- Los tests existentes de `CartContext`, `SessionContext` y `useProductos` no deberían verse afectados (no se tocan esos módulos).

## Fuera de alcance (queda para fases posteriores)

- Performance: memoización del `value` de `CartContext`, memoización rota en `CatalogoPage` (Fase 2).
- Accesibilidad/responsive: mega-menú por teclado, botón de búsqueda sin handler, breakpoints inconsistentes (Fase 3).
- SEO/testing ampliado: meta tags por producto, cobertura de tests en páginas/componentes (Fase 4).
