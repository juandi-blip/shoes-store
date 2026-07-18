import InfoPage from '../components/InfoPage'

export default function TiendasPage() {
  return (
    <InfoPage
      title="Tiendas Físicas"
      description="Encuentra la tienda Shoes Store más cercana en Bogotá y Medellín."
      canonicalPath="tiendas"
    >
      <h2>Bogotá</h2>
      <p>
        Carrera 11 #93-45, Chapinero.
        <br />
        Lunes a sábado, 9:00 a.m. – 7:00 p.m.
      </p>
      <h2>Medellín</h2>
      <p>
        Centro Comercial Santafé, Local 214.
        <br />
        Lunes a sábado, 9:00 a.m. – 7:00 p.m.
      </p>
    </InfoPage>
  )
}
