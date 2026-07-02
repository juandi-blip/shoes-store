import ProductCard from './ProductCard'

/**
 * Grilla de productos. Muestra un mensaje cuando no hay resultados.
 * La clase del contenedor es configurable para reutilizar la grilla en el
 * home (.product-grid) y en el catálogo (.catalog-grid).
 * @param {{productos: Array<object>, className?: string}} props
 */
export default function ProductGrid({ productos, className = 'catalog-grid' }) {
  if (productos.length === 0) {
    return <p className="catalog-empty">No se encontraron productos con estos filtros.</p>
  }
  return (
    <div className={className}>
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
