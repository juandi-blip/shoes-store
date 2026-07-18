import InfoPage from '../../components/InfoPage'

export default function SostenibilidadPage() {
  return (
    <InfoPage
      title="Sostenibilidad"
      description="Iniciativas de sostenibilidad de Shoes Store: empaques responsables y reciclaje."
      canonicalPath="nosotros/sostenibilidad"
    >
      <h2>Empaques responsables</h2>
      <p>
        Nuestras cajas y bolsas de envío usan cartón y papel reciclado, sin plásticos de un solo uso innecesarios.
      </p>
      <h2>Programa de reciclaje</h2>
      <p>
        Trae tus tenis usados a cualquiera de nuestras tiendas físicas y te damos un descuento en tu próxima
        compra. Los tenis recolectados se donan o se reciclan según su estado.
      </p>
      <h2>Marcas responsables</h2>
      <p>
        Priorizamos trabajar con marcas que reportan avances concretos en materiales reciclados y reducción de
        huella de carbono en su producción.
      </p>
    </InfoPage>
  )
}
