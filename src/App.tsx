import { useCallback, useEffect, useState, type ReactNode } from "react"
import { parseRoute, type ViewRoute } from "./routes"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { CartProvider, useCart } from "./context/CartContext"
import { seedProductsIfEmpty } from "./services/products"
import { isAdminEmail } from "./services/admin"
import { isFirebaseConfigured } from "./firebase/config"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Icon from "./components/Icon"
import Home from "./pages/Home"
import Shop from "./pages/Shop"
import Categories from "./pages/Categories"
import SearchResults from "./pages/SearchResults"
import ProductDetail from "./pages/ProductDetail"
import CartPage from "./pages/CartPage"
import CheckoutContact from "./pages/CheckoutContact"
import CheckoutPayment from "./pages/CheckoutPayment"
import OrderConfirmation from "./pages/OrderConfirmation"
import OrderTracking from "./pages/OrderTracking"
import Account from "./pages/Account"
import ServiceArea from "./pages/ServiceArea"
import LocationPage from "./pages/LocationPage"
import AuthPage from "./pages/Auth"
import Admin from "./pages/Admin"

function CartDrawer({ navigate }: { navigate: (path: string) => void }) {
  const {
    cartOpen,
    closeCart,
    lines,
    setQuantity,
    subtotal,
    deliveryFee,
    total,
  } = useCart()

  if (!cartOpen) return null

  return (
    <div className="overlay" onMouseDown={closeCart}>
      <aside className="cart-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="kicker">YOUR BASKET</span>
            <h2>
              Cart <small>{lines.length} items</small>
            </h2>
          </div>
          <button onClick={closeCart}>
            <Icon name="close" />
          </button>
        </header>
        {lines.length ? (
          <>
            <div className="cart-progress">
              <p>
                <span>
                  You&apos;re ₹{Math.max(0, 299 - subtotal)} away from free
                  delivery
                </span>
                <strong>
                  {Math.min(100, Math.round((subtotal / 299) * 100))}%
                </strong>
              </p>
              <div>
                <i
                  style={{ width: `${Math.min(100, (subtotal / 299) * 100)}%` }}
                />
              </div>
            </div>
            <div className="cart-items">
              {lines.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <p>
                    <strong>{product.name}</strong>
                    <small>{product.unit}</small>
                    <span>₹{product.price}</span>
                  </p>
                  <div className="stepper">
                    <button
                      onClick={() => setQuantity(product.id, quantity - 1)}
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity(product.id, quantity + 1)}
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <footer>
              <div>
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </strong>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  closeCart()
                  navigate("/cart")
                }}
              >
                View cart & checkout <Icon name="arrow" />
              </button>
              <small>
                <Icon name="location" size={14} /> Delivery eligibility checked
                again at checkout
              </small>
            </footer>
          </>
        ) : (
          <div className="empty-cart">
            <span>
              <Icon name="bag" size={30} />
            </span>
            <h3>Your basket is empty</h3>
            <p>
              Add today&apos;s fresh vegetables and they&apos;ll appear here.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                closeCart()
                navigate("/shop")
              }}
            >
              Start shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function AdminGate({ navigate }: { navigate: (path: string) => void }) {
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?next=/admin")
    }
  }, [loading, user, navigate])

  if (loading || !user) return null

  if (!isAdminEmail(user.email)) {
    return (
      <main className="section-shell page-pad">
        <div className="empty-state">
          <Icon name="close" size={28} />
          <h3>Access denied</h3>
          <p>
            The admin dashboard is restricted. You are signed in as {user.email}
            .
          </p>
          <button className="primary-button" onClick={() => navigate("/home")}>
            Back home
          </button>{" "}
          <button
            className="text-button"
            onClick={() => {
              signOut()
              navigate("/auth?next=/admin")
            }}
          >
            Switch account
          </button>
        </div>
      </main>
    )
  }

  return <Admin navigate={navigate} />
}

function Shell() {
  const [route, setRoute] = useState<ViewRoute>(() =>
    parseRoute(window.location.pathname, window.location.search),
  )
  const [locationOpen, setLocationOpen] = useState(false)
  const { openCart } = useCart()

  useEffect(() => {
    const sync = () =>
      setRoute(parseRoute(window.location.pathname, window.location.search))
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/home")
      sync()
    }
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  const navigate = useCallback((path: string) => {
    const [pathname] = path.split("?")
    if (window.location.pathname !== pathname) {
      window.history.pushState(null, "", path)
    } else if (path.includes("?")) {
      window.history.replaceState(null, "", path)
    }
    setRoute(parseRoute(window.location.pathname, window.location.search))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  if (route.name === "admin") {
    return <AdminGate navigate={navigate} />
  }

  let page: ReactNode = null
  switch (route.name) {
    case "home":
      page = (
        <Home navigate={navigate} openLocation={() => setLocationOpen(true)} />
      )
      break
    case "shop":
      page = <Shop navigate={navigate} />
      break
    case "categories":
      page = <Categories navigate={navigate} />
      break
    case "search":
      page = <SearchResults q={route.q} navigate={navigate} />
      break
    case "product":
      page = (
        <ProductDetail id={route.id} navigate={navigate} openCart={openCart} />
      )
      break
    case "cart":
      page = <CartPage navigate={navigate} />
      break
    case "checkoutContact":
      page = <CheckoutContact navigate={navigate} />
      break
    case "checkoutPayment":
      page = <CheckoutPayment navigate={navigate} />
      break
    case "orderConfirmation":
      page = <OrderConfirmation orderId={route.orderId} navigate={navigate} />
      break
    case "orderTracking":
      page = <OrderTracking orderId={route.orderId} navigate={navigate} />
      break
    case "account":
      page = <Account navigate={navigate} />
      break
    case "serviceArea":
      page = <ServiceArea navigate={navigate} />
      break
    case "location":
      page = <LocationPage navigate={navigate} />
      break
    case "auth":
      page = <AuthPage mode={route.mode} navigate={navigate} />
      break
    default:
      page = (
        <main className="section-shell page-pad">
          <div className="empty-state">
            <Icon name="leaf" size={28} />
            <h3>Page not found</h3>
            <p>The page you&apos;re looking for doesn&apos;t exist.</p>
            <button
              className="primary-button"
              onClick={() => navigate("/home")}
            >
              Back home
            </button>
          </div>
        </main>
      )
  }

  return (
    <div className="app">
      <Header
        route={route}
        navigate={navigate}
        openLocation={() => setLocationOpen(true)}
      />
      {page}
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />
      {locationOpen && (
        <LocationPage
          isModal
          navigate={navigate}
          close={() => setLocationOpen(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  useEffect(() => {
    if (isFirebaseConfigured) {
      void seedProductsIfEmpty()
    }
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  )
}
