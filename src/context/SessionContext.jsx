import { createContext, useContext, useState } from 'react'

/**
 * Valida las credenciales mock (sin backend), igual que js/login.js.
 * @param {string} usuario
 * @param {string} clave
 * @returns {boolean}
 */
export function validarCredenciales(usuario, clave) {
  return usuario === 'admin' && clave === 'shoes2026'
}

const SessionContext = createContext(null)

/**
 * Provee el estado de sesión mock (usuario autenticado o null) a la app.
 */
export function SessionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  function iniciarSesion(usuarioInput, clave) {
    const valido = validarCredenciales(usuarioInput, clave)
    if (valido) setUsuario(usuarioInput)
    return valido
  }

  function cerrarSesion() {
    setUsuario(null)
  }

  return (
    <SessionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Hook de acceso a la sesión mock actual.
 * @returns {{usuario: string|null, iniciarSesion: Function, cerrarSesion: Function}}
 */
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}
