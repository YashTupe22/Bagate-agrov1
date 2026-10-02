import type { CheckoutContact, Order, OrderItem, OrderStatus } from "./types"
import { getFirebase } from "../firebase/config"

const STORAGE_KEY = "bagate_orders"

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as Order[] : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

const seedOrders: Order[] = [
  {
    id: "BA1048",
    userId: "demo-user",
    items: [
      {
        productId: 1,
        name: "Farm fresh tomatoes",
        unit: "1 kg",
        price: 40,
        quantity: 2,
      },
      {
        productId: 2,
        name: "Tender spinach",
        unit: "1 bunch",
        price: 25,
        quantity: 1,
      },
    ],
    subtotal: 105,
    deliveryFee: 30,
    total: 135,
    status: "preparing",
    createdAt: Date.now() - 45 * 60 * 1000,
    address: {
      name: "Neha Patil",
      phone: "9876543210",
      line1: "12, Shree Nagar",
      area: "Near Bagate Agro",
      landmark: "Opposite school",
      pincode: "411038",
    },
    payment: { method: "upi", status: "paid", transactionId: "UPI-DEMO-1048" },
    timeline: [
      {
        status: "pending",
        at: Date.now() - 45 * 60 * 1000,
        note: "Order placed",
      },
      {
        status: "confirmed",
        at: Date.now() - 40 * 60 * 1000,
        note: "Order confirmed by store",
      },
      {
        status: "preparing",
        at: Date.now() - 20 * 60 * 1000,
        note: "Being packed fresh",
      },
    ],
  },
  {
    id: "BA1047",
    userId: "demo-user",
    items: [
      {
        productId: 4,
        name: "Red onions",
        unit: "1 kg",
        price: 36,
        quantity: 1,
      },
      {
        productId: 5,
        name: "Green capsicum",
        unit: "500 g",
        price: 38,
        quantity: 1,
      },
    ],
    subtotal: 74,
    deliveryFee: 30,
    total: 104,
    status: "out-for-delivery",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    address: {
      name: "Rohan Kulkarni",
      phone: "9822001122",
      line1: "45, Sai Residency",
      area: "Bagate Road",
      pincode: "411038",
    },
    payment: { method: "cod", status: "pending" },
    timeline: [
      {
        status: "pending",
        at: Date.now() - 2 * 60 * 60 * 1000,
        note: "Order placed",
      },
      {
        status: "confirmed",
        at: Date.now() - 110 * 60 * 1000,
        note: "Order confirmed",
      },
      {
        status: "preparing",
        at: Date.now() - 90 * 60 * 1000,
        note: "Packed and ready",
      },
      {
        status: "out-for-delivery",
        at: Date.now() - 30 * 60 * 1000,
        note: "Left the store",
      },
    ],
  },
]

function ensureSeedLocal() {
  const existing = loadOrders()
  if (existing.length === 0) {
    saveOrders(seedOrders)
  }
}

function nextOrderId(existing: Order[]): string {
  const nums = existing
    .map((o) => Number(String(o.id).replace("BA", "")))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 1044) + 1
  return `BA${next}`
}

function normalizeOrder(id: string, data: Record<string, unknown>): Order {
  return {
    ...data as Omit<Order, "id">,
    id,
    createdAt: Number(data.createdAt ?? Date.now()),
  }
}

export async function listOrders(userId: string): Promise<Order[]> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { collection, query, where, getDocs, orderBy } = await import(
        "firebase/firestore"
      )
      const q = query(
        collection(fb.db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        return snap.docs.map((d) =>
          normalizeOrder(d.id, d.data() as Record<string, unknown>),
        )
      }
    } catch (err) {
      console.warn("[orders] Firestore list failed, using local data:", err)
    }
  }
  ensureSeedLocal()
  return loadOrders().filter((o) => o.userId === userId)
}

export async function listAllOrders(limit = 100): Promise<Order[]> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const {
        collection,
        query,
        getDocs,
        orderBy,
        limit: limitTo,
      } = await import("firebase/firestore")
      const q = query(
        collection(fb.db, "orders"),
        orderBy("createdAt", "desc"),
        limitTo(limit),
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) =>
        normalizeOrder(d.id, d.data() as Record<string, unknown>),
      )
    } catch (err) {
      console.warn("[orders] Firestore admin list failed:", err)
    }
  }
  ensureSeedLocal()
  return loadOrders().sort((a, b) => b.createdAt - a.createdAt)
}

