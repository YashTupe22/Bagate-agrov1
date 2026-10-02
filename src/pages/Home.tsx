import { useEffect, useState } from "react"
import type { Product } from "../services/types"
import { getProducts } from "../services/products"
import ProductCard from "../components/ProductCard"
import Icon from "../components/Icon"

const categories = [
  { name: "Leafy greens", count: "8 items", tone: "leafy", symbol: "⌁" },
  { name: "Everyday veg", count: "14 items", tone: "orange", symbol: "◒" },
  { name: "Roots & bulbs", count: "9 items", tone: "purple", symbol: "◇" },
  { name: "Fresh baskets", count: "4 combos", tone: "yellow", symbol: "▱" },
]

const photos = {
  hero: "https://images.unsplash.com/photo-1723347101054-c246b0034f11?auto=format&fit=crop&w=1400&q=88",
  basket:
    "https://images.unsplash.com/photo-1627989147125-a004d05946d3?auto=format&fit=crop&w=700&q=85",
}

export default function Home({
  navigate,
  openLocation,
}: {
  navigate: (path: string) => void
  openLocation: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> Grown nearby. Delivered fresh.
          </div>
          <h1>
            Fresh vegetables.
            <br />
            From our farm to <em>your home.</em>
          </h1>
          <p>
            Handpicked every morning and delivered to your doorstep within 2 km
            of Bagate Agro.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => navigate("/shop")}
            >
              Shop fresh vegetables <Icon name="arrow" />
            </button>
            <button className="text-button" onClick={openLocation}>
              <Icon name="location" /> Check delivery area
            </button>
          </div>
          <div className="trust-row">
            <div className="avatars">
              <span>BA</span>
              <span>SK</span>
              <span>RP</span>
            </div>
            <p>
              <strong>4.9/5 from local families</strong>
              <small>Fresh produce, every single day</small>
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo">
            <img src={photos.hero} alt="Basket of fresh local vegetables" />
          </div>
          <div className="floating-card harvest-card">
            <span className="float-icon">
              <Icon name="leaf" />
            </span>
            <p>
              <strong>Morning harvest</strong>
              <small>Picked at 6:00 AM today</small>
            </p>
          </div>
          <div className="floating-card delivery-card">
            <span className="float-icon amber">
              <Icon name="clock" />
            </span>
            <p>
              <strong>30–45 min delivery</strong>
              <small>Within our 2 km area</small>
            </p>
          </div>
        </div>
      </section>

      <section className="promise-bar">
        <div>
          <span>
            <Icon name="location" />
          </span>
          <p>
            <strong>Hyperlocal delivery</strong>
            <small>Within 2 km of Bagate Agro</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="leaf" />
          </span>
          <p>
            <strong>Fresh every morning</strong>
            <small>Direct from nearby farms</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="box" />
          </span>
          <p>
            <strong>Carefully packed</strong>
            <small>Clean, sorted and ready</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="check" />
          </span>
          <p>
            <strong>Fair local prices</strong>
            <small>No unnecessary markups</small>
          </p>
        </div>
      </section>

      <section className="section-shell category-section">
        <div className="section-heading">
          <div>
            <span className="kicker">SHOP BY CATEGORY</span>
            <h2>What are you cooking today?</h2>
          </div>
          <button className="view-all" onClick={() => navigate("/categories")}>
            View all categories <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-card ${category.tone}`}
              onClick={() =>
                navigate(
                  `/search?q=${encodeURIComponent(category.name.split(" ")[0])}`,
                )
              }
            >
              <span className="category-symbol">{category.symbol}</span>
              <span>
                <strong>{category.name}</strong>
                <small>{category.count}</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="section-shell products-section">
        <div className="section-heading">
          <div>
            <span className="kicker">PICKED THIS MORNING</span>
            <h2>Today&apos;s fresh picks</h2>
            <p>Seasonal vegetables, handpicked for quality and freshness.</p>
          </div>
          <button className="view-all" onClick={() => navigate("/shop")}>
            Shop all fresh produce <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </section>

      <section className="how-section">
        <div className="how-image">
          <img
            src={photos.basket}
            alt="Fresh vegetables prepared for delivery"
          />
          <div className="image-note">
            <Icon name="leaf" />
            <span>
              <strong>From local farms</strong>
              <small>Less travel. More freshness.</small>
            </span>
          </div>
        </div>
        <div className="how-copy">
          <span className="kicker">SIMPLE & LOCAL</span>
          <h2>Freshness, without the fuss.</h2>
          <p>
            We keep the journey short—from a nearby farm to your kitchen, with
            care at every step.
          </p>
          <div className="steps">
            {[
              [
                "01",
                "Choose your vegetables",
                "Browse today's fresh stock and add what you need.",
              ],
              [
                "02",
                "Confirm your location",
                "We'll quickly check you're within our 2 km area.",
              ],
              [
                "03",
                "We pack it fresh",
                "Your order is sorted, checked and carefully packed.",
              ],
              [
                "04",
                "Delivered to your door",
                "Receive your vegetables in around 30–45 minutes.",
              ],
            ].map(([number, title, text]) => (
              <div className="step" key={number}>
                <span>{number}</span>
                <p>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell cta-band">
        <div>
          <span className="kicker">READY WHEN YOU ARE</span>
          <h2>Shop today&apos;s harvest</h2>
          <p>
            Fresh stock updates every morning. Order before 6 PM for same-day
            delivery.
          </p>
        </div>
        <div className="cta-actions">
          <button className="primary-button" onClick={() => navigate("/shop")}>
            Start shopping <Icon name="arrow" />
          </button>
          <button
            className="text-button"
            onClick={() => navigate("/service-area")}
          >
            Check service area
          </button>
        </div>
      </section>
    </main>
  )
}
