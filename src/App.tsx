import { useMemo, useState, type ReactNode } from "react";

type View = "home" | "shop" | "admin";
type IconName =
  | "arrow"
  | "bag"
  | "box"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "grid"
  | "leaf"
  | "location"
  | "menu"
  | "minus"
  | "orders"
  | "plus"
  | "search"
  | "settings"
  | "truck"
  | "user";

const photos = {
  hero: "https://images.unsplash.com/photo-1723347101054-c246b0034f11?auto=format&fit=crop&w=1400&q=88",
  tomato: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=700&q=85",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=85",
  cauliflower: "https://images.unsplash.com/photo-1566842600175-97dca489844f?auto=format&fit=crop&w=700&q=85",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85",
  pepper: "https://images.unsplash.com/photo-1627176348076-5cf26fb45de7?auto=format&fit=crop&w=700&q=85",
  basket: "https://images.unsplash.com/photo-1627989147125-a004d05946d3?auto=format&fit=crop&w=700&q=85",
};

const products = [
  { id: 1, name: "Farm fresh tomatoes", unit: "1 kg", price: 40, image: photos.tomato, tag: "Fresh today" },
  { id: 2, name: "Tender spinach", unit: "1 bunch", price: 25, image: photos.spinach, tag: "Just arrived" },
  { id: 3, name: "Local cauliflower", unit: "1 piece", price: 45, image: photos.cauliflower, tag: "Fresh today" },
  { id: 4, name: "Red onions", unit: "1 kg", price: 36, image: photos.onion, tag: "In stock" },
  { id: 5, name: "Green capsicum", unit: "500 g", price: 38, image: photos.pepper, tag: "Limited stock" },
  { id: 6, name: "Daily vegetable basket", unit: "1 basket", price: 220, image: photos.basket, tag: "Best value" },
];

const categories = [
  { name: "Leafy greens", count: "8 items", tone: "leafy", symbol: "⌁" },
  { name: "Everyday veg", count: "14 items", tone: "orange", symbol: "◒" },
  { name: "Roots & bulbs", count: "9 items", tone: "purple", symbol: "◇" },
  { name: "Fresh baskets", count: "4 combos", tone: "yellow", symbol: "▱" },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    bag: <><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 7 8 4v10l8-4V7M8 5l8 4" /></>,
    chart: <><path d="M4 19V9M10 19V4M16 19v-7M22 19H2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    leaf: <><path d="M5 20c1-9 6-15 15-16 0 9-5 15-13 15" /><path d="M6 19c3-4 6-7 11-10" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    minus: <path d="M5 12h14" />,
    orders: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    plus: <><path d="M5 12h14M12 5v14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.5a7 7 0 0 0-1-2l1-2-2-2-2 1a7 7 0 0 0-2 0L9 3 6 4 5.5 6a7 7 0 0 0-1 2L2 9v3l2 .5a7 7 0 0 0 1 2l-1 2 2 2 2-1a7 7 0 0 0 2 1l.5 2.5h3l.5-2.5a7 7 0 0 0 2-1l2 1 2-2-1-2a7 7 0 0 0 1-1Z" /></>,
    truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 4-7 8-7s7 2 8 7" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <button className={`logo ${light ? "logo-light" : ""}`} aria-label="Bagate Agro home">
      <span className="logo-mark"><Icon name="leaf" size={22} /></span>
      <span><strong>Bagate</strong><small>AGRO</small></span>
    </button>
  );
}

