import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { Order, OrderStatus, Product } from "../services/types"
import {
  listAllOrders,
  subscribeAllOrders,
  updateOrderStatus,
  statusLabel,
} from "../services/orders"
import {
  deleteProduct,
  getProducts,
  nextProductId,
  photosMap,
  saveProduct,
  seedProductsIfEmpty,
} from "../services/products"
import { ADMIN_EMAIL } from "../services/admin"
import Icon from "../components/Icon"
import Logo from "../components/Logo"
import { useAuth } from "../context/AuthContext"

type Tab = "overview" | "orders" | "products"

type AdminTab = {
  id: Tab
  label: string
  icon: "grid" | "orders" | "box"
}

type ProductDraft = {
  name: string
  price: string
  unit: string
  category: string
  stock: string
  tag: string
  description: string
  imagePreset: string
  imageUrl: string
}

const statusFlow = [
  "pending",
  "confirmed",
  "preparing",
  "out-for-delivery",
  "delivered",
] as const

const emptyDraft: ProductDraft = {
  name: "",
  price: "",
  unit: "",
  category: "",
  stock: "",
  tag: "",
  description: "",
  imagePreset: "tomato",
  imageUrl: "",
}

const imagePresets = [
  "tomato",
  "spinach",
  "cauliflower",
  "onion",
  "pepper",
  "basket",
]

