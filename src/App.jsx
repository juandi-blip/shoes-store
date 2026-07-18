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
const EstadoPedidoPage = lazy(() => import('./pages/ayuda/EstadoPedidoPage'))
const EnviosPage = lazy(() => import('./pages/ayuda/EnviosPage'))
const DevolucionesPage = lazy(() => import('./pages/ayuda/DevolucionesPage'))
const OpcionesPagoPage = lazy(() => import('./pages/ayuda/OpcionesPagoPage'))

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
        {/* basename = BASE_URL de Vite ("/shoes-store/" en build, "/" en dev):
            las rutas del router coinciden con dónde vive realmente el sitio
            (GitHub Pages sirve este repo bajo /shoes-store/, no en la raíz) */}
        <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app">
            <Suspense fallback={null}>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogo" element={<CatalogoPage />} />
                  <Route path="/producto/:id" element={<ProductoDetallePage />} />
                  <Route path="/carrito" element={<CarritoPage />} />
                  <Route path="/pago" element={<PagoPage />} />
                  <Route path="/ayuda/estado-pedido" element={<EstadoPedidoPage />} />
                  <Route path="/ayuda/envios" element={<EnviosPage />} />
                  <Route path="/ayuda/devoluciones" element={<DevolucionesPage />} />
                  <Route path="/ayuda/pago" element={<OpcionesPagoPage />} />
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
