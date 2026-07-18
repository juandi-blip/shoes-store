import { useDocumentHead } from '../hooks/useDocumentHead'

/**
 * Layout compartido por las páginas de contenido estático (Ayuda, Nosotros,
 * Legal): título, metadatos SEO vía useDocumentHead, y un slot de contenido.
 */
export default function InfoPage({ title, description, canonicalPath, children }) {
  useDocumentHead({ title: `${title} — Shoes Store`, description, canonicalPath })

  return (
    <main className="info-page">
      <div className="section-container info-page__container">
        <h1>{title}</h1>
        <div className="info-page__content">{children}</div>
      </div>
    </main>
  )
}
