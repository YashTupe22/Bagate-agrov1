import { useMemo, useState, type FormEvent } from "react"
import type { CheckoutContact } from "../services/types"
import Icon from "../components/Icon"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import {
  checkGeoFence,
  checkServiceability,
  getStoredFence,
  reverseGeocode,
  type GeoFenceResult,
} from "../services/location"

const empty: CheckoutContact = {
  name: "",
  phone: "",
  email: "",
  flat: "",
  wing: "",
  society: "",
  area: "",
  landmark: "",
  pincode: "",
}

export default function CheckoutContact({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const { lines, subtotal, deliveryFee, total } = useCart()
  const { user } = useAuth()
  const savedAddress = user?.addresses?.find((a) => a.isDefault)
  const [form, setForm] = useState<CheckoutContact>(() => ({
    ...empty,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    area: savedAddress?.area ?? "",
    pincode: savedAddress?.pincode ?? "",
  }))
  const [checking, setChecking] = useState(false)
  const [areaOk, setAreaOk] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [geo, setGeo] = useState<GeoFenceResult | null>(() => getStoredFence())

  const set = (key: keyof CheckoutContact, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (
      key === "flat" ||
      key === "wing" ||
      key === "society" ||
      key === "area" ||
      key === "pincode"
    ) {
      setAreaOk(null)
    }
  }

  const valid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      form.phone.trim().length >= 10 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.flat.trim().length >= 1 &&
      form.wing.trim().length >= 1 &&
      form.society.trim().length >= 2 &&
      form.area.trim().length > 1 &&
      form.pincode.trim().length === 6
    )
  }, [form])

  const useMyLocation = async () => {
    setChecking(true)
    setError("")
    const res = await checkGeoFence()
    setGeo(res)
    if (res.available && res.coords) {
      const hints = await reverseGeocode(res.coords)
      if (hints) {
        setForm((f) => ({
          ...f,
          area: f.area || hints.area,
          pincode: f.pincode || hints.pincode,
        }))
      }
    }
    setChecking(false)
  }

  const payload = (): CheckoutContact => ({
    ...form,
    name: form.name.trim(),
    phone: form.phone.trim(),
    flat: form.flat.trim(),
    wing: form.wing.trim(),
    society: form.society.trim(),
    area: form.area.trim(),
    landmark: form.landmark.trim(),
    pincode: form.pincode.trim(),
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!valid) {
      setError("Please fill all required fields correctly.")
      return
    }
    setChecking(true)

    if (geo && !geo.reason) {
      setChecking(false)
      if (geo.available) {
        sessionStorage.setItem(
          "bagate_checkout_contact",
          JSON.stringify(payload()),
        )
        navigate("/checkout/payment")
      } else {
        setAreaOk(false)
        setError(geo.message)
      }
      return
    }

    let result = await checkServiceability({
      address: `${form.flat}, Wing ${form.wing}, ${form.society}, ${form.area}, ${form.pincode}`,
    })
    if (!result.available) {
      const cached = getStoredFence()
      if (cached && !cached.reason && cached.available) {
        result = {
          ...cached,
          message: `Confirmed via your current location — ${cached.distanceKm} km from store.`,
        }
      }
    }
    setChecking(false)
    setAreaOk(result.available)
    if (!result.available) {
      setError(result.message)
      return
    }
    sessionStorage.setItem("bagate_checkout_contact", JSON.stringify(payload()))
    navigate("/checkout/payment")
  }

  if (lines.length === 0) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="bag" size={28} />
          <h3>Nothing to checkout</h3>
          <p>Add some fresh vegetables first.</p>
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Go to shop
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page section-shell page-pad">
      <div className="checkout-steps">
        <span className="done">
          <Icon name="check" size={14} /> Cart
        </span>
        <i />
        <span className="current">Contact & address</span>
        <i />
        <span>Payment</span>
        <i />
        <span>Confirmed</span>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form card" onSubmit={submit}>
          <span className="kicker">STEP 1 OF 2</span>
          <h1>Contact & delivery address</h1>
          <p>We&apos;ll use this to confirm your order and deliver it fresh.</p>

          <div className="form-grid">
            <label>
              <span>Full name *</span>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Neha Patil"
                required
              />
            </label>
            <label>
              <span>Phone *</span>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="10-digit mobile"
                required
              />
            </label>
            <label className="span-2">
              <span>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              <span>Flat / house no *</span>
              <input
                value={form.flat}
                onChange={(e) => set("flat", e.target.value)}
                placeholder="e.g. 402"
                required
              />
            </label>
            <label>
              <span>Wing *</span>
              <input
                value={form.wing}
                onChange={(e) => set("wing", e.target.value)}
                placeholder="e.g. B"
                required
              />
            </label>
            <label className="span-2">
              <span>Society / building name *</span>
              <input
                value={form.society}
                onChange={(e) => set("society", e.target.value)}
                placeholder="e.g. Sunrise Residency"
                required
              />
            </label>
            <label className="span-2">
              <span>Landmark (optional)</span>
              <input
                value={form.landmark}
                onChange={(e) => set("landmark", e.target.value)}
                placeholder="Near school, temple..."
              />
            </label>
            <label>
              <span>Area / locality *</span>
              <input
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Moshi"
                required
              />
            </label>
            <label>
              <span>Pincode *</span>
              <input
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value)}
                placeholder="411070"
                maxLength={6}
                required
              />
            </label>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={useMyLocation}
            disabled={checking}
          >
            <Icon name="location" size={16} /> Use my current location to verify
            the 2 km zone
          </button>

          {geo && !geo.reason && geo.available && (
            <div className="form-banner success">
              <Icon name="check" /> {geo.message}
            </div>
          )}
          {geo && (geo.reason || !geo.available) && (
            <div className="form-banner error">
              <Icon name="close" /> {geo.message}
            </div>
          )}
          {areaOk === true && (
            <div className="form-banner success">
              <Icon name="check" /> Delivery available at this address.
            </div>
          )}
          {error && (
            <div className="form-banner error">
              <Icon name="close" /> {error}
            </div>
          )}

          <button
            className="primary-button full"
            type="submit"
            disabled={checking}
          >
            {checking ? (
              "Checking service area..."
            ) : (
              <>
                Continue to payment <Icon name="arrow" />
              </>
            )}
          </button>
        </form>

        <aside className="checkout-summary card">
          <h2>Your order</h2>
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