export async function subscribeAllOrders(
  onUpdate: (orders: Order[]) => void,
): Promise<() => void> {
  const localFallback = () => {
    ensureSeedLocal()
    onUpdate(loadOrders().sort((a, b) => b.createdAt - a.createdAt))
  }
  const fb = await getFirebase()
  if (!fb) {
    localFallback()
    return () => undefined
  }
  try {
    const {
      collection,
      query,
      orderBy,
      limit: limitTo,
      onSnapshot,
    } = await import("firebase/firestore")
    const q = query(
      collection(fb.db, "orders"),
      orderBy("createdAt", "desc"),
      limitTo(100),
    )
    return onSnapshot(
      q,
      (snap) =>
        onUpdate(
          snap.docs.map((d) =>
            normalizeOrder(d.id, d.data() as Record<string, unknown>),
          ),
        ),
      (err) => {
        console.warn("[orders] admin subscribe failed:", err)
        localFallback()
      },
    )
  } catch (err) {
    console.warn("[orders] admin subscribe failed:", err)
    localFallback()
    return () => undefined
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, getDoc } = await import("firebase/firestore")
      const snap = await getDoc(doc(fb.db, "orders", orderId))
      if (snap.exists()) {
        return normalizeOrder(snap.id, snap.data() as Record<string, unknown>)
      }
    } catch (err) {
      console.warn("[order] Firestore read failed:", err)
    }
  }
  ensureSeedLocal()
  return loadOrders().find((o) => o.id === orderId) ?? null
}

export async function createOrder(input: {
  userId: string
  items: OrderItem[]
  contact: CheckoutContact
  paymentMethod: "cod" | "upi" | "card"
}): Promise<Order> {
  const fb = await getFirebase()
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const deliveryFee = subtotal >= 299 ? 0 : 30
  const now = Date.now()

  const order: Order = {
    id: "",
    userId: input.userId,
    items: input.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: "confirmed",
    createdAt: now,
    address: {
      name: input.contact.name,
      phone: input.contact.phone,
      line1: `Flat ${input.contact.flat}, Wing ${input.contact.wing}`,
      line2: input.contact.society,
      area: input.contact.area,
      landmark: input.contact.landmark || undefined,
      pincode: input.contact.pincode,
    },
    payment: {
      method: input.paymentMethod,
      status: input.paymentMethod === "cod" ? "pending" : "paid",
      transactionId:
        input.paymentMethod === "cod"
          ? undefined
          : `TXN-${Date.now().toString().slice(-8)}`,
    },
    timeline: [
      { status: "pending", at: now, note: "Order placed" },
      { status: "confirmed", at: now, note: "Order confirmed by store" },
    ],
  }

  if (fb) {
    try {
      const { collection, addDoc, doc, updateDoc } = await import(
        "firebase/firestore"
      )
      const ref = await addDoc(collection(fb.db, "orders"), order)
      await updateDoc(doc(fb.db, "orders", ref.id), { id: ref.id })
      const saved: Order = { ...order, id: ref.id }
      const local = loadOrders()
      saveOrders([saved, ...local.filter((o) => o.id !== saved.id)])
      return saved
    } catch (err) {
      console.warn("[orders] Firestore create failed, saving locally:", err)
    }
  }

  ensureSeedLocal()
  const existing = loadOrders()
  order.id = nextOrderId(existing)
  saveOrders([order, ...existing])
  return order
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string,
) {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, updateDoc, arrayUnion, getDoc } = await import(
        "firebase/firestore"
      )
      const ref = doc(fb.db, "orders", orderId)
      const snap = await getDoc(ref)
      const prev = snap.exists() ? snap.data() as Order : null
      const timeline = [
        ...(prev?.timeline ?? []),
        { status, at: Date.now(), note },
      ]
      await updateDoc(ref, { status, timeline })
      const local = loadOrders().map((o) =>
        o.id === orderId ? { ...o, status, timeline } : o,
      )
      saveOrders(local)
      return
    } catch (err) {
      console.warn("[orders] Firestore update failed:", err)
    }
  }
  ensureSeedLocal()
  const orders = loadOrders().map((o) =>
    o.id === orderId
      ? {
          ...o,
          status,
          timeline: [...o.timeline, { status, at: Date.now(), note }],
        }
      : o,
  )
  saveOrders(orders)
}

export function statusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    "out-for-delivery": "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }
  return map[status]
}
