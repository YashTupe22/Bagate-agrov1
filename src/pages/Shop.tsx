import { useEffect, useMemo, useState } from "react"
import type { Product } from "../services/types"
import { getProducts } from "../services/products"
import ProductCard from "../components/ProductCard"
import Icon from "../components/Icon"

export default function Shop({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(
    () =>
      new URLSearchParams(window.location.search).get("category") ??
      "All fresh produce",
  )

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  const categories = useMemo(
    () => ["All fresh produce", ...new Set(products.map((p) => p.category))],
    [products],
  )

  useEffect(() => {
    if (products.length > 0 && !categories.includes(category)) {
      setCategory("All fresh produce")
    }
  }, [products, categories, category])

  const filtered = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchCategory =
      category === "All fresh produce" || product.category === category
    return matchSearch && matchCategory
  })

  return (
    <main className="shop-page section-shell">
      <div className="shop-intro">
        <span className="kicker">FRESH FROM THE FARM</span>
        <h1>Shop vegetables</h1>
        <p>Everything available today, picked and packed for local delivery.</p>
      </div>
      <div className="catalog-toolbar">
        <label className="search-box">
          <Icon name="search" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tomatoes, spinach..."
          />
        </label>
        <button
          className="filter-button"
          onClick={() => navigate(`/search?q=${encodeURIComponent(search)}`)}
        >
          Search all <Icon name="chevron" size={16} />
        </button>
        <button className="filter-button">
          Available today <Icon name="chevron" size={16} />
        </button>
      </div>
      <div className="catalog-layout">
        <aside className="filter-panel">
          <strong>Categories</strong>
          {categories.map((item, index) => (
            <button
              className={category === item ? "selected" : ""}
              key={item}
              onClick={() => setCategory(item)}
            >
              <span>{item}</span>
              <small>
                {index === 0
                  ? products.length
                  : products.filter((p) => p.category === item).length}
              </small>
            </button>
          ))}
          <div className="filter-note">
            <Icon name="location" />
            <p>
              <strong>Local delivery only</strong>
              <small>We currently deliver within 2 km of our store.</small>
            </p>
          </div>
        </aside>
        <div>
          <div className="results-label">
            <span>{filtered.length} fresh items</span>
            <small>Stock updated 8 minutes ago</small>
          </div>
          <div className="product-grid shop-grid">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="search" size={28} />
              <h3>No products found</h3>
              <p>Try a different search or browse the full catalogue.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setSearch("")
                  setCategory("All fresh produce")
                }}
              >
                Show all products
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
