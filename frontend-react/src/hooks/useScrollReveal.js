import { useEffect } from 'react'

/**
 * Reproduce la animación de aparición al hacer scroll del sitio original
 * (js/home.js): agrega la clase `is-visible` a cada elemento `.fade-in`
 * cuando entra en el viewport. Sin esto, los elementos `.fade-in` quedan
 * en `opacity: 0` y no se ven.
 *
 * @param {Array<any>} deps Dependencias que, al cambiar, re-escanean el DOM
 *   en busca de nuevos elementos `.fade-in` (p. ej. cuando llegan productos).
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const elementos = document.querySelectorAll('.fade-in:not(.is-visible)')

    // Navegadores sin IntersectionObserver: mostrar todo de una vez.
    if (!('IntersectionObserver' in window)) {
      elementos.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    elementos.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
