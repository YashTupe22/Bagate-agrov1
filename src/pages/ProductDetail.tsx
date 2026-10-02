import { useEffect, useState } from "react"
import type { Product } from "../services/types"
import { getProduct, getProducts } from "../services/products"
import ProductCard from "../components/ProductCard"
import Icon from "../components/Icon"
import { useCart } from "../context/CartContext"

export default function ProductDetail({
  id,
  navigate,
  openCart,
}: {
  id: number
  navigate: (path: string) => void
  openCart: () => void
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const { lines, setQuantity, addProduct } = useCart()

  const cartLine = lines.find((l) => l.product.id === id)
  const inCart = cartLine?.quantity ?? 0

  useEffect(() => {
    setLoading(true)
    setQty(1)
    getProduct(id).then((p) => {
      setProduct(p)
      setLoading(false)
    })
    getProducts().then((all) =>
      setRelated(all.filter((p) => p.id !== id).slice(0, 4)),
    )
  }, [id])

  if (loading) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="refresh" size={28} />
          <h3>Loading product...</h3>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="box" size={28} />
          <h3>Product not found</h3>
          <p>This item may be out of season or no longer listed.</p>
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Back to shop
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="product-detail section-shell page-pad">
      <button className="breadcrumb" onClick={() => navigate("/shop")}>
        <Icon name="arrow" size={14} /> Shop / {product.category}
      </button>
      <div className="detail-grid">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
          <span className="fresh-pill">
            <span />
            {product.tag}
          </span>
        </div>
        <div className="detail-copy">
          <span className="kicker">{product.category.toUpperCase()}</span>
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span className="unit-chip">{product.unit}</span>
            <span className="stock-chip">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
            <span className="origin-chip">
              <Icon name="leaf" size={14} /> {product.origin}
            </span>
          </div>
          <div className="detail-price">
            <strong>₹{product.price}</strong>
            <small>inclusive of all taxes</small>
          </div>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-buy">
            {inCart === 0 ? (
              <>
                <div className="stepper lg">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease"
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} aria-label="Increase">
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (product) {
                      const current =
                        lines.find((l) => l.product.id === product.id)
                          ?.quantity ?? 0
                      setQuantity(product.id, current + qty, product)
                    }
                  }}
                >
                  Add to cart <Icon name="bag" />
                </button>
              </>
            ) : (
              <>
                <div className="stepper lg">
                  <button
                    onClick={() => setQuantity(product.id, inCart - 1)}
                    aria-label="Decrease"
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{inCart}</span>
                  <button
                    onClick={() => setQuantity(product.id, inCart + 1)}
                    aria-label="Increase"
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button className="primary-button" onClick={openCart}>
                  View cart <Icon name="arrow" />
                </button>
              </>
            )}
          </div>
          <ul className="detail-perks">
            <li>
              <Icon name="truck" size={16} /> 30–45 min delivery within 2 km
            </li>
            <li>
              <Icon name="shield" size={16} /> Quality checked before packing
            </li>
            <li>
              <Icon name="refresh" size={16} /> Easy replacement if unsatisfied
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <div>
              <span className="kicker">YOU MAY ALSO LIKE</span>
              <h2>Related fresh picks</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => navigate(`/product/${p.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
