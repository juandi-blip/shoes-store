import InfoPage from '../../components/InfoPage'

export default function PrivacidadPage() {
  return (
    <InfoPage
      title="Política de Privacidad"
      description="Cómo Shoes Store recopila, usa y protege tus datos personales."
      canonicalPath="legal/privacidad"
    >
      <h2>Qué datos recopilamos</h2>
      <p>
        Nombre, correo, dirección de envío y datos de contacto que nos das al crear una cuenta o al completar una
        compra.
      </p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Procesar y enviar tus pedidos.</li>
        <li>Comunicarnos contigo sobre el estado de tu compra.</li>
        <li>Enviarte novedades, solo si te suscribes al newsletter.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar la actualización o eliminación de tus datos escribiendo a{' '}
        <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>.
      </p>
    </InfoPage>
  )
}
