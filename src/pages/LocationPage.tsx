import { useState, type FormEvent } from "react"
import { checkGeoFence, checkServiceability } from "../services/location"
import Icon from "../components/Icon"

export default function LocationPage({
  navigate,
  close,
  isModal = false,
}: {
  navigate: (path: string) => void
  close?: () => void
  isModal?: boolean
}) {
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "outside">("idle")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [address, setAddress] = useState("")

  const detect = async () => {
    setStatus("loading")
    setMessage("")
    setError("")
    const res = await checkGeoFence()
    if (res.available) {
      setStatus("success")
      setMessage(res.message)
    } else if (res.reason) {
      setStatus("idle")
      setError(res.message)
    } else {
      setStatus("outside")
      setMessage(res.message)
    }
  }

  const checkAddress = async (event: FormEvent) => {
    event.preventDefault()
    setStatus("loading")
    const res = await checkServiceability({ address })
    setStatus(res.available ? "success" : "outside")
    setMessage(res.message)
  }

  const body = (
    <>
      <button
        className="modal-close"
        onClick={close ?? (() => navigate("/service-area"))}
      >
        <Icon name="close" />
      </button>
      <span className="location-illustration">
        <Icon
          name={
            status === "success"
              ? "check"
              : status === "outside"
                ? "close"
                : "location"
          }
          size={32}
        />
      </span>

      {status === "success" ? (
        <>
          <span className="kicker">DELIVERY AVAILABLE</span>
          <h2>Great! We deliver to you.</h2>
          <p>
            {message ||
              "Your location is within our 2 km delivery area. Fresh vegetables can reach you in 30–45 minutes."}
          </p>
          <div className="detected-address">
            <Icon name="location" />
            <span>
              <strong>Delivery confirmed</strong>
              <small>Bagate Agro service zone</small>
            </span>
            <Icon name="check" />
          </div>
          <button
            className="primary-button full"
            onClick={() => {
              close?.()
              navigate("/shop")
            }}
          >
            Start shopping <Icon name="arrow" />
          </button>
        </>
      ) : status === "outside" ? (
        <>
          <span className="kicker">OUTSIDE SERVICE AREA</span>
          <h2>Not delivering here yet</h2>
          <p>{message || "We're outside our 2 km delivery area for now."}</p>
          <button
            className="primary-button full"
            onClick={() => {
              close?.()
              navigate("/service-area")
            }}
          >
            See service area options <Icon name="arrow" />
          </button>
        </>
      ) : (
        <>
          <span className="kicker">CHECK SERVICEABILITY</span>
          <h2>Can we deliver to you?</h2>
          <p>
            Bagate Agro currently delivers within 2 km of our store. Check your
            location before you start shopping.
          </p>
          {error && (
            <div className="form-banner error">
              <Icon name="close" /> {error}
            </div>
          )}
          <button
            className="primary-button full"
            onClick={detect}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              "Finding your location..."
            ) : (
              <>
                <Icon name="location" /> Use my current location
              </>
            )}
          </button>
          <div className="or">
            <span />
            or
            <span />
          </div>
          <label className="address-input">
            <span>Enter address manually</span>
            <div>
              <Icon name="search" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Area, street or landmark"
              />
              <button type="button" onClick={checkAddress}>
                <Icon name="arrow" />
              </button>
            </div>
          </label>
          <small className="privacy">
            <Icon name="check" size={14} /> We only use your location to check
            delivery availability.
          </small>
        </>
      )}
    </>
  )

  if (isModal) {
    return (
      <div className="overlay modal-overlay" onMouseDown={close}>
        <section
          className="location-modal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {body}
        </section>
      </div>
    )
  }

  return (
    <main className="location-page section-shell page-pad">
      <section className="location-modal standalone">{body}</section>
    </main>
  )
}
