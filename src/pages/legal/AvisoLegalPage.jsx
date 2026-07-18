import InfoPage from '../../components/InfoPage'

export default function AvisoLegalPage() {
  return (
    <InfoPage
      title="Aviso Legal"
      description="Aviso legal del sitio Shoes Store."
      canonicalPath="legal/aviso-legal"
    >
      <p>
        Shoes Store es un proyecto académico desarrollado como evidencia de aprendizaje del SENA
        (GA7-220501096-AA4-EV03). El catálogo, precios e imágenes de este sitio son de carácter demostrativo y no
        corresponden a una operación comercial real.
      </p>
      <h2>Marcas mencionadas</h2>
      <p>
        Nike, Adidas, Jordan, Puma, New Balance, Vans, Converse y Hoka se mencionan únicamente con fines
        ilustrativos; sus marcas y logotipos pertenecen a sus respectivos titulares.
      </p>
    </InfoPage>
  )
}
