import { useEffect, useState, type FormEvent } from "react"
import type { Order } from "../services/types"
import { listOrders } from "../services/orders"
import Icon from "../components/Icon"
import { OrderCard } from "../components/OrderBits"
import { useAuth } from "../context/AuthContext"

export default function Account({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const { user, signOut, updateProfile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/auth?next=/account")
      return
    }
    setName(user.name)
    setPhone(user.phone ?? "")
    listOrders(user.uid).then((list) => {
      setOrders(list)
      setLoading(false)
    })
  }, [user, navigate])

  if (!user) return null

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg("")
    try {
      await updateProfile({ name, phone })
      setMsg("Profile updated.")
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not update profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="account-page section-shell page-pad">
      <div className="shop-intro">
        <span className="kicker">MY ACCOUNT</span>
        <h1>Hello, {user.name.split(" ")[0]}</h1>
        <p>{user.email}</p>
      </div>

      <div className="account-layout">
        <aside className="card account-side">
          <div className="account-avatar">
            {user.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
          {user.phone && <small>{user.phone}</small>}
          <nav>
            <button className="selected">
              <Icon name="orders" size={16} /> Orders
            </button>
            <button onClick={() => navigate("/service-area")}>
              <Icon name="location" size={16} /> Delivery area
            </button>
            <button onClick={() => navigate("/shop")}>
              <Icon name="bag" size={16} /> Shop
            </button>
            <button
              onClick={() => {
                signOut()
                navigate("/home")
              }}
            >
              <Icon name="user" size={16} /> Sign out
            </button>
          </nav>
        </aside>

        <div className="account-main">
          <section className="card">
            <div className="card-heading">
              <div>
                <h2>Profile</h2>
                <p>Update your contact details</p>
              </div>
            </div>
            <form className="form-grid" onSubmit={save}>
              <label>
                <span>Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                <span>Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile number"
                />
              </label>
              <label className="span-2">
                <span>Email</span>
                <input value={user.email} disabled />
              </label>
              <div className="span-2 form-actions">
                {msg && (
                  <span className={msg.includes("updated") ? "ok" : "err"}>
                    {msg}
                  </span>
                )}
                <button className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-heading">
              <div>
                <h2>Order history</h2>
                <p>
                  {orders.length} order{orders.length === 1 ? "" : "s"}
                </p>
              </div>
              <button onClick={() => navigate("/order/tracking")}>
                Track order <Icon name="arrow" size={16} />
              </button>
            </div>
            {loading && <p className="muted">Loading orders...</p>}
            {!loading && orders.length === 0 && (
              <div className="empty-state">
                <Icon name="orders" size={28} />
                <h3>No orders yet</h3>
                <p>Your past orders will show up here after you shop.</p>
                <button
                  className="primary-button"
                  onClick={() => navigate("/shop")}
                >
                  Start shopping
                </button>
              </div>
            )}
            <div className="order-list">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onOpen={() => navigate(`/order/tracking/${order.id}`)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
