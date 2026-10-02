import { useEffect, useState } from "react"
import type { Order } from "../services/types"
import { getOrder, statusLabel } from "../services/orders"
import Icon from "../components/Icon"
import { formatTime } from "../components/OrderBits"

export default function OrderConfirmation({
  orderId,
  navigate,
}: {
  orderId: string
  navigate: (path: string) => void
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(orderId).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [orderId])

  if (loading) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="refresh" size={28} />
          <h3>Loading order...</h3>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="orders" size={28} />
          <h3>Order not found</h3>
          <button
            className="primary-button"
            onClick={() => navigate("/account")}
          >
            View my orders
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="confirm-page section-shell page-pad">
      <div className="confirm-hero card">
        <div className="confirm-icon">
          <Icon name="check" size={32} />
        </div>
        <span className="kicker">ORDER CONFIRMED</span>
        <h1>Thank you! Your order is in.</h1>
        <p>
          We&apos;ve received order <strong>{order.id}</strong> and will start
          preparing it shortly.
        </p>
        <div className="confirm-meta">
          <div>
            <small>Placed at</small>
            <strong>{formatTime(order.createdAt)}</strong>
          </div>
          <div>
            <small>Status</small>
            <strong>{statusLabel(order.status)}</strong>
          </div>
          <div>
            <small>Total paid</small>
            <strong>₹{order.total}</strong>
          </div>
          <div>
            <small>Payment</small>
            <strong>
              {order.payment.method.toUpperCase()}{" "}
              {order.payment.status === "paid" ? "• Paid" : "• Due on delivery"}
            </strong>
          </div>
        </div>
        <div className="cta-actions">
          <button
            className="primary-button"
            onClick={() => navigate(`/order/tracking/${order.id}`)}
          >
            Track order <Icon name="arrow" />
          </button>
          <button className="text-button" onClick={() => navigate("/shop")}>
            Continue shopping
          </button>
        </div>
      </div>

      <div className="confirm-grid">
        <section className="card">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div className="summary-item" key={item.productId}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  {item.quantity} × {item.unit}
                </small>
              </div>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{order.subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>
              {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
            </strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>₹{order.total}</strong>
          </div>
        </section>
        <section className="card">
          <h2>Delivery address</h2>
          <p className="address-block">
            <strong>{order.address.name}</strong>
            <br />
            {order.address.line1}
            {order.address.line2 ? (
              <>
                <br />
                {order.address.line2}
              </>
            ) : null}
            <br />
            {order.address.area}
            {order.address.landmark ? <> • {order.address.landmark}</> : null}
            <br />
            {order.address.pincode}
          </p>
          <p className="address-block">
            <strong>Phone</strong>
            <br />
            {order.address.phone}
          </p>
        </section>
      </div>
    </main>
  )
}