function ProductCard({ product, quantity, onAdd, onQuantity }: {
  product: (typeof products)[number];
  quantity: number;
  onAdd: () => void;
  onQuantity: (value: number) => void;
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="fresh-pill"><span />{product.tag}</span>
        <button className="quick-view" aria-label={`View ${product.name}`}><Icon name="arrow" /></button>
      </div>
      <div className="product-copy">
        <p className="product-unit">{product.unit}</p>
        <h3>{product.name}</h3>
        <div className="product-buy">
          <strong>₹{product.price}</strong>
          {quantity === 0 ? (
            <button className="add-button" onClick={onAdd}>Add <Icon name="plus" size={17} /></button>
          ) : (
            <div className="stepper">
              <button aria-label="Remove one" onClick={() => onQuantity(quantity - 1)}><Icon name="minus" size={15} /></button>
              <span>{quantity}</span>
              <button aria-label="Add one" onClick={() => onQuantity(quantity + 1)}><Icon name="plus" size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Header({ view, setView, cartCount, openCart, openLocation }: {
  view: View;
  setView: (view: View) => void;
  cartCount: number;
  openCart: () => void;
  openLocation: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="announcement"><Icon name="truck" size={16} /> Free delivery on orders above ₹299 <span>•</span> Open today until 8:30 PM</div>
      <header className="site-header">
        <div className="header-inner">
          <div onClick={() => setView("home")}><Logo /></div>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>Home</button>
            <button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>Shop</button>
            <button onClick={() => setView("shop")}>Categories</button>
            <button onClick={() => setView("admin")}>For admin</button>
          </nav>
          <div className="header-actions">
            <button className="delivery-location" onClick={openLocation}>
              <Icon name="location" size={18} />
              <span><small>Delivering to</small><strong>Near Bagate Agro</strong></span>
              <Icon name="chevron" size={14} />
            </button>
            <button className="round-action search-action" aria-label="Search" onClick={() => setView("shop")}><Icon name="search" /></button>
            <button className="round-action" aria-label="Account"><Icon name="user" /></button>
            <button className="cart-action" onClick={openCart} aria-label={`Cart with ${cartCount} items`}><Icon name="bag" /><span>{cartCount}</span></button>
            <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Open menu"><Icon name={menu ? "close" : "menu"} /></button>
          </div>
        </div>
        {menu && <div className="mobile-nav"><button onClick={() => {setView("home"); setMenu(false)}}>Home</button><button onClick={() => {setView("shop"); setMenu(false)}}>Shop vegetables</button><button onClick={() => {setView("admin"); setMenu(false)}}>Admin dashboard</button></div>}
      </header>
    </>
  );
}

function Home({ quantities, setQuantity, setView, openLocation }: {
  quantities: Record<number, number>;
  setQuantity: (id: number, quantity: number) => void;
  setView: (view: View) => void;
  openLocation: () => void;
}) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Grown nearby. Delivered fresh.</div>
          <h1>Fresh vegetables.<br />From our farm to <em>your home.</em></h1>
          <p>Handpicked every morning and delivered to your doorstep within 2 km of Bagate Agro.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setView("shop")}>Shop fresh vegetables <Icon name="arrow" /></button>
            <button className="text-button" onClick={openLocation}><Icon name="location" /> Check delivery area</button>
          </div>
          <div className="trust-row">
            <div className="avatars"><span>BA</span><span>SK</span><span>RP</span></div>
            <p><strong>4.9/5 from local families</strong><small>Fresh produce, every single day</small></p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo"><img src={photos.hero} alt="Basket of fresh local vegetables" /></div>
          <div className="floating-card harvest-card"><span className="float-icon"><Icon name="leaf" /></span><p><strong>Morning harvest</strong><small>Picked at 6:00 AM today</small></p></div>
          <div className="floating-card delivery-card"><span className="float-icon amber"><Icon name="clock" /></span><p><strong>30–45 min delivery</strong><small>Within our 2 km area</small></p></div>
        </div>
      </section>

      <section className="promise-bar">
        <div><span><Icon name="location" /></span><p><strong>Hyperlocal delivery</strong><small>Within 2 km of Bagate Agro</small></p></div>
        <div><span><Icon name="leaf" /></span><p><strong>Fresh every morning</strong><small>Direct from nearby farms</small></p></div>
        <div><span><Icon name="box" /></span><p><strong>Carefully packed</strong><small>Clean, sorted and ready</small></p></div>
        <div><span><Icon name="check" /></span><p><strong>Fair local prices</strong><small>No unnecessary markups</small></p></div>
      </section>

      <section className="section-shell category-section">
        <div className="section-heading">
          <div><span className="kicker">SHOP BY CATEGORY</span><h2>What are you cooking today?</h2></div>
          <button className="view-all" onClick={() => setView("shop")}>View all categories <Icon name="arrow" size={18} /></button>
        </div>
        <div className="category-grid">
          {categories.map((category) => <button key={category.name} className={`category-card ${category.tone}`} onClick={() => setView("shop")}><span className="category-symbol">{category.symbol}</span><span><strong>{category.name}</strong><small>{category.count}</small></span><Icon name="chevron" size={18} /></button>)}
        </div>
      </section>

      <section className="section-shell products-section">
        <div className="section-heading">
          <div><span className="kicker">PICKED THIS MORNING</span><h2>Today&apos;s fresh picks</h2><p>Seasonal vegetables, handpicked for quality and freshness.</p></div>
          <button className="view-all" onClick={() => setView("shop")}>Shop all fresh produce <Icon name="arrow" size={18} /></button>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} quantity={quantities[product.id] || 0} onAdd={() => setQuantity(product.id, 1)} onQuantity={(q) => setQuantity(product.id, q)} />)}
        </div>
      </section>

      <section className="how-section">
        <div className="how-image"><img src={photos.basket} alt="Fresh vegetables prepared for delivery" /><div className="image-note"><Icon name="leaf" /><span><strong>From local farms</strong><small>Less travel. More freshness.</small></span></div></div>
        <div className="how-copy"><span className="kicker">SIMPLE & LOCAL</span><h2>Freshness, without the fuss.</h2><p>We keep the journey short—from a nearby farm to your kitchen, with care at every step.</p>
          <div className="steps">
            {[
              ["01", "Choose your vegetables", "Browse today's fresh stock and add what you need."],
              ["02", "Confirm your location", "We'll quickly check you're within our 2 km area."],
              ["03", "We pack it fresh", "Your order is sorted, checked and carefully packed."],
              ["04", "Delivered to your door", "Receive your vegetables in around 30–45 minutes."],
            ].map(([number, title, text]) => <div className="step" key={number}><span>{number}</span><p><strong>{title}</strong><small>{text}</small></p></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}

function Shop({ quantities, setQuantity }: { quantities: Record<number, number>; setQuantity: (id: number, quantity: number) => void }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <main className="shop-page section-shell">
      <div className="shop-intro"><span className="kicker">FRESH FROM THE FARM</span><h1>Shop vegetables</h1><p>Everything available today, picked and packed for local delivery.</p></div>
      <div className="catalog-toolbar">
        <label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tomatoes, spinach..." /></label>
        <button className="filter-button">All categories <Icon name="chevron" size={16} /></button>
        <button className="filter-button">Available today <Icon name="chevron" size={16} /></button>
        <button className="filter-button sort">Sort: Recommended <Icon name="chevron" size={16} /></button>
      </div>
      <div className="catalog-layout">
        <aside className="filter-panel"><strong>Categories</strong>{["All fresh produce", "Leafy vegetables", "Everyday vegetables", "Roots & bulbs", "Fresh baskets"].map((item, index) => <button className={index === 0 ? "selected" : ""} key={item}><span>{item}</span><small>{index === 0 ? 28 : 6 + index}</small></button>)}<div className="filter-note"><Icon name="location" /><p><strong>Local delivery only</strong><small>We currently deliver within 2 km of our store.</small></p></div></aside>
        <div><div className="results-label"><span>{filtered.length} fresh items</span><small>Stock updated 8 minutes ago</small></div><div className="product-grid shop-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} quantity={quantities[product.id] || 0} onAdd={() => setQuantity(product.id, 1)} onQuantity={(q) => setQuantity(product.id, q)} />)}</div></div>
      </div>
    </main>
  );
}

