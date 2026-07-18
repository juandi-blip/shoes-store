import InfoPage from '../components/InfoPage'

export default function AppPage() {
  return (
    <InfoPage
      title="Shoes Store App"
      description="La app móvil de Shoes Store: novedades, seguimiento de pedidos y ofertas exclusivas."
      canonicalPath="app"
    >
      <p>Estamos construyendo la app móvil de Shoes Store, con:</p>
      <ul>
        <li>Notificaciones de nuevos lanzamientos antes que nadie.</li>
        <li>Seguimiento de tus pedidos en tiempo real.</li>
        <li>Ofertas exclusivas para usuarios de la app.</li>
      </ul>
      <p>Déjanos tu correo en nuestro newsletter para avisarte apenas esté disponible.</p>
    </InfoPage>
  )
}
