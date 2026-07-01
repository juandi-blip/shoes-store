import ProductCard from './ProductCard'

/**
 * Grilla de productos. Muestra un mensaje cuando no hay resultados.
 * @param {{productos: Array<object>}} props
 */
export default function ProductGrid({ productos }) {
  if (productos.length === 0) {
    return <p className="catalog-empty">No se encontraron productos con estos filtros.</p>
  }
  return (
    <div className="catalog-grid">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
