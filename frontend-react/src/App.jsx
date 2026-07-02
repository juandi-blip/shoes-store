import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CatalogoPage from './pages/CatalogoPage'
import ProductoDetallePage from './pages/ProductoDetallePage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import PerfilPage from './pages/PerfilPage'

/**
 * Componente raíz: enrutamiento, proveedor de sesión, layout compartido.
 * Proyecto SENA GA7-220501096-AA4-EV03 - Evidencia de aprendizaje.
 */
function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:id" element={<ProductoDetallePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </SessionProvider>
  )
}

export default App
