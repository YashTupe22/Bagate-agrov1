import { useEffect, useState } from "react"
import type { Product } from "../services/types"
import { searchProducts } from "../services/products"
import ProductCard from "../components/ProductCard"
import Icon from "../components/Icon"

export default function SearchResults({
  q,
  navigate,
}: {
  q: string
  navigate: (path: string) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState(q)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setQuery(q)
    setLoading(true)
    searchProducts(q).then((results) => {
      setProducts(results)
      setLoading(false)
    })
  }, [q])

  return (
    <main className="search-page section-shell">
      <div className="shop-intro">
        <span className="kicker">SEARCH RESULTS</span>
        <h1>{q ? `Results for “${q}”` : "Search vegetables"}</h1>
        <p>
          {loading
            ? "Searching our fresh stock..."
            : `${products.length} item${
                products.length === 1 ? "" : "s"
              } found`}
        </p>
      </div>
      <form
        className="search-page-bar"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(`/search?q=${encodeURIComponent(query)}`)
        }}
      >
        <label className="search-box">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tomatoes, spinach, baskets..."
          />
        </label>
        <button className="primary-button" type="submit">
          Search <Icon name="arrow" />
        </button>
      </form>
      {!loading && (
        <div className="product-grid shop-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <h3>Nothing matched that search</h3>
          <p>Try “tomato”, “spinach”, “basket”, or browse the full shop.</p>
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Browse all vegetables
          </button>
        </div>
      )}
    </main>
  )
}
