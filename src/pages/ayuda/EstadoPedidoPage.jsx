import { Link } from 'react-router-dom'
import InfoPage from '../../components/InfoPage'

export default function EstadoPedidoPage() {
  return (
    <InfoPage
      title="Estado de tu Pedido"
      description="Consulta el estado de tu pedido en Shoes Store: en preparación, en camino o entregado."
      canonicalPath="ayuda/estado-pedido"
    >
      <p>
        Una vez confirmado tu pago, tu pedido pasa por tres etapas: <strong>en preparación</strong> (empacamos tu
        pedido en nuestra bodega), <strong>en camino</strong> (la transportadora lo tiene en ruta) y{' '}
        <strong>entregado</strong>.
      </p>
      <h2>¿Dónde veo el estado?</h2>
      <p>
        Si iniciaste sesión antes de comprar, revisa la sección "Mis Pedidos" en tu{' '}
        <Link to="/perfil">perfil</Link>. Ahí verás el número de guía y la fecha estimada de entrega.
      </p>
      <h2>¿Tu pedido está demorado?</h2>
      <p>
        Los tiempos estimados son de 2 a 5 días hábiles en ciudades principales y de 5 a 8 días hábiles en el resto
        del país. Si tu pedido supera ese rango, escríbenos a <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>{' '}
        con tu número de orden.
      </p>
    </InfoPage>
  )
}
