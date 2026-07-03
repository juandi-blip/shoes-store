import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'

// Code-splitting por ruta: cada página secundaria se descarga solo al visitarla.
// El home queda en el bundle inicial (es la landing y define el LCP).
const CatalogoPage = lazy(() => import('./pages/CatalogoPage'))
const ProductoDetallePage = lazy(() => import('./pages/ProductoDetallePage'))
const CarritoPage = lazy(() => import('./pages/CarritoPage'))
const PagoPage = lazy(() => import('./pages/PagoPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegistroPage = lazy(() => import('./pages/RegistroPage'))
const PerfilPage = lazy(() => import('./pages/PerfilPage'))

/**
 * Layout de la tienda (header + footer). Las páginas de login/registro/perfil
 * quedan fuera de este layout: en el sitio original inicio.html, registro.html
 * y perfil.html son páginas standalone sin header ni footer.
 */
function StoreLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

/**
 * Componente raíz: enrutamiento, proveedor de sesión, layout compartido.
 * Proyecto SENA GA7-220501096-AA4-EV03 - Evidencia de aprendizaje.
 */
function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app">
            <Suspense fallback={null}>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogo" element={<CatalogoPage />} />
                  <Route path="/producto/:id" element={<ProductoDetallePage />} />
                  <Route path="/carrito" element={<CarritoPage />} />
                  <Route path="/pago" element={<PagoPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </CartProvider>
    </SessionProvider>
  )
}

export default App
