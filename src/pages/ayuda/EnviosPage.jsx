import InfoPage from '../../components/InfoPage'

export default function EnviosPage() {
  return (
    <InfoPage
      title="Envíos y Entregas"
      description="Tiempos, costos y cobertura de envío de Shoes Store en Colombia."
      canonicalPath="ayuda/envios"
    >
      <h2>Cobertura</h2>
      <p>Enviamos a todo el territorio nacional a través de transportadoras aliadas.</p>
      <h2>Tiempos estimados</h2>
      <ul>
        <li>Bogotá, Medellín, Cali y Barranquilla: 2 a 5 días hábiles.</li>
        <li>Resto del país: 5 a 8 días hábiles.</li>
        <li>Zonas rurales o de difícil acceso: hasta 10 días hábiles.</li>
      </ul>
      <h2>Costos</h2>
      <p>
        El envío es gratuito en compras superiores a $250.000 COP. Para el resto de compras, el costo se calcula
        según destino y se muestra antes de confirmar el pago.
      </p>
    </InfoPage>
  )
}
