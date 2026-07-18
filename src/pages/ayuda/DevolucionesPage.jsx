import InfoPage from '../../components/InfoPage'

export default function DevolucionesPage() {
  return (
    <InfoPage
      title="Devoluciones y Cambios"
      description="Política de devoluciones y cambios de Shoes Store: 30 días para cambiar de opinión."
      canonicalPath="ayuda/devoluciones"
    >
      <h2>Plazo</h2>
      <p>Tienes 30 días calendario desde que recibes tu pedido para solicitar un cambio o devolución.</p>
      <h2>Condiciones</h2>
      <ul>
        <li>El producto debe estar sin uso, con su empaque original y etiquetas.</li>
        <li>Debe incluir la factura o comprobante de compra.</li>
        <li>Productos en Outlet marcados como "venta final" no aplican para devolución.</li>
      </ul>
      <h2>¿Cómo lo solicito?</h2>
      <p>
        Escríbenos a <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a> con tu número de
        orden y el motivo. Te confirmamos la recogida o el punto de entrega más cercano.
      </p>
    </InfoPage>
  )
}
