import Logo from "./Logo"
import Icon from "./Icon"

export default function Footer({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo light />
          <p>Fresh, local vegetables delivered to homes near Bagate Agro.</p>
          <button onClick={() => navigate("/service-area")}>
            <Icon name="location" size={18} /> Serving within 2 km
          </button>
        </div>
        <div>
          <strong>Shop</strong>
          <button onClick={() => navigate("/shop")}>All vegetables</button>
          <button onClick={() => navigate("/shop")}>
            Today&apos;s fresh picks
          </button>
          <button onClick={() => navigate("/shop")}>Value baskets</button>
        </div>
        <div>
          <strong>Help</strong>
          <button onClick={() => navigate("/service-area")}>
            Delivery area
          </button>
          <button onClick={() => navigate("/account")}>Your orders</button>
          <button onClick={() => navigate("/auth")}>Sign in</button>
        </div>
        <div className="footer-contact">
          <strong>Talk to us</strong>
          <p>Need help with an order?</p>
          <button>
            WhatsApp Bagate Agro <Icon name="arrow" size={17} />
          </button>
          <small>Open daily • 7:00 AM–8:30 PM</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Bagate Agro. Grown nearby, delivered with care.</span>
        <div>
          <button onClick={() => navigate("/service-area")}>Privacy</button>
          <button onClick={() => navigate("/service-area")}>Terms</button>
        </div>
      </div>
    </footer>
  )
}
