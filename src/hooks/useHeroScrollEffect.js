import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let scrollTriggerRegistered = false

/** ¿El usuario prefiere reducir el movimiento? (mismo criterio que ProductCard.jsx) */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anima el stack de sneakers del hero: zoom (scale 1.25 → 1.0) ligado al
 * scroll, con crossfade secuencial entre las imágenes apiladas dentro de
 * `stackRef` (la 1 se desvanece mientras entra la 2, y así hasta la
 * última). Agrega `is-revealed` a `contentRef` cuando el scroll llega al
 * final del wrapper. Si el usuario prefiere menos movimiento, se omite
 * la animación: se deja visible solo la última imagen y el contenido se
 * revela de inmediato.
 *
 * @param {import('react').RefObject<HTMLElement>} wrapperRef
 * @param {import('react').RefObject<HTMLElement>} stackRef
 * @param {import('react').RefObject<HTMLElement>} contentRef
 */
export function useHeroScrollEffect(wrapperRef, stackRef, contentRef) {
  useEffect(() => {
    if (!wrapperRef.current || !stackRef.current || !contentRef.current) return

    const imgs = stackRef.current.children

    if (prefiereMenosMovimiento()) {
      gsap.set(imgs, { opacity: 0 })
      gsap.set(imgs[imgs.length - 1], { opacity: 1 })
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
      tl.fromTo(stackRef.current, { scale: 1.25 }, { scale: 1, ease: 'power2.out', duration: 1 }, 0)
      for (let i = 1; i < imgs.length; i++) {
        tl.to(imgs[i - 1], { opacity: 0, ease: 'none', duration: 1 }, i - 1)
        tl.to(imgs[i], { opacity: 1, ease: 'none', duration: 1 }, i - 1)
      }
      tl.call(() => contentRef.current.classList.add('is-revealed'))
    }, wrapperRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
