import InfoPage from '../components/InfoPage'

export default function ContactoPage() {
  return (
    <InfoPage
      title="Contáctanos"
      description="Escríbenos, llámanos o visítanos. Datos de contacto de Shoes Store."
      canonicalPath="contacto"
    >
      <h2>Escríbenos</h2>
      <p>
        Correo: <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>
        <br />
        Teléfono: <a href="tel:+576017432891">+57 601 743 2891</a>
        <br />
        WhatsApp: <a href="tel:+573004528890">+57 300 452 8890</a>
      </p>
      <h2>Horario de atención</h2>
      <p>Lunes a sábado, 9:00 a.m. – 7:00 p.m.</p>
      <h2>Sede principal</h2>
      <p>Carrera 11 #93-45, Chapinero, Bogotá D.C., Colombia.</p>
    </InfoPage>
  )
}
