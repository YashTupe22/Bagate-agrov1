import type { Product } from "./types"
import { getFirebase } from "../firebase/config"

const photos = {
  hero: "https://images.unsplash.com/photo-1723347101054-c246b0034f11?auto=format&fit=crop&w=1400&q=88",
  tomato:
    "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=700&q=85",
  spinach:
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=85",
  cauliflower:
    "https://images.unsplash.com/photo-1566842600175-97dca489844f?auto=format&fit=crop&w=700&q=85",
  onion:
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85",
  pepper:
    "https://images.unsplash.com/photo-1627176348076-5cf26fb45de7?auto=format&fit=crop&w=700&q=85",
  basket:
    "https://images.unsplash.com/photo-1627989147125-a004d05946d3?auto=format&fit=crop&w=700&q=85",
}

export const photosMap = photos

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Farm fresh tomatoes",
    unit: "1 kg",
    price: 40,
    image: photos.tomato,
    tag: "Fresh today",
    category: "Everyday vegetables",
    description:
      "Juicy, vine-ripened tomatoes from farms near Bagate Agro. Perfect for curries, salads and daily cooking. Handpicked every morning.",
    stock: 48,
    origin: "Local farms within 8 km",
  },
  {
    id: 2,
    name: "Tender spinach",
    unit: "1 bunch",
    price: 25,
    image: photos.spinach,
    tag: "Just arrived",
    category: "Leafy vegetables",
    description:
      "Fresh palak bunches washed and sorted the same day. Rich in iron and ideal for dal, paratha and smoothies.",
    stock: 32,
    origin: "Bagate Agro partner farms",
  },
  {
    id: 3,
    name: "Local cauliflower",
    unit: "1 piece",
    price: 45,
    image: photos.cauliflower,
    tag: "Fresh today",
    category: "Everyday vegetables",
    description:
      "Firm, white cauliflower heads harvested this morning. Great for gobi sabzi, fritters and roasts.",
    stock: 20,
    origin: "Nearby market gardens",
  },
  {
    id: 4,
    name: "Red onions",
    unit: "1 kg",
    price: 36,
    image: photos.onion,
    tag: "In stock",
    category: "Roots & bulbs",
    description:
      "Medium-sized red onions with sharp flavour. Cleaned and ready for everyday Indian cooking.",
    stock: 60,
    origin: "Local wholesale mandi",
  },
  {
    id: 5,
    name: "Green capsicum",
    unit: "500 g",
    price: 38,
    image: photos.pepper,
    tag: "Limited stock",
    category: "Everyday vegetables",
    description:
      "Crisp green capsicums for stir-fries, pizzas and salads. Stored cool until delivery.",
    stock: 12,
    origin: "Neighbouring farms",
  },
  {
    id: 6,
    name: "Daily vegetable basket",
    unit: "1 basket",
    price: 220,
    image: photos.basket,
    tag: "Best value",
    category: "Fresh baskets",
    description:
      "A balanced mix of seasonal vegetables for a family of four. Includes leafy greens, tomatoes, onions and one seasonal special.",
    stock: 15,
    origin: "Mixed local harvest",
  },
]

let seeded = false

export async function seedProductsIfEmpty(): Promise<void> {
  const fb = await getFirebase()
  if (!fb || seeded) return
  try {
    const { collection, getDocs, doc, setDoc } = await import(
      "firebase/firestore"
    )
    const snap = await getDocs(collection(fb.db, "products"))
    if (!snap.empty) {
      seeded = true
      return
    }
    for (const product of mockProducts) {
      await setDoc(doc(fb.db, "products", String(product.id)), product)
    }
    seeded = true
  } catch (err) {
    console.warn("[products] Firestore seed skipped:", err)
  }
}

export async function getProducts(): Promise<Product[]> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { collection, getDocs } = await import("firebase/firestore")
      const snap = await getDocs(collection(fb.db, "products"))
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const data = d.data() as Omit<Product, "id"> & {
            id?: number | string
          }
          return {
            ...data,
            id: Number(d.id),
            price: Number(data.price ?? 0),
            stock: Number(data.stock ?? 0),
          } as Product
        })
      }
    } catch (err) {
      console.warn("[products] Firestore read failed, using local data:", err)
    }
  }
  return mockProducts
}

export async function getProduct(id: number): Promise<Product | null> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, getDoc } = await import("firebase/firestore")
      const snap = await getDoc(doc(fb.db, "products", String(id)))
      if (snap.exists()) {
        const data = snap.data() as Omit<Product, "id">
        return { ...data, id } as Product
      }
    } catch (err) {
      console.warn("[product] Firestore read failed:", err)
    }
  }
  const list = await getProducts()
  return list.find((p) => p.id === id) ?? null
}

export async function saveProduct(product: Product): Promise<Product> {
  const clean: Product = {
    ...product,
    price: Number(product.price) || 0,
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
  }
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, setDoc } = await import("firebase/firestore")
      await setDoc(doc(fb.db, "products", String(clean.id)), clean)
      return clean
    } catch (err) {
      console.warn("[products] Firestore save failed:", err)
    }
  }
  const idx = mockProducts.findIndex((p) => p.id === clean.id)
  if (idx >= 0) {
    mockProducts[idx] = clean
  } else {
    mockProducts.push(clean)
  }
  return clean
}

export async function deleteProduct(id: number): Promise<void> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, deleteDoc } = await import("firebase/firestore")
      await deleteDoc(doc(fb.db, "products", String(id)))
    } catch (err) {
      console.warn("[products] Firestore delete failed:", err)
    }
  }
  const idx = mockProducts.findIndex((p) => p.id === id)
  if (idx >= 0) mockProducts.splice(idx, 1)
}

export function nextProductId(list: Product[]): number {
  const ids = list.map((p) => Number(p.id)).filter((n) => Number.isFinite(n))
  return (ids.length ? Math.max(...ids) : 0) + 1
}

export async function searchProducts(query: string): Promise<Product[]> {
  const list = await getProducts()
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  )
}