const orders = [
  ["#BA1048", "Neha Patil", "5 items", "₹486", "Preparing", "10:42 AM"],
  ["#BA1047", "Rohan Kulkarni", "3 items", "₹312", "Confirmed", "10:31 AM"],
  ["#BA1046", "Asha More", "7 items", "₹628", "Out for delivery", "10:18 AM"],
  ["#BA1045", "Sunil Jadhav", "4 items", "₹375", "Pending", "10:04 AM"],
  ["#BA1044", "Meera Shah", "6 items", "₹540", "Delivered", "9:46 AM"],
];

function Admin({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div onClick={() => setView("home")}><Logo light /></div>
        <nav><span>OPERATIONS</span><button className="selected"><Icon name="grid" /> Overview</button><button><Icon name="orders" /> Orders <b>6</b></button><button><Icon name="box" /> Products</button><button><Icon name="chart" /> Inventory <b className="warning">7</b></button><span>MANAGE</span><button><Icon name="user" /> Customers</button><button><Icon name="location" /> Delivery area</button><button><Icon name="settings" /> Settings</button></nav>
        <div className="admin-profile"><span>AM</span><p><strong>Akash More</strong><small>Store admin</small></p><Icon name="chevron" size={16} /></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><div><small>Wednesday, 24 July</small><h1>Good morning, Akash</h1><p>Here&apos;s what&apos;s happening at Bagate Agro today.</p></div><div><button className="admin-search"><Icon name="search" /></button><button className="store-open"><span /> Store open</button><button className="primary-button"><Icon name="plus" /> Add product</button></div></header>
        <section className="metrics">
          {[
            ["Orders today", "24", "+12% from yesterday", "orders"],
            ["Revenue today", "₹8,420", "+8.4% from yesterday", "chart"],
            ["Pending orders", "6", "Needs your attention", "clock"],
            ["Out for delivery", "4", "All running on time", "truck"],
            ["Low stock", "7", "3 items critical", "box"],
          ].map(([label, value, note, icon], index) => <article className="metric-card" key={label}><div className={`metric-top metric-${index}`}><span><Icon name={icon as IconName} /></span>{index < 2 && <b>↗</b>}</div><p>{label}</p><strong>{value}</strong><small className={index === 2 || index === 4 ? "attention" : ""}>{note}</small></article>)}
        </section>
        <section className="admin-grid">
          <article className="orders-card">
            <div className="card-heading"><div><h2>Today&apos;s orders</h2><p>24 orders • ₹8,420 total</p></div><button>View all orders <Icon name="arrow" size={17} /></button></div>
            <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Time</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order[0]}><td><strong>{order[0]}</strong></td><td>{order[1]}</td><td>{order[2]}</td><td><strong>{order[3]}</strong></td><td><span className={`status ${order[4].toLowerCase().replaceAll(" ", "-")}`}><i />{order[4]}</span></td><td>{order[5]}</td><td><button className="row-action"><Icon name="chevron" size={16} /></button></td></tr>)}</tbody></table></div>
          </article>
          <article className="sales-card"><div className="card-heading"><div><h2>Sales overview</h2><p>Last 7 days</p></div><button>This week <Icon name="chevron" size={14} /></button></div><div className="chart-total"><strong>₹48,260</strong><span>↗ 14.2%</span></div><div className="chart"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 500 150" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3d7d4a" stopOpacity=".24" /><stop offset="100%" stopColor="#3d7d4a" stopOpacity="0" /></linearGradient></defs><path className="area" d="M0 120 C50 105 55 100 90 108 S160 78 190 87 S250 65 280 72 S340 35 380 48 S440 10 500 22 V150 H0Z" /><path className="line" d="M0 120 C50 105 55 100 90 108 S160 78 190 87 S250 65 280 72 S340 35 380 48 S440 10 500 22" /></svg><div className="chart-labels"><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span></div></div></article>
        </section>
        <section className="lower-admin">
          <article className="stock-card"><div className="card-heading"><div><h2>Low stock alerts</h2><p>7 products need attention</p></div><button>View inventory <Icon name="arrow" size={17} /></button></div>{products.slice(0, 3).map((product, index) => <div className="stock-row" key={product.id}><img src={product.image} alt="" /><p><strong>{product.name}</strong><small>{index === 0 ? "2 kg remaining" : `${4 + index} units remaining`}</small></p><span className={index === 0 ? "critical" : ""}>{index === 0 ? "Critical" : "Low"}</span><button>Restock</button></div>)}</article>
          <article className="delivery-zone"><div className="card-heading"><div><h2>Delivery area</h2><p>Live service overview</p></div><button><Icon name="settings" size={17} /> Manage</button></div><div className="map-visual"><div className="roads r1" /><div className="roads r2" /><div className="roads r3" /><div className="radius"><span><Icon name="leaf" size={18} /></span></div><b>2 km radius</b></div><div className="zone-summary"><p><strong>4</strong><small>Active deliveries</small></p><p><strong>2.0 km</strong><small>Service radius</small></p><p><strong>₹30</strong><small>Delivery fee</small></p></div></article>
        </section>
      </main>
    </div>
  );
}

