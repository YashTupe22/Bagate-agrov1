import type { ServiceAreaResult } from "./types"
import { getFirebase } from "../firebase/config"

export const STORE_LOCATION = {
  lat: 18.6850354,
  lng: 73.8380468,
  address: "Pristine Greens, Moshi, Pimpri-Chinchwad, Maharashtra 411070",
  radiusKm: 2,
}

const SERVICE_PINCODES = ["411070"]

const mockServiceAreas = [
  { area: "Pristine Greens", lat: 18.685, lng: 73.838 },
  { area: "Moshi", lat: 18.6875, lng: 73.8403 },
  { area: "Moshi Gaon", lat: 18.6826, lng: 73.8421 },
  { area: "Moshi Bazaar", lat: 18.6861, lng: 73.8355 },
  { area: "Moshi MIDC", lat: 18.6895, lng: 73.836 },
]

type GeoPoint = {
  lat: number
  lng: number
}

type AreaHints = {
  area: string
  pincode: string
}

export type GeoPositionError = "unsupported" | "denied" | "unavailable" | "timeout"

type GeoFenceExtras = {
  coords?: GeoPoint
  checkedAt?: number
  reason?: GeoPositionError
}

export type GeoFenceResult = ServiceAreaResult & GeoFenceExtras

const FENCE_KEY = "bagate_geo_fence"
export const FENCE_TTL_MS = 30 * 60 * 1000

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getStoredFence(): GeoFenceResult | null {
  try {
    const raw = localStorage.getItem(FENCE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as GeoFenceResult
    if (!saved.checkedAt || Date.now() - saved.checkedAt > FENCE_TTL_MS) {
      return null
    }
    return saved
  } catch {
    return null
  }
}

function storeFence(result: GeoFenceResult) {
  try {
    localStorage.setItem(FENCE_KEY, JSON.stringify(result))
  } catch {
    // storage unavailable — verdict just won't be cached
  }
}

export function getBrowserPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("unsupported")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "unavailable",
        ),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}

export function geoErrorMessage(reason: GeoPositionError): string {
  switch (reason) {
    case "unsupported":
      return "Location is not supported in this browser. Enter your address instead."
    case "denied":
      return "Location permission denied. Allow location access in your browser, or enter your address."
    case "timeout":
      return "Locating you took too long. Try again or enter your address."
    default:
      return "We couldn't get your location. Please enter your address."
  }
}

export async function checkGeoFence(): Promise<GeoFenceResult> {
  let point: GeoPoint
  try {
    point = await getBrowserPosition()
  } catch (reason) {
    const cached = getStoredFence()
    if (cached) return cached
    const code = reason as GeoPositionError
    return {
      available: false,
      distanceKm: 0,
      message: geoErrorMessage(code),
      reason: code,
      checkedAt: Date.now(),
    }
  }

  const res = await checkServiceability(point)
  const result: GeoFenceResult = {
    ...res,
    coords: point,
    checkedAt: Date.now(),
  }
  storeFence(result)
  return result
}

export async function reverseGeocode(
  point: GeoPoint,
): Promise<AreaHints | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&zoom=18`,
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      address?: Record<string, string | undefined>
    }
    const addr = data.address ?? {}
    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.village ||
      addr.town ||
      addr.city_district ||
      addr.city ||
      ""
    const pincode = addr.postcode || ""
    if (!area && !pincode) return null
    return { area, pincode }
  } catch {
    return null
  }
}

export async function getServiceAreas() {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { collection, getDocs } = await import("firebase/firestore")
      const snap = await getDocs(collection(fb.db, "serviceAreas"))
      if (!snap.empty) {
        return snap.docs.map(
          (d) =>
            d.data() as {
              area: string
              lat?: number
              lng?: number
            },
        )
      }
    } catch (err) {
      console.warn("[location] Firestore serviceAreas read failed:", err)
    }
  }
  return mockServiceAreas
}

export async function checkServiceability(input: {
  lat?: number
  lng?: number
  address?: string
}): Promise<ServiceAreaResult> {
  if (input.lat != null && input.lng != null) {
    const distanceKm = haversineKm(
      input.lat,
      input.lng,
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
    )
    const available = distanceKm <= STORE_LOCATION.radiusKm
    return {
      available,
      distanceKm: Number(distanceKm.toFixed(2)),
      message: available
        ? `Great! We deliver to you — you're ${distanceKm.toFixed(2)} km from our store.`
        : `You're ${distanceKm.toFixed(2)} km away — outside our ${STORE_LOCATION.radiusKm} km delivery zone for now.`,
      address: input.address,
    }
  }

  if (input.address) {
    const text = input.address.toLowerCase()
    const pincode = text.match(/\b\d{6}\b/)?.[0] ?? ""
    const areas = await getServiceAreas()
    const known =
      (pincode !== "" && SERVICE_PINCODES.includes(pincode)) ||
      text.includes("moshi") ||
      text.includes("bagate") ||
      areas.some((a) => a.area && text.includes(a.area.toLowerCase()))
    if (known) {
      return {
        available: true,
        distanceKm: 0.8,
        message:
          "Great! We deliver to you. Fresh vegetables can reach you in 30–45 minutes.",
        address: input.address,
      }
    }
    return {
      available: false,
      distanceKm: 3.5,
      message:
        "This address looks outside our 2 km delivery area. We can't deliver here yet — check the service area page for updates.",
      address: input.address,
    }
  }

  return {
    available: false,
    distanceKm: 0,
    message:
      "Share your location or enter an address so we can check delivery availability.",
  }
}
