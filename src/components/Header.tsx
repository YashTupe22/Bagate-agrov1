import { useState, type FormEvent } from "react"
import type { ViewRoute } from "../routes"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { getStoredFence } from "../services/location"
import Logo from "./Logo"
import Icon from "./Icon"

export default function Header({
  route,
  navigate,
  openLocation,
}: {
  route: ViewRoute
  navigate: (path: string) => void
  openLocation: () => void
}) {
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState("")
  const { cartCount, openCart } = useCart()
  const { user } = useAuth()
  const fence = getStoredFence()
  const deliveringTo = fence
    ? fence.available
      ? `${fence.distanceKm} km from store`
      : "Outside 2 km zone"
    : "Near Bagate Agro"

  const go = (path: string) => {
    navigate(path)
    setMenu(false)
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    setMenu(false)
  }

  const active = (name: ViewRoute["name"]) =>
    route.name === name || (name === "shop" && route.name === "product")
      ? "active"
      : ""

  return (
    <>
      <div className="announcement">
        <Icon name="truck" size={16} /> Free delivery on orders above ₹299{" "}
        <span>•</span> Open today until 8:30 PM
      </div>
      <header className="site-header">
        <div className="header-inner">
          <div onClick={() => go("/home")}>
            <Logo />
          </div>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button className={active("home")} onClick={() => go("/home")}>
              Home
            </button>
            <button className={active("shop")} onClick={() => go("/shop")}>
              Shop
            </button>
            <button
              className={active("categories")}
              onClick={() => go("/categories")}
            >
              Categories
            </button>
            <button
              className={active("serviceArea")}
              onClick={() => go("/service-area")}
            >
              Delivery area
            </button>
          </nav>
          <div className="header-actions">
            <form className="header-search" onSubmit={submitSearch}>
              <Icon name="search" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search veggies..."
              />
            </form>
            <button className="delivery-location" onClick={openLocation}>
              <Icon name="location" size={18} />
              <span>
                <small>Delivering to</small>
                <strong>{deliveringTo}</strong>
              </span>
              <Icon name="chevron" size={14} />
            </button>
            <button
              className="round-action"
              aria-label="Account"
              onClick={() => go(user ? "/account" : "/auth")}
            >
              <Icon name="user" />
            </button>
            <button
              className="cart-action"
              onClick={openCart}
              aria-label={`Cart with ${cartCount} items`}
            >
              <Icon name="bag" />
              <span>{cartCount}</span>
            </button>
            <button
              className="mobile-menu"
              onClick={() => setMenu(!menu)}
              aria-label="Open menu"
            >
              <Icon name={menu ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menu && (
          <div className="mobile-nav">
            <button onClick={() => go("/home")}>Home</button>
            <button onClick={() => go("/shop")}>Shop vegetables</button>
            <button onClick={() => go("/categories")}>Categories</button>
            <button onClick={() => go("/service-area")}>Delivery area</button>
            <button onClick={() => go("/cart")}>Your cart</button>
            <button onClick={() => go(user ? "/account" : "/auth")}>
              {user ? "My account" : "Sign in"}
            </button>
          </div>
        )}
      </header>
    </>
  )
}
