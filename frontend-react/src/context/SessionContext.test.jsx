import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SessionProvider, useSession, validarCredenciales } from './SessionContext'

describe('validarCredenciales', () => {
  it('acepta el usuario mock correcto', () => {
    expect(validarCredenciales('admin', 'shoes2026')).toBe(true)
  })

  it('rechaza credenciales incorrectas', () => {
    expect(validarCredenciales('admin', 'wrong')).toBe(false)
  })
})

describe('useSession', () => {
  function wrapper({ children }) {
    return <SessionProvider>{children}</SessionProvider>
  }

  it('inicia sin sesión activa', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    expect(result.current.usuario).toBeNull()
  })

  it('inicia sesión con credenciales válidas', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => {
      const ok = result.current.iniciarSesion('admin', 'shoes2026')
      expect(ok).toBe(true)
    })
    expect(result.current.usuario).toBe('admin')
  })

  it('no inicia sesión con credenciales inválidas', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => {
      const ok = result.current.iniciarSesion('admin', 'wrong')
      expect(ok).toBe(false)
    })
    expect(result.current.usuario).toBeNull()
  })

  it('cierra sesión', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => { result.current.iniciarSesion('admin', 'shoes2026') })
    act(() => { result.current.cerrarSesion() })
    expect(result.current.usuario).toBeNull()
  })
})
