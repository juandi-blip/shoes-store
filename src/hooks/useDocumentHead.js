import { useEffect } from 'react'

const SITE_URL = 'https://juandi-blip.github.io/shoes-store'

function setMetaTag(selector, attrName, attrValue, content) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonicalLink(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Actualiza título, meta description, Open Graph, Twitter Card y canonical
 * del documento para la ruta actual. Sin cleanup: la siguiente ruta que
 * monte sobreescribe los mismos tags, sin dejar restos entre navegaciones.
 * @param {{title: string, description: string, ogImage?: string, canonicalPath: string}} params
 */
export function useDocumentHead({ title, description, ogImage, canonicalPath }) {
  useEffect(() => {
    document.title = title

    const canonicalUrl = `${SITE_URL}/${canonicalPath}`.replace(/\/$/, '') || SITE_URL

    setMetaTag('meta[name="description"]', 'name', 'description', description)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage)
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    }

    setCanonicalLink(canonicalUrl)
  }, [title, description, ogImage, canonicalPath])
}
