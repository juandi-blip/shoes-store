import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let scrollTriggerRegistered = false

/** ¿El usuario prefiere reducir el movimiento? (mismo criterio que ProductCard.jsx) */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anima la imagen del hero (scale 1.25 → 1.0) ligada al scroll dentro de
 * `wrapperRef`, y agrega `is-revealed` a `contentRef` cuando el scroll
 * llega al final del wrapper. Técnica adaptada de la landing de GTA VI
 * (GSAP + ScrollTrigger con scrub). Si el usuario prefiere menos
 * movimiento, se omite la animación y el contenido se revela de inmediato.
 *
 * @param {import('react').RefObject<HTMLElement>} wrapperRef
 * @param {import('react').RefObject<HTMLElement>} imgRef
 * @param {import('react').RefObject<HTMLElement>} contentRef
 */
export function useHeroScrollEffect(wrapperRef, imgRef, contentRef) {
  useEffect(() => {
    if (!wrapperRef.current || !imgRef.current || !contentRef.current) return

    if (prefiereMenosMovimiento()) {
      contentRef.current.classList.add('is-revealed')
      return
    }

    if (!scrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger)
      scrollTriggerRegistered = true
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
      tl.fromTo(
        imgRef.current,
        { scale: 1.25 },
        { scale: 1, ease: 'power2.out', duration: 1 }
      ).call(() => contentRef.current.classList.add('is-revealed'))
    }, wrapperRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
