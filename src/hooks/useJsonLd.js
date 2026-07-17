import { useEffect } from 'react'

const SCRIPT_ID = 'jsonld-producto'

/**
 * Inyecta/actualiza un <script type="application/ld+json"> en <head> con
 * los datos estructurados dados. Si `data` es null, no hace nada (permite
 * llamarlo siempre en el mismo orden de hooks aunque el producto aún no
 * se haya resuelto).
 * @param {object|null} data
 */
export function useJsonLd(data) {
  useEffect(() => {
    if (!data) return
    let script = document.getElementById(SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = SCRIPT_ID
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
  }, [data])
}
