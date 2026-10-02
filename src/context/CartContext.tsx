import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Product } from "../services/types"

export type CartLine = {
  product: Product
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  cartCount: number
  subtotal: number
  deliveryFee: number
  total: number
  setQuantity: (productId: number, quantity: number, product?: Product) => void
  addProduct: (product: Product) => void
  clearCart: () => void
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const STORAGE_KEY = "bagate_cart"
const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as CartLine[] : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    setLines(loadCart())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const setQuantity = useCallback(
    (productId: number, quantity: number, product?: Product) => {
      setLines((current) => {
        const nextQty = Math.max(0, quantity)
        if (nextQty === 0) {
          return current.filter((line) => line.product.id !== productId)
        }
        const existing = current.find((line) => line.product.id === productId)
        if (existing) {
          return current.map((line) =>
            line.product.id === productId
              ? { ...line, quantity: nextQty }
              : line,
          )
        }
        if (!product) return current
        return [...current, { product, quantity: nextQty }]
      })
    },
    [],
  )

  const addProduct = useCallback((product: Product) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const cartCount = lines.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = lines.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    )
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 30
    return {
      lines,
      cartCount,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      setQuantity,
      addProduct,
      clearCart,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
    }
  }, [lines, cartOpen, setQuantity, addProduct, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
