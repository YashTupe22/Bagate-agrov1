import type { Product } from "../services/types"
import { useCart } from "../context/CartContext"
import Icon from "./Icon"

export default function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: () => void
}) {
  const { lines, setQuantity, addProduct } = useCart()
  const line = lines.find((l) => l.product.id === product.id)
  const quantity = line?.quantity ?? 0

  return (
    <article className="product-card">
      <div className="product-image" onClick={onOpen}>
        <img src={product.image} alt={product.name} />
        <span className="fresh-pill">
          <span />
          {product.tag}
        </span>
        <button
          className="quick-view"
          aria-label={`View ${product.name}`}
          onClick={onOpen}
        >
          <Icon name="arrow" />
        </button>
      </div>
      <div className="product-copy">
        <p className="product-unit">{product.unit}</p>
        <h3 onClick={onOpen} style={{ cursor: "pointer" }}>
          {product.name}
        </h3>
        <div className="product-buy">
          <strong>₹{product.price}</strong>
          {quantity === 0 ? (
            <button className="add-button" onClick={() => addProduct(product)}>
              Add <Icon name="plus" size={17} />
            </button>
          ) : (
            <div className="stepper">
              <button
                aria-label="Remove one"
                onClick={() => setQuantity(product.id, quantity - 1)}
              >
                <Icon name="minus" size={15} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Add one"
                onClick={() => setQuantity(product.id, quantity + 1)}
              >
                <Icon name="plus" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
