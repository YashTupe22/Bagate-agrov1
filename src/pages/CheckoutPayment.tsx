import { useEffect, useState } from "react"
import type { CheckoutContact, Order } from "../services/types"
import { createOrder } from "../services/orders"
import Icon from "../components/Icon"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

type Method = "cod" | "upi" | "card"

const methods: {
  id: Method
  title: string
  note: string
  icon: "wallet" | "phone" | "shield"
}[] = [
  {
    id: "upi",
    title: "UPI",
    note: "Pay with any UPI app after order",
    icon: "wallet",
  },
  {
    id: "card",
    title: "Card",
    note: "Credit / debit card (demo)",
    icon: "shield",
  },
  {
    id: "cod",
    title: "Cash on delivery",
    note: "Pay when your order arrives",
    icon: "phone",
  },
]

export default function CheckoutPayment({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const { lines, subtotal, deliveryFee, total, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const [method, setMethod] = useState<Method>("upi")
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState("")
  const [contact, setContact] = useState<CheckoutContact | null>(null)

  useEffect(() => {
    if (authLoading) return
    const raw = sessionStorage.getItem("bagate_checkout_contact")
    if (raw) {
      setContact(JSON.parse(raw) as CheckoutContact)
    } else {
      navigate("/checkout/contact")
      return
    }
    if (!user) {
      navigate("/auth?next=/checkout/payment")
    }
  }, [navigate, user, authLoading])

  if (!contact) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="refresh" size={28} />
          <h3>Loading checkout...</h3>
        </div>
      </main>
    )
  }

  if (lines.length === 0) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="bag" size={28} />
          <h3>Cart is empty</h3>
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Go to shop
          </button>
        </div>
      </main>
    )
  }

  const placeOrder = async () => {
    setPlacing(true)
    setError("")
    if (!user) {
      navigate("/auth?next=/checkout/payment")
      return
    }
    try {
      const order: Order = await createOrder({
        userId: user.uid,
        items: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          unit: l.product.unit,
          price: l.product.price,
          quantity: l.quantity,
        })),
        contact,
        paymentMethod: method,
      })
      clearCart()
      sessionStorage.removeItem("bagate_checkout_contact")
      sessionStorage.setItem("bagate_last_order", JSON.stringify(order))
      navigate(`/order/confirmation/${order.id}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order. Try again.",
      )
      setPlacing(false)
    }
  }

  return (
    <main className="checkout-page section-shell page-pad">
      <div className="checkout-steps">
        <span className="done">
          <Icon name="check" size={14} /> Cart
        </span>
        <i />
        <span className="done">
          <Icon name="check" size={14} /> Contact & address
        </span>
        <i />
        <span className="current">Payment</span>
        <i />
        <span>Confirmed</span>
      </div>

      <div className="checkout-layout">
        <section className="checkout-form card">
          <span className="kicker">STEP 2 OF 2</span>
          <h1>Payment method</h1>
          <p>
            Choose how you&apos;d like to pay. This is a demo checkout — no real
            money is charged.
          </p>

          <div className="payment-methods">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`payment-method ${
                  method === m.id ? "selected" : ""
                }`}
                onClick={() => setMethod(m.id)}
              >
                <span className="pm-icon">
                  <Icon name={m.icon} />
                </span>
                <span>
                  <strong>{m.title}</strong>
                  <small>{m.note}</small>
                </span>
                <span className="radio" />
              </button>
            ))}
          </div>

          {method === "upi" && (
            <label className="full-field">
              <span>UPI ID</span>
              <input placeholder="yourname@upi" defaultValue="demo@upi" />
            </label>
          )}
          {method === "card" && (
            <div className="form-grid">
              <label className="span-2">
                <span>Card number</span>
                <input
                  placeholder="4111 1111 1111 1111"
                  defaultValue="4111111111111111"
                />
              </label>
              <label>
                <span>Expiry</span>
                <input placeholder="MM/YY" defaultValue="12/28" />
              </label>
              <label>
                <span>CVV</span>
                <input placeholder="123" defaultValue="123" />
              </label>
            </div>
          )}

          <div className="deliver-to">
            <strong>Delivering to</strong>
            <p>
              {contact.name} • {contact.phone}
              <br />
              Flat {contact.flat}, Wing {contact.wing}, {contact.society},{" "}
              {contact.area}, {contact.pincode}
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/checkout/contact")}
            >
              Edit address
            </button>
          </div>

          {error && (
            <div className="form-banner error">
              <Icon name="close" /> {error}
            </div>
          )}

          <button
            className="primary-button full"
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? (
              "Placing order..."
            ) : (
              <>
                Place order • ₹{total} <Icon name="arrow" />
              </>
            )}
          </button>
        </section>

        <aside className="checkout-summary card">
          <h2>Order summary</h2>
          {lines.map(({ product, quantity }) => (
            <div className="summary-item" key={product.id}>
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <small>
                  {quantity} × {product.unit}
                </small>
              </div>
              <span>₹{product.price * quantity}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
        </aside>
      </div>
    </main>
  )
}
