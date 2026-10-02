import { useEffect, useMemo, useState } from "react"
import type { Product } from "../services/types"
import { getProducts } from "../services/products"
import Icon from "../components/Icon"

type CategoryGroup = {
  name: string
  count: number
  sample: string
  tone: string
}

const fallbackGroups: CategoryGroup[] = [
  { name: "Leafy vegetables", count: 0, sample: "", tone: "" },
  { name: "Everyday vegetables", count: 0, sample: "", tone: "orange" },
  { name: "Roots & bulbs", count: 0, sample: "", tone: "purple" },
  { name: "Fresh baskets", count: 0, sample: "", tone: "yellow" },
]

function toneFor(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("root") || n.includes("bulb")) return "purple"
  if (n.includes("basket") || n.includes("combo")) return "yellow"
  if (n.includes("everyday")) return "orange"
  return ""
}

export default function Categories({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  const groups = useMemo<CategoryGroup[]>(() => {
    if (!products.length) return fallbackGroups
    const map = new Map<string, CategoryGroup>()
    for (const product of products) {
      const existing = map.get(product.category)
      if (existing) {
        existing.count += 1
      } else {
        map.set(product.category, {
          name: product.category,
          count: 1,
          sample: product.image,
          tone: toneFor(product.category),
        })
      }
    }
    return [...map.values()]
  }, [products])

  return (
    <main className="shop-page section-shell">
      <div className="shop-intro">
        <span className="kicker">BROWSE THE CATALOGUE</span>
        <h1>Shop by category</h1>
        <p>
          Pick what you&apos;re cooking today — jump straight to the fresh
          produce you need.
        </p>
      </div>

      <div className="category-grid">
        {groups.map((group) => (
          <button
            key={group.name}
            className={`category-card ${group.tone}`}
            onClick={() =>
              navigate(`/shop?category=${encodeURIComponent(group.name)}`)
            }
          >
            <span className="category-symbol">
              {group.sample ? (
                <img
                  src={group.sample}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <Icon name="leaf" size={24} />
              )}
            </span>
            <span>
              <strong>{group.name}</strong>
              <small>
                {group.count ? `${group.count} items` : "Loading items..."}
              </small>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
        <button className="category-card" onClick={() => navigate("/shop")}>
          <span className="category-symbol">
            <Icon name="bag" size={24} />
          </span>
          <span>
            <strong>All products</strong>
            <small>Browse the full catalogue</small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
      </div>
    </main>
  )
}
