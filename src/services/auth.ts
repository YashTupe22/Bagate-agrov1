import type { UserProfile } from "./types"
import { getFirebase, getFirebaseSync } from "../firebase/config"

const STORAGE_KEY = "bagate_auth_user"

function setCurrentUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as UserProfile : null
  } catch {
    return null
  }
}

function profileFromFirebaseUser(user: {
  uid: string
  displayName?: string | null
  email?: string | null
  phoneNumber?: string | null
}): UserProfile {
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "Customer",
    email: user.email ?? "",
    phone: user.phoneNumber ?? undefined,
    addresses: [],
  }
}

async function loadProfileFromFirestore(
  uid: string,
  fallback: UserProfile,
): Promise<UserProfile> {
  const fb = await getFirebase()
  if (!fb) return fallback
  try {
    const { doc, getDoc, setDoc } = await import("firebase/firestore")
    const ref = doc(fb.db, "users", uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as UserProfile
      const profile = { ...fallback, ...data, uid }
      setCurrentUser(profile)
      return profile
    }
    await setDoc(ref, fallback)
    setCurrentUser(fallback)
    return fallback
  } catch (err) {
    console.warn("[auth] Firestore profile load failed:", err)
    return fallback
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<UserProfile> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      const cred = await signInWithEmailAndPassword(
        fb.auth,
        email.trim(),
        password,
      )
      const base = profileFromFirebaseUser(cred.user)
      return await loadProfileFromFirestore(cred.user.uid, base)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed."
      throw new Error(mapAuthError(message))
    }
  }

  // Local fallback when Firebase is not configured
  if (
    email.trim().toLowerCase() === "demo@bagateagro.com" &&
    password === "bagate123"
  ) {
    const profile: UserProfile = {
      uid: "demo-user",
      name: "Neha Patil",
      email: "demo@bagateagro.com",
      phone: "9876543210",
      addresses: [
        {
          id: "addr-1",
          label: "Home",
          line1: "12, Shree Nagar",
          area: "Near Bagate Agro",
          pincode: "411038",
          isDefault: true,
        },
      ],
    }
    setCurrentUser(profile)
    return profile
  }
  throw new Error(
    "Invalid email or password. Demo login: demo@bagateagro.com / bagate123",
  )
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  phone?: string,
): Promise<UserProfile> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import(
        "firebase/auth"
      )
      const cred = await createUserWithEmailAndPassword(
        fb.auth,
        email.trim(),
        password,
      )
      await updateProfile(cred.user, { displayName: name.trim() })
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim(),
        addresses: [],
      }
      const { doc, setDoc } = await import("firebase/firestore")
      await setDoc(doc(fb.db, "users", cred.user.uid), profile)
      setCurrentUser(profile)
      return profile
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed."
      throw new Error(mapAuthError(message))
    }
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.")
  }
  const profile: UserProfile = {
    uid: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim(),
    addresses: [],
  }
  setCurrentUser(profile)
  return profile
}

export async function sendPasswordReset(email: string): Promise<void> {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(fb.auth, email.trim())
      return
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send reset email."
      throw new Error(mapAuthError(message))
    }
  }
  await new Promise((r) => setTimeout(r, 600))
}

export function signOut() {
  const fb = getFirebaseSync()
  if (fb) {
    void fb.auth.signOut().catch(() => undefined)
  }
  setCurrentUser(null)
}

export async function updateProfile(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  const current = getStoredUser()
  if (!current) throw new Error("Not signed in.")
  const updated: UserProfile = { ...current, ...patch }
  setCurrentUser(updated)

  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, updateDoc, getDoc } = await import("firebase/firestore")
      await updateDoc(doc(fb.db, "users", userId), patch)
      const snap = await getDoc(doc(fb.db, "users", userId))
      if (snap.exists()) {
        const profile = { ...updated, ...snap.data() as UserProfile }
        setCurrentUser(profile)
        return profile
      }
    } catch (err) {
      console.warn("[auth] profile update failed:", err)
    }
  }
  return updated
}

export async function addAddress(
  userId: string,
  address: UserProfile["addresses"][number],
): Promise<UserProfile> {
  const current = getStoredUser()
  if (!current) throw new Error("Not signed in.")
  const addresses = [...current.addresses, address]
  return updateProfile(userId, { addresses })
}

export async function getCurrentFirebaseUser() {
  const fb = getFirebaseSync()
  return fb?.auth.currentUser ?? null
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes("auth/invalid-credential") ||
    lower.includes("auth/wrong-password") ||
    lower.includes("auth/user-not-found") ||
    lower.includes("invalid login")
  ) {
    return "Invalid email or password."
  }
  if (lower.includes("auth/email-already-in-use"))
    return "An account with this email already exists."
  if (lower.includes("auth/weak-password"))
    return "Password must be at least 6 characters."
  if (lower.includes("auth/invalid-email"))
    return "Please enter a valid email address."
  if (lower.includes("auth/network-request-failed"))
    return "Network error. Check your connection and try again."
  if (lower.includes("auth/too-many-requests"))
    return "Too many attempts. Please wait and try again."
  return message
}