function CartDrawer({ quantities, setQuantity, close }: { quantities: Record<number, number>; setQuantity: (id: number, quantity: number) => void; close: () => void }) {
  const items = products.filter((product) => quantities[product.id] > 0);
  const subtotal = items.reduce((total, product) => total + product.price * quantities[product.id], 0);
  return <div className="overlay" onMouseDown={close}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="kicker">YOUR BASKET</span><h2>Cart <small>{items.length} items</small></h2></div><button onClick={close}><Icon name="close" /></button></header>{items.length ? <><div className="cart-progress"><p><span>You&apos;re ₹{Math.max(0, 299 - subtotal)} away from free delivery</span><strong>{Math.min(100, Math.round(subtotal / 299 * 100))}%</strong></p><div><i style={{width: `${Math.min(100, subtotal / 299 * 100)}%`}} /></div></div><div className="cart-items">{items.map((product) => <div className="cart-item" key={product.id}><img src={product.image} alt={product.name} /><p><strong>{product.name}</strong><small>{product.unit}</small><span>₹{product.price}</span></p><div className="stepper"><button onClick={() => setQuantity(product.id, quantities[product.id] - 1)}><Icon name="minus" size={14} /></button><span>{quantities[product.id]}</span><button onClick={() => setQuantity(product.id, quantities[product.id] + 1)}><Icon name="plus" size={14} /></button></div></div>)}</div><footer><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><div><span>Delivery</span><strong>{subtotal >= 299 ? "FREE" : "₹30"}</strong></div><div className="cart-total"><span>Total</span><strong>₹{subtotal + (subtotal >= 299 ? 0 : 30)}</strong></div><button className="primary-button">Continue to checkout <Icon name="arrow" /></button><small><Icon name="location" size={14} /> Delivery eligibility checked again at checkout</small></footer></> : <div className="empty-cart"><span><Icon name="bag" size={30} /></span><h3>Your basket is empty</h3><p>Add today&apos;s fresh vegetables and they&apos;ll appear here.</p><button className="primary-button" onClick={close}>Start shopping</button></div>}</aside></div>;
}

