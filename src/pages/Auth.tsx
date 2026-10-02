import { useState, type FormEvent } from "react"
import Icon from "../components/Icon"
import Logo from "../components/Logo"
import { useAuth } from "../context/AuthContext"
import { isFirebaseConfigured } from "../firebase/config"

type Mode = "signin" | "signup" | "forgot"

export default function Auth({
  mode,
  navigate,
}: {
  mode: Mode
  navigate: (path: string) => void
}) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const next =
    new URLSearchParams(window.location.search).get("next") || "/account"

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setNotice("")
    setLoading(true)
    try {
      if (mode === "signin") {
        await signIn(email, password)
        navigate(next)
      } else if (mode === "signup") {
        await signUp(name, email, password, phone)
        navigate(next)
      } else {
        await resetPassword(email)
        setNotice(
          "Password reset instructions sent (demo). Connect Firebase Auth to send real emails.",
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-panel card">
        <div className="auth-brand" onClick={() => navigate("/home")}>
          <Logo />
        </div>

        {mode === "signin" && (
          <>
            <span className="kicker">WELCOME BACK</span>
            <h1>Sign in</h1>
            <p>Access your orders, saved addresses and faster checkout.</p>
          </>
        )}
        {mode === "signup" && (
          <>
            <span className="kicker">NEW HERE?</span>
            <h1>Create account</h1>
            <p>Save time at checkout and track every fresh delivery.</p>
          </>
        )}
        {mode === "forgot" && (
          <>
            <span className="kicker">RECOVER ACCESS</span>
            <h1>Forgot password</h1>
            <p>We&apos;ll email you a link to reset your password.</p>
          </>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <>
              <label>
                <span>Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional mobile"
                />
              </label>
            </>
          )}
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          {mode !== "forgot" && (
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </label>
          )}

          {mode === "signin" && (
            <div className="auth-row">
              <label className="check-label">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                className="text-button"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="form-banner error">
              <Icon name="close" /> {error}
            </div>
          )}
          {notice && (
            <div className="form-banner success">
              <Icon name="check" /> {notice}
            </div>
          )}

          <button className="primary-button full" disabled={loading}>
            {loading ? (
              "Please wait..."
            ) : mode === "signin" ? (
              <>
                Sign in <Icon name="arrow" />
              </>
            ) : mode === "signup" ? (
              <>
                Create account <Icon name="arrow" />
              </>
            ) : (
              <>
                Send reset link <Icon name="arrow" />
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signin" && (
            <p>
              New to Bagate Agro?{" "}
              <button
                className="text-button"
                onClick={() => navigate("/auth/signup")}
              >
                Create an account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button className="text-button" onClick={() => navigate("/auth")}>
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <p>
              Remembered it?{" "}
              <button className="text-button" onClick={() => navigate("/auth")}>
                Back to sign in
              </button>
            </p>
          )}
        </div>

        <div className="auth-demo">
          <strong>
            {isFirebaseConfigured ? "Firebase Auth active" : "Demo login"}
          </strong>
          <code>
            {isFirebaseConfigured
              ? "Sign up with your email, or use a Firebase test account"
              : "demo@bagateagro.com / bagate123"}
          </code>
          <small>
            {isFirebaseConfigured
              ? "Accounts are stored in Firebase Authentication + Firestore users/{uid}."
              : "Local demo mode — add .env Firebase keys to switch to real auth."}
          </small>
        </div>
      </div>
    </main>
  )
}
