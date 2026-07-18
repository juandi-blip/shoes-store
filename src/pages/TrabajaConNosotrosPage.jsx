import InfoPage from '../components/InfoPage'

export default function TrabajaConNosotrosPage() {
  return (
    <InfoPage
      title="Trabaja con Nosotros"
      description="Únete al equipo de Shoes Store. Vacantes y cómo postularte."
      canonicalPath="trabaja-con-nosotros"
    >
      <p>
        Estamos siempre buscando gente apasionada por la cultura sneaker y el buen servicio al cliente, para
        nuestras tiendas físicas y nuestro equipo digital.
      </p>
      <h2>¿Cómo postularte?</h2>
      <p>
        Envía tu hoja de vida a <a href="mailto:empleo@shoesstore.com.co">empleo@shoesstore.com.co</a> contándonos
        en qué área te gustaría trabajar (tienda, logística, marketing o tecnología). Si hay una vacante afín, te
        contactamos.
      </p>
    </InfoPage>
  )
}
