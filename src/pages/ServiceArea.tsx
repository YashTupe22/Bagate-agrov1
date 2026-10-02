import { useEffect, useState, type FormEvent } from "react"
import {
  checkGeoFence,
  checkServiceability,
  getServiceAreas,
  STORE_LOCATION,
  type GeoFenceResult,
} from "../services/location"
import Icon from "../components/Icon"

export default function ServiceArea({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const [address, setAddress] = useState("")
  const [result, setResult] = useState<GeoFenceResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [areas, setAreas] = useState<{ area: string }[]>([])

  useEffect(() => {
    getServiceAreas().then((list) =>
      setAreas(list.map((a) => ({ area: a.area }))),
    )
  }, [])

  const check = async (event: FormEvent) => {
    event.preventDefault()
    if (!address.trim()) return
    setChecking(true)
    const res = await checkServiceability({ address })
    setResult(res)
    setChecking(false)
  }

  const useMyLocation = async () => {
    setChecking(true)
    const res = await checkGeoFence()
    setResult(res)
    setChecking(false)
  }

  return (
    <main className="service-page section-shell page-pad">
      <div className="shop-intro">
        <span className="kicker">SERVICE AREA</span>
        <h1>Do we deliver to you?</h1>
        <p>
          Bagate Agro delivers fresh vegetables within a{" "}
          {STORE_LOCATION.radiusKm} km radius of our store.
        </p>
      </div>

      <div className="service-layout">
        <section className="card service-check">
          <h2>Check delivery availability</h2>
          <form onSubmit={check} className="service-form">
            <label className="search-box">
              <Icon name="location" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Area, street or landmark near Bagate Agro"
              />
            </label>
            <div className="service-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={checking}
              >
                {checking ? (
                  "Checking..."
                ) : (
                  <>
                    Check address <Icon name="arrow" />
                  </>
                )}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={useMyLocation}
              >
                <Icon name="location" /> Use my location
              </button>
            </div>
          </form>

          {result && (
            <div
              className={`service-result ${
                result.available ? "ok" : "outside"
              }`}
            >
              <span className="result-icon">
                <Icon name={result.available ? "check" : "close"} size={28} />
              </span>
              <div>
                <h3>
                  {result.reason
                    ? "Location unavailable"
                    : result.available
                      ? "Delivery available"
                      : "Outside delivery area"}
                </h3>
                <p>{result.message}</p>
                {result.distanceKm > 0 && (
                  <small>
                    Estimated distance: {result.distanceKm} km from store
                  </small>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="card">
          <h2>Delivery zone</h2>
          <div className="map-visual static">
            <div className="roads r1" />
            <div className="roads r2" />
            <div className="roads r3" />
            <div className="radius">
              <span>
                <Icon name="leaf" size={18} />
              </span>
            </div>
            <b>{STORE_LOCATION.radiusKm} km radius</b>
          </div>
          <div className="zone-summary">
            <p>
              <strong>{STORE_LOCATION.radiusKm} km</strong>
              <small>Service radius</small>
            </p>
            <p>
              <strong>₹30</strong>
              <small>Delivery fee</small>
            </p>
            <p>
              <strong>FREE</strong>
              <small>On orders ₹299+</small>
            </p>
          </div>
          <h3>Areas we serve</h3>
          <ul className="area-list">
            {areas.map((a) => (
              <li key={a.area}>
                <Icon name="check" size={14} /> {a.area}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="card outside-help">
        <div>
          <span className="kicker">OUTSIDE 2 KM?</span>
          <h2>We may still reach you soon</h2>
          <p>
            We&apos;re expanding slowly around Bagate Agro. If you&apos;re just
            outside the zone, check back soon or contact us — popular streets
            get priority when we grow the route.
          </p>
        </div>
        <div className="cta-actions">
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Browse anyway <Icon name="arrow" />
          </button>
          <button className="text-button" onClick={() => navigate("/location")}>
            Open delivery check
          </button>
        </div>
      </section>
    </main>
  )
}
