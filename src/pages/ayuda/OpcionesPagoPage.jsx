import InfoPage from '../../components/InfoPage'

export default function OpcionesPagoPage() {
  return (
    <InfoPage
      title="Opciones de Pago"
      description="Métodos de pago disponibles en Shoes Store: tarjetas, PSE y contraentrega."
      canonicalPath="ayuda/pago"
    >
      <h2>Métodos disponibles</h2>
      <ul>
        <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express).</li>
        <li>PSE — débito directo desde tu cuenta bancaria.</li>
        <li>Pago contraentrega, disponible en ciudades principales.</li>
      </ul>
      <h2>Seguridad</h2>
      <p>
        Todas las transacciones se procesan de forma cifrada. Shoes Store no almacena los datos completos de tu
        tarjeta.
      </p>
    </InfoPage>
  )
}
