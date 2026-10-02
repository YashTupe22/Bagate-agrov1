import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { UserProfile } from "../services/types"
import {
  getStoredUser,
  signIn as authSignIn,
  signUp as authSignUp,
  sendPasswordReset,
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
} from "../services/auth"
import { getFirebaseSync } from "../firebase/config"

type AuthContextValue = {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserProfile>
  signUp: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<UserProfile>
  resetPassword: (email: string) => Promise<void>
  signOut: () => void
  updateProfile: (patch: Partial<UserProfile>) => Promise<UserProfile>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fb = getFirebaseSync()
    if (!fb) {
      setUser(getStoredUser())
      setLoading(false)
      return
    }

    let unsubscribe: (() => void) | undefined

    void import("firebase/auth")
      .then(({ onAuthStateChanged }) => {
        if (cancelled) return
        unsubscribe = onAuthStateChanged(fb.auth, (firebaseUser) => {
          if (cancelled) return
          if (firebaseUser) {
            const stored = getStoredUser()
            const profile: UserProfile =
              stored && stored.uid === firebaseUser.uid
                ? stored
                : {
                    uid: firebaseUser.uid,
                    name:
                      firebaseUser.displayName ||
                      firebaseUser.email?.split("@")[0] ||
                      "Customer",
                    email: firebaseUser.email ?? "",
                    phone: firebaseUser.phoneNumber ?? undefined,
                    addresses: [],
                  }
            localStorage.setItem("bagate_auth_user", JSON.stringify(profile))
            setUser(profile)
          } else {
            setUser(null)
          }
          setLoading(false)
        })
      })
      .catch(() => {
        if (cancelled) return
        setUser(getStoredUser())
        setLoading(false)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await authSignIn(email, password)
    setUser(profile)
    return profile
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const profile = await authSignUp(name, email, password, phone)
      setUser(profile)
      return profile
    },
    [],
  )

  const signOut = useCallback(() => {
    authSignOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!user) throw new Error("Not signed in.")
      const updated = await authUpdateProfile(user.uid, patch)
      setUser(updated)
      return updated
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      resetPassword: (email) => sendPasswordReset(email),
      signOut,
      updateProfile,
    }),
    [user, loading, signIn, signUp, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
