import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/variables.css'
import './styles/tienda1.css'
import './styles/catalogo.css'
import './styles/producto-detalle.css'
import './styles/inicioRegistro.css'
import './styles/carrito.css'
import './styles/glamour.css' // capa de elevación visual, siempre al final para ganar la cascada

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
