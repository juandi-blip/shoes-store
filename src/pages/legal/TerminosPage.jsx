import InfoPage from '../../components/InfoPage'

export default function TerminosPage() {
  return (
    <InfoPage
      title="Términos de Uso"
      description="Términos y condiciones de uso del sitio Shoes Store."
      canonicalPath="legal/terminos"
    >
      <p>
        Al usar este sitio aceptas estos términos. Shoes Store se reserva el derecho de actualizar precios,
        disponibilidad de productos y condiciones de envío sin previo aviso.
      </p>
      <h2>Cuentas de usuario</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu
        cuenta.
      </p>
      <h2>Compras</h2>
      <p>
        Los precios se muestran en pesos colombianos (COP) e incluyen los impuestos aplicables. Una compra se
        confirma únicamente tras la aprobación del pago.
      </p>
    </InfoPage>
  )
}
