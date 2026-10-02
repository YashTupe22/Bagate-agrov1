import { useCallback, useEffect, useState } from "react"
import type { Order, OrderStatus } from "../services/types"
import {
  getOrder,
  listOrders,
  updateOrderStatus,
  statusLabel,
} from "../services/orders"
import Icon from "../components/Icon"
import { StatusPill, Timeline, formatTime } from "../components/OrderBits"
import { useAuth } from "../context/AuthContext"

const steps: OrderStatus[] = [
  "confirmed",
  "preparing",
  "out-for-delivery",
  "delivered",
]

export default function OrderTracking({
  orderId,
  navigate,
}: {
  orderId?: string
  navigate: (path: string) => void
}) {
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(orderId ?? "")

  const load = useCallback(async () => {
    setLoading(true)
    if (user) {
      const list = await listOrders(user.uid)
      setOrders(list)
    }
    if (selected) {
      const o = await getOrder(selected)
      setOrder(o)
    } else {
      setOrder(null)
    }
    setLoading(false)
  }, [selected, user])

  useEffect(() => {
    load()
  }, [load])

  const advance = async () => {
    if (!order) return
    const idx = steps.indexOf(order.status)
    const next = steps[Math.min(idx + 1, steps.length - 1)]
    if (next === order.status) return
    await updateOrderStatus(
      order.id,
      next,
      `Status updated to ${statusLabel(next)}`,
    )
    await load()
  }

  return (
    <main className="tracking-page section-shell page-pad">
      <div className="shop-intro">
        <span className="kicker">ORDER TRACKING</span>
        <h1>Track your order</h1>
        <p>Live status from store confirmation to your doorstep.</p>
      </div>

      <div className="tracking-layout">
        <aside className="card tracking-list">
          <h2>Recent orders</h2>
          {orders.length === 0 && (
            <p className="muted">
              Sign in to see your orders, or open a tracking link.
            </p>
          )}
          {orders.map((o) => (
            <button
              key={o.id}
              className={`tracking-list-item ${
                selected === o.id ? "selected" : ""
              }`}
              onClick={() => {
                setSelected(o.id)
                navigate(`/order/tracking/${o.id}`)
              }}
            >
              <strong>{o.id}</strong>
              <StatusPill status={o.status} />
              <small>
                {formatTime(o.createdAt)} • ₹{o.total}
              </small>
            </button>
          ))}
          <form
            className="track-by-id"
            onSubmit={(e) => {
              e.preventDefault()
              const id = (e.currentTarget.elements.namedItem(
                "id",
              ) as HTMLInputElement).value.trim()
              if (id) {
                setSelected(id)
                navigate(`/order/tracking/${id}`)
              }
            }}
          >
            <label>
              <span>Track by order ID</span>
              <input name="id" placeholder="BA1048" defaultValue={selected} />
            </label>
            <button className="primary-button" type="submit">
              Track
            </button>
          </form>
        </aside>

        <section className="card tracking-detail">
          {loading && (
            <div className="empty-state">
              <Icon name="refresh" size={28} />
              <h3>Loading...</h3>
            </div>
          )}
          {!loading && !order && (
            <div className="empty-state">
              <Icon name="orders" size={28} />
              <h3>No order selected</h3>
              <p>
                Choose an order from the list or enter an order ID like BA1048.
              </p>
              <button
                className="primary-button"
                onClick={() => navigate("/shop")}
              >
                Start shopping
              </button>
            </div>
          )}
          {!loading && order && (
            <>
              <div className="tracking-head">
                <div>
                  <span className="kicker">ORDER {order.id}</span>
                  <h2>{statusLabel(order.status)}</h2>
                  <p>Placed {formatTime(order.createdAt)}</p>
                </div>
                <StatusPill status={order.status} />
              </div>

              <div className="progress-track">
                {steps.map((step, index) => {
                  const currentIdx = steps.indexOf(order.status)
                  const done =
                    index <= currentIdx || order.status === "delivered"
                  return (
                    <div
                      key={step}
                      className={`progress-step ${done ? "done" : ""} ${
                        step === order.status ? "active" : ""
                      }`}
                    >
                      <span>
                        {done ? <Icon name="check" size={12} /> : index + 1}
                      </span>
                      <small>{statusLabel(step)}</small>
                    </div>
                  )
                })}
              </div>

              <Timeline order={order} />

              <div className="tracking-foot">
                <div>
                  <strong>Delivering to</strong>
                  <p>
                    {order.address.name}, {order.address.area},{" "}
                    {order.address.pincode}
                  </p>
                </div>
                <button className="text-button" onClick={advance}>
                  <Icon name="refresh" size={16} /> Demo: advance status
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