export default function Admin({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("")
  const [form, setForm] = useState<ProductDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const reloadOrders = async () => {
    try {
      setOrders(await listAllOrders())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.")
    }
  }

  const reloadProducts = async () => {
    setProducts(await getProducts())
  }

  useEffect(() => {
    let unsubscribe: () => void = () => undefined
    void subscribeAllOrders(setOrders).then((stop) => {
      unsubscribe = stop
    })
    void reloadProducts()
    return () => unsubscribe()
  }, [])

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const attention = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed",
  ).length
  const lowStock = products.filter((p) => p.stock < 15)

  const visibleOrders = useMemo(
    () =>
      statusFilter ? orders.filter((o) => o.status === statusFilter) : orders,
    [orders, statusFilter],
  )

  const categoryNames = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  )

  const set = (key: keyof ProductDraft, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const advanceOrder = async (order: Order) => {
    const idx = (statusFlow as readonly string[]).indexOf(order.status)
    const next = statusFlow[Math.min(idx + 1, statusFlow.length - 1)]
    if (next === order.status) return
    setBusy(true)
    await updateOrderStatus(order.id, next, `Admin: ${statusLabel(next)}`)
    await reloadOrders()
    setBusy(false)
  }

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`Cancel order ${order.id}?`)) return
    setBusy(true)
    await updateOrderStatus(order.id, "cancelled", "Admin: cancelled")
    await reloadOrders()
    setBusy(false)
  }

  const changeStock = async (product: Product, delta: number) => {
    const updated = await saveProduct({
      ...product,
      stock: Math.max(0, product.stock + delta),
    })
    setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)))
  }

  const startEdit = (product: Product) => {
    const preset = imagePresets.find(
      (key) => (photosMap as Record<string, string>)[key] === product.image,
    )
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      unit: product.unit,
      category: product.category,
      stock: String(product.stock),
      tag: product.tag,
      description: product.description,
      imagePreset: preset ?? "custom",
      imageUrl: preset ? "" : product.image,
    })
    setNotice("")
    setError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyDraft)
  }

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault()
    setNotice("")
    setError("")
    const price = Number(form.price)
    if (
      !form.name.trim() ||
      !(price > 0) ||
      !form.unit.trim() ||
      !form.category.trim()
    ) {
      setError("Name, price, unit and category are required.")
      return
    }
    const presetUrl = (photosMap as Record<string, string>)[form.imagePreset]
    const image =
      form.imagePreset === "custom" ? form.imageUrl.trim() : presetUrl
    setBusy(true)
    const saved = await saveProduct({
      id: editingId ?? nextProductId(products),
      name: form.name.trim(),
      unit: form.unit.trim(),
      price,
      image: image || presetUrl || "",
      tag: form.tag.trim() || "Fresh today",
      category: form.category.trim(),
      description:
        form.description.trim() ||
        `${form.name.trim()} — fresh from Bagate Agro.`,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      origin: "Bagate Agro",
    })
    setProducts((list) => {
      const idx = list.findIndex((p) => p.id === saved.id)
      return idx >= 0
        ? list.map((p) => (p.id === saved.id ? saved : p))
        : [...list, saved]
    })
    setNotice(editingId ? "Product updated." : "Product added.")
    cancelEdit()
    setBusy(false)
  }

  const removeProduct = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    setBusy(true)
    await deleteProduct(product.id)
    setProducts((list) => list.filter((p) => p.id !== product.id))
    setNotice("Product deleted.")
    setBusy(false)
  }

  const seedCatalogue = async () => {
    setBusy(true)
    setNotice("")
    await seedProductsIfEmpty()
    await reloadProducts()
    setNotice("Demo catalogue seeded (only fills an empty catalogue).")
    setBusy(false)
  }

  const tabs: AdminTab[] = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "products", label: "Products", icon: "box" },
  ]

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div onClick={() => navigate("/home")}>
          <Logo light />
        </div>
        <nav>
          <span>OPERATIONS</span>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "selected" : ""}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} /> {t.label}
              {t.id === "orders" && <b>{orders.length}</b>}
            </button>
          ))}
          <button>
            <Icon name="chart" /> Inventory{" "}
            <b className="warning">{lowStock.length}</b>
          </button>
          <span>MANAGE</span>
          <button onClick={() => navigate("/service-area")}>
            <Icon name="location" /> Delivery area
          </button>
          <button onClick={() => navigate("/home")}>
            <Icon name="user" /> Back to site
          </button>
        </nav>
        <div className="admin-profile">
          <span>
            {(user?.name ?? "Admin")
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <p>
            <strong>{user?.name ?? "Admin"}</strong>
            <small>{user?.email ?? ADMIN_EMAIL}</small>
          </p>
          <button
            className="row-action"
            aria-label="Sign out"
            onClick={() => {
              signOut()
              navigate("/home")
            }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <small>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </small>
            <h1>
              {tab === "overview" && "Store overview"}
              {tab === "orders" && "All orders"}
              {tab === "products" && "Products"}
            </h1>
            <p>
              {tab === "overview" &&
                "Here's what's happening at Bagate Agro today."}
              {tab === "orders" &&
                "Every order from every customer, newest first."}
              {tab === "products" &&
                "Catalogue, stock and prices — changes go live instantly."}
            </p>
          </div>
          <div>
            <button className="store-open">
              <span /> Store open
            </button>
            <button
              className="primary-button"
              onClick={() => navigate("/shop")}
            >
              <Icon name="plus" /> View storefront
            </button>
          </div>
        </header>

        {notice && (
          <div className="form-banner success">
            <Icon name="check" /> {notice}
          </div>
        )}
        {error && (
          <div className="form-banner error">
            <Icon name="close" /> {error}
          </div>
        )}

        {tab === "overview" && (
          <>
            <section className="metrics">
              {[
                [
                  "Total orders",
                  String(orders.length),
                  "All customers",
                  "orders",
                ],
                [
                  "Revenue",
                  `₹${revenue.toLocaleString("en-IN")}`,
                  "All orders",
                  "chart",
                ],
                [
                  "Needs attention",
                  String(attention),
                  "Pending / confirmed",
                  "clock",
                ],
                ["Low stock", String(lowStock.length), "Below 15 units", "box"],
              ].map(([label, value, note, icon], index) => (
                <article className="metric-card" key={label}>
                  <div className={`metric-top metric-${index}`}>
                    <span>
                      <Icon name={icon as "orders"} />
                    </span>
                  </div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </article>
              ))}
            </section>
            <section className="admin-grid">
              <article className="orders-card">
                <div className="card-heading">
                  <div>
                    <h2>Recent orders</h2>
                    <p>Latest across all customers</p>
                  </div>
                  <button onClick={() => setTab("orders")}>
                    All orders <Icon name="arrow" size={17} />
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.id}</strong>
                          </td>
                          <td>{order.address.name}</td>
                          <td>
                            <strong>₹{order.total}</strong>
                          </td>
                          <td>
                            <span
                              className={`status ${order.status.split(" ").join("-")}`}
                            >
                              <i />
                              {statusLabel(order.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
              <article className="sales-card">
                <div className="card-heading">
                  <div>
                    <h2>Inventory snapshot</h2>
                    <p>{products.length} products</p>
                  </div>
                  <button onClick={() => setTab("products")}>
                    Manage <Icon name="arrow" size={14} />
                  </button>
                </div>
                <div className="chart-total">
                  <strong>{products.length}</strong>
                  <span>listed SKUs</span>
                </div>
                {products.slice(0, 5).map((p) => (
                  <div className="stock-row" key={p.id}>
                    <img src={p.image} alt="" />
                    <p>
                      <strong>{p.name}</strong>
                      <small>{p.stock} units</small>
                    </p>
                    <span className={p.stock < 15 ? "critical" : ""}>
                      {p.stock < 15 ? "Low" : "OK"}
                    </span>
                  </div>
                ))}
              </article>
            </section>
          </>
        )}

        {tab === "orders" && (
          <section className="orders-card">
            <div className="card-heading">
              <div>
                <h2>Orders</h2>
                <p>
                  {visibleOrders.length} of {orders.length} orders
                </p>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  className="row-action"
                  style={{ width: "30px", height: "30px" }}
                  aria-label="Refresh orders"
                  disabled={busy}
                  onClick={() => {
                    void reloadOrders()
                    void reloadProducts()
                  }}
                >
                  <Icon name="refresh" size={14} />
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "" | OrderStatus)
                  }
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out-for-delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Deliver to</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Advance</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => {
                    const done =
                      order.status === "delivered" ||
                      order.status === "cancelled"
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.id}</strong>
                        </td>
                        <td>
                          {order.address.name}
                          <br />
                          <small>{order.address.phone}</small>
                        </td>
                        <td>
                          <small>
                            {order.address.line1}
                            {order.address.line2
                              ? `, ${order.address.line2}`
                              : ""}
                            {`, ${order.address.area} ${order.address.pincode}`}
                          </small>
                        </td>
                        <td>
                          <small>
                            {order.items
                              .map((i) => `${i.quantity}× ${i.name}`)
                              .join(", ")}
                          </small>
                        </td>
                        <td>
                          <strong>₹{order.total}</strong>
                        </td>
                        <td>
                          <small>
                            {order.payment.method.toUpperCase()} •{" "}
                            {order.payment.status}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`status ${order.status.split(" ").join("-")}`}
                          >
                            <i />
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td>
                          {done ? (
                            "—"
                          ) : (
                            <button
                              className="row-action"
                              disabled={busy}
                              aria-label="Advance status"
                              onClick={() => void advanceOrder(order)}
                            >
                              <Icon name="chevron" size={16} />
                            </button>
                          )}
                        </td>
                        <td>
                          {done ? (
                            "—"
                          ) : (
                            <button
                              className="row-action"
                              disabled={busy}
                              aria-label="Cancel order"
                              onClick={() => void cancelOrder(order)}
                            >
                              <Icon name="close" size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "products" && (
          <>
            <section className="orders-card">
              <div className="card-heading">
                <div>
                  <h2>{editingId ? "Edit product" : "Add product"}</h2>
                  <p>Changes appear on the storefront immediately</p>
                </div>
                <button
                  type="button"
                  onClick={() => void seedCatalogue()}
                  disabled={busy}
                >
                  Seed demo catalogue <Icon name="refresh" size={14} />
                </button>
              </div>
              <form
                className="form-grid"
                onSubmit={submitProduct}
                style={{ padding: "0 17px" }}
              >
                <label>
                  <span>Name *</span>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Farm fresh tomatoes"
                    required
                  />
                </label>
                <label>
                  <span>Category *</span>
                  <input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Everyday vegetables"
                    list="admin-categories"
                    required
                  />
                  <datalist id="admin-categories">
                    {categoryNames.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
                <label>
                  <span>Price (₹) *</span>
                  <input
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="40"
                    inputMode="numeric"
                    required
                  />
                </label>
                <label>
                  <span>Unit *</span>
                  <input
                    value={form.unit}
                    onChange={(e) => set("unit", e.target.value)}
                    placeholder="1 kg"
                    required
                  />
                </label>
                <label>
                  <span>Stock *</span>
                  <input
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="20"
                    inputMode="numeric"
                    required
                  />
                </label>
                <label>
                  <span>Tag</span>
                  <input
                    value={form.tag}
                    onChange={(e) => set("tag", e.target.value)}
                    placeholder="Fresh today"
                  />
                </label>
                <label>
                  <span>Photo</span>
                  <select
                    value={form.imagePreset}
                    onChange={(e) => set("imagePreset", e.target.value)}
                  >
                    {imagePresets.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                    <option value="custom">Custom URL…</option>
                  </select>
                </label>
                {form.imagePreset === "custom" ? (
                  <label>
                    <span>Image URL</span>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => set("imageUrl", e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                ) : (
                  <label>
                    <span>Preview</span>
                    <input
                      value={
                        (photosMap as Record<string, string>)[
                          form.imagePreset
                        ] ?? ""
                      }
                      disabled
                    />
                  </label>
                )}
                <label className="span-2">
                  <span>Description</span>
                  <input
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description for the product page"
                  />
                </label>
                <div className="span-2">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={busy}
                  >
                    {editingId ? "Save changes" : "Add product"}
                  </button>{" "}
                  {editingId && (
                    <button
                      className="text-button"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="orders-card" style={{ marginTop: "13px" }}>
              <div className="card-heading">
                <div>
                  <h2>Catalogue</h2>
                  <p>{products.length} products</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <br />
                          <small>{p.unit}</small>
                        </td>
                        <td>
                          <small>{p.category}</small>
                        </td>
                        <td>
                          <strong>₹{p.price}</strong>
                        </td>
                        <td>
                          <button
                            className="row-action"
                            aria-label="Decrease stock"
                            disabled={busy}
                            onClick={() => void changeStock(p, -1)}
                          >
                            <Icon name="minus" size={12} />
                          </button>{" "}
                          <strong>{p.stock}</strong>{" "}
                          <button
                            className="row-action"
                            aria-label="Increase stock"
                            disabled={busy}
                            onClick={() => void changeStock(p, 1)}
                          >
                            <Icon name="plus" size={12} />
                          </button>
                        </td>
                        <td>
                          <button
                            className="row-action"
                            aria-label="Edit product"
                            onClick={() => startEdit(p)}
                          >
                            <Icon name="chevron" size={16} />
                          </button>
                        </td>
                        <td>
                          <button
                            className="row-action"
                            aria-label="Delete product"
                            disabled={busy}
                            onClick={() => void removeProduct(p)}
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
