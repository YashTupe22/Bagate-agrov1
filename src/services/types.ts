export type Product = {
  id: number
  name: string
  unit: string
  price: number
  image: string
  tag: string
  category: string
  description: string
  stock: number
  origin: string
}

export type OrderItem = {
  productId: number
  name: string
  unit: string
  price: number
  quantity: number
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled"

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  createdAt: number
  address: {
    name: string
    phone: string
    line1: string
    line2?: string
    area: string
    landmark?: string
    pincode: string
    lat?: number
    lng?: number
  }
  payment: {
    method: "cod" | "upi" | "card"
    status: "pending" | "paid" | "failed"
    transactionId?: string
  }
  timeline: {
    status: OrderStatus
    at: number
    note: string
  }[]
}

export type UserProfile = {
  uid: string
  name: string
  email: string
  phone?: string
  addresses: {
    id: string
    label: string
    line1: string
    line2?: string
    area: string
    pincode: string
    isDefault: boolean
  }[]
}

export type ServiceAreaResult = {
  available: boolean
  distanceKm: number
  message: string
  address?: string
}

export type CheckoutContact = {
  name: string
  phone: string
  email: string
  flat: string
  wing: string
  society: string
  area: string
  landmark: string
  pincode: string
}
