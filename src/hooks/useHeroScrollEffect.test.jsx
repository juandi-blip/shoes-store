import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRef } from 'react'
import { useHeroScrollEffect } from './useHeroScrollEffect'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function mockMatchMedia(prefiereMenosMovimiento) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: prefiereMenosMovimiento,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function HeroDeTest() {
  const wrapperRef = useRef(null)
  const stackRef = useRef(null)
  const contentRef = useRef(null)
  useHeroScrollEffect(wrapperRef, stackRef, contentRef)
  return (
    <div ref={wrapperRef}>
      <div ref={stackRef}>
        <img alt="" data-testid="img-0" />
        <img data-testid="img-1" />
        <img data-testid="img-2" />
      </div>
      <div ref={contentRef} data-testid="content" />
    </div>
  )
}

describe('useHeroScrollEffect', () => {
  it('no explota al montar y desmontar con movimiento normal', () => {
    mockMatchMedia(false)
    const { unmount } = render(<HeroDeTest />)
    expect(() => unmount()).not.toThrow()
  })

  it('revela el contenido de inmediato si el usuario prefiere menos movimiento', () => {
    mockMatchMedia(true)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('content')).toHaveClass('is-revealed')
  })

  it('con movimiento reducido deja solo la última imagen visible', () => {
    mockMatchMedia(true)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('img-0')).toHaveStyle({ opacity: '0' })
    expect(getByTestId('img-1')).toHaveStyle({ opacity: '0' })
    expect(getByTestId('img-2')).toHaveStyle({ opacity: '1' })
  })

  it('no agrega is-revealed de inmediato con movimiento normal (la anima GSAP/scroll)', () => {
    mockMatchMedia(false)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('content')).not.toHaveClass('is-revealed')
  })
})