function LocationModal({ close }: { close: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const detect = () => { setStatus("loading"); window.setTimeout(() => setStatus("success"), 900); };
  return <div className="overlay modal-overlay" onMouseDown={close}><section className="location-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={close}><Icon name="close" /></button><span className="location-illustration"><Icon name={status === "success" ? "check" : "location"} size={32} /></span>{status === "success" ? <><span className="kicker">DELIVERY AVAILABLE</span><h2>Great! We deliver to you.</h2><p>Your location is within our 2 km delivery area. Fresh vegetables can reach you in 30–45 minutes.</p><div className="detected-address"><Icon name="location" /><span><strong>Current location</strong><small>0.8 km from Bagate Agro</small></span><Icon name="check" /></div><button className="primary-button full" onClick={close}>Start shopping <Icon name="arrow" /></button></> : <><span className="kicker">CHECK SERVICEABILITY</span><h2>Can we deliver to you?</h2><p>Bagate Agro currently delivers within 2 km of our store. Check your location before you start shopping.</p><button className="primary-button full" onClick={detect} disabled={status === "loading"}>{status === "loading" ? "Finding your location..." : <><Icon name="location" /> Use my current location</>}</button><div className="or"><span />or<span /></div><label className="address-input"><span>Enter address manually</span><div><Icon name="search" /><input placeholder="Area, street or landmark" /><button><Icon name="arrow" /></button></div></label><small className="privacy"><Icon name="check" size={14} /> We only use your location to check delivery availability.</small></>}</section></div>;
}

function Footer({ setView }: { setView: (view: View) => void }) {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Logo light /><p>Fresh, local vegetables delivered to homes near Bagate Agro.</p><button><Icon name="location" size={18} /> Serving within 2 km</button></div><div><strong>Shop</strong><button onClick={() => setView("shop")}>All vegetables</button><button>Today&apos;s fresh picks</button><button>Value baskets</button></div><div><strong>Help</strong><button>Delivery area</button><button>Contact us</button><button>Your orders</button></div><div className="footer-contact"><strong>Talk to us</strong><p>Need help with an order?</p><button>WhatsApp Bagate Agro <Icon name="arrow" size={17} /></button><small>Open daily • 7:00 AM–8:30 PM</small></div></div><div className="footer-bottom"><span>© 2025 Bagate Agro. Grown nearby, delivered with care.</span><div><button>Privacy</button><button>Terms</button><button onClick={() => setView("admin")}>Admin</button></div></div></footer>;
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const cartCount = useMemo(() => Object.values(quantities).reduce((sum, value) => sum + value, 0), [quantities]);
  const setQuantity = (id: number, quantity: number) => setQuantities((current) => ({ ...current, [id]: Math.max(0, quantity) }));
  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (view === "admin") return <Admin setView={navigate} />;
  return (
    <div className="app">
      <Header view={view} setView={navigate} cartCount={cartCount} openCart={() => setCartOpen(true)} openLocation={() => setLocationOpen(true)} />
      {view === "home" ? <Home quantities={quantities} setQuantity={setQuantity} setView={navigate} openLocation={() => setLocationOpen(true)} /> : <Shop quantities={quantities} setQuantity={setQuantity} />}
      <Footer setView={navigate} />
      {cartOpen && <CartDrawer quantities={quantities} setQuantity={setQuantity} close={() => setCartOpen(false)} />}
      {locationOpen && <LocationModal close={() => setLocationOpen(false)} />}
    </div>
  );
}
