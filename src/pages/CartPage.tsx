import Icon from "../components/Icon"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

export default function CartPage({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const { lines, setQuantity, subtotal, deliveryFee, total, clearCart } =
    useCart()
  const { user } = useAuth()

  const startCheckout = () => {
    if (!user) {
      navigate("/auth?next=/checkout/contact")
      return
    }
    navigate("/checkout/contact")
  }

  return (
    <main className="cart-page section-shell page-pad">
      <div className="shop-intro">
        <span className="kicker">YOUR BASKET</span>
        <h1>Cart</h1>
        <p>
          {lines.length
            ? `${lines.length} product${
                lines.length === 1 ? "" : "s"
              } ready for checkout`
            : "Your basket is empty"}
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="bag" size={30} />
          </span>
          <h3>Your basket is empty</h3>
          <p>Add today&apos;s fresh vegetables and they&apos;ll appear here.</p>
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Start shopping <Icon name="arrow" />
          </button>
        </div>
      ) : (
        <div className="cart-page-layout">
          <div className="cart-page-items">
            {lines.map(({ product, quantity }) => (
              <article className="cart-item card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <div className="cart-item-info">
                  <p className="product-unit">{product.unit}</p>
                  <h3>{product.name}</h3>
                  <span>₹{product.price}</span>
                </div>
                <div className="stepper">
                  <button onClick={() => setQuantity(product.id, quantity - 1)}>
                    <Icon name="minus" size={14} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(product.id, quantity + 1)}>
                    <Icon name="plus" size={14} />
                  </button>
                </div>
                <strong className="line-total">
                  ₹{product.price * quantity}
                </strong>
              </article>
            ))}
            <button className="text-button" onClick={clearCart}>
              Clear cart
            </button>
          </div>
          <aside className="cart-summary card">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</strong>
            </div>
            {subtotal < 299 && (
              <p className="summary-note">
                Add ₹{299 - subtotal} more for free delivery
              </p>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>
            <button className="primary-button full" onClick={startCheckout}>
              {user ? "Continue to checkout" : "Sign in to checkout"}{" "}
              <Icon name="arrow" />
            </button>
            <small className="privacy">
              <Icon name="location" size={14} /> Delivery eligibility checked at
              checkout
            </small>
          </aside>
        </div>
      )}
    </main>
  )
}
