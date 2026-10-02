type HomeRoute = { name: "home" }
type LocationRoute = { name: "location" }
type ShopRoute = { name: "shop" }
type CategoriesRoute = { name: "categories" }
type SearchRoute = {
  name: "search"
  q: string
}
type ProductRoute = {
  name: "product"
  id: number
}
type CartRoute = { name: "cart" }
type CheckoutContactRoute = { name: "checkoutContact" }
type CheckoutPaymentRoute = {
  name: "checkoutPayment"
  orderId?: string
}
type OrderConfirmationRoute = {
  name: "orderConfirmation"
  orderId: string
}
type OrderTrackingRoute = {
  name: "orderTracking"
  orderId?: string
}
type AccountRoute = { name: "account" }
type ServiceAreaRoute = { name: "serviceArea" }
type AuthRoute = {
  name: "auth"
  mode: "signin" | "signup" | "forgot"
}
type AdminRoute = { name: "admin" }
type NotFoundRoute = { name: "notFound" }

export type ViewRoute = HomeRoute | LocationRoute | ShopRoute | CategoriesRoute | SearchRoute | ProductRoute | CartRoute | CheckoutContactRoute | CheckoutPaymentRoute | OrderConfirmationRoute | OrderTrackingRoute | AccountRoute | ServiceAreaRoute | AuthRoute | AdminRoute | NotFoundRoute

export function parseRoute(pathname: string, search: string): ViewRoute {
  const clean = pathname.replace(/\/+$/, "") || "/home"
  const params = new URLSearchParams(search)
  const segs = clean.split("/").filter(Boolean)

  if (clean === "/" || clean === "/home") return { name: "home" }
  if (clean === "/location") return { name: "location" }
  if (clean === "/shop") return { name: "shop" }
  if (clean === "/categories") return { name: "categories" }
  if (clean === "/search") return { name: "search", q: params.get("q") ?? "" }
  if (clean === "/cart") return { name: "cart" }
  if (clean === "/checkout") return { name: "checkoutContact" }
  if (clean === "/checkout/contact") return { name: "checkoutContact" }
  if (clean === "/checkout/payment") return { name: "checkoutPayment" }
  if (clean === "/account") return { name: "account" }
  if (clean === "/service-area") return { name: "serviceArea" }
  if (clean === "/admin") return { name: "admin" }

  if (segs[0] === "product" && segs[1]) {
    const id = Number(segs[1])
    return Number.isFinite(id) ? { name: "product", id } : { name: "notFound" }
  }

  if (segs[0] === "order") {
    if (segs[1] === "confirmation" && segs[2]) {
      return { name: "orderConfirmation", orderId: segs[2] }
    }
    if (segs[1] === "tracking") {
      return segs[2]
        ? { name: "orderTracking", orderId: segs[2] }
        : { name: "orderTracking" }
    }
  }

  if (clean === "/auth" || clean === "/auth/signin")
    return { name: "auth", mode: "signin" }
  if (clean === "/auth/signup") return { name: "auth", mode: "signup" }
  if (clean === "/auth/forgot-password") return { name: "auth", mode: "forgot" }

  return { name: "notFound" }
}

export function routeToPath(route: ViewRoute): string {
  switch (route.name) {
    case "home":
      return "/home"
    case "location":
      return "/location"
    case "shop":
      return "/shop"
    case "categories":
      return "/categories"
    case "search":
      return `/search?q=${encodeURIComponent(route.q)}`
    case "product":
      return `/product/${route.id}`
    case "cart":
      return "/cart"
    case "checkoutContact":
      return "/checkout/contact"
    case "checkoutPayment":
      return "/checkout/payment"
    case "orderConfirmation":
      return `/order/confirmation/${route.orderId}`
    case "orderTracking":
      return route.orderId
        ? `/order/tracking/${route.orderId}`
        : "/order/tracking"
    case "account":
      return "/account"
    case "serviceArea":
      return "/service-area"
    case "auth":
      if (route.mode === "signup") return "/auth/signup"
      if (route.mode === "forgot") return "/auth/forgot-password"
      return "/auth"
    case "admin":
      return "/admin"
    default:
      return "/home"
  }
}
