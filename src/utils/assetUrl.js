/**
 * Resuelve una ruta de `public/` respetando el `base` configurado en Vite.
 *
 * GitHub Pages sirve este repo bajo /shoes-store/ (project page), no en la
 * raíz del dominio, así que un `src="/assets/brands/nike.svg"` escrito a
 * mano en JS quedaría apuntando a la raíz real del dominio y 404earía.
 * Vite reescribe automáticamente las rutas de `index.html`, pero NO las
 * que viven dentro de JSX/JS — hay que prefijarlas a mano con BASE_URL.
 *
 * @param {string} path Ruta dentro de `public/`, con o sin `/` inicial.
 * @returns {string}
 */
export function assetUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
