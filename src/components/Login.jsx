import { useState } from "react"
import { useAuth } from "../AuthContext"
import { users, ROLES } from "../data/users"

const ROLE_LABELS = {
  [ROLES.PERSONNEL_OFFICER]: "Personnel Officer",
  [ROLES.CHARGE_NURSE]:      "Charge Nurse",
  [ROLES.MEDICAL_DIRECTOR]:  "Medical Director",
}

const ROLE_COLORS = {
  [ROLES.PERSONNEL_OFFICER]: "var(--blue-600)",
  [ROLES.CHARGE_NURSE]:      "var(--teal-600)",
  [ROLES.MEDICAL_DIRECTOR]:  "var(--purple-600)",
}

function Login() {
  const { login, error, setError } = useAuth()
  const [username, setUsername]    = useState("")
  const [password, setPassword]    = useState("")
  const [loading, setLoading]      = useState(false)
  const [showPass, setShowPass]    = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Please enter both username and password.")
      return
    }
    setLoading(true)
    // Small delay to feel like a real auth check
    setTimeout(() => {
      login(username, password)
      setLoading(false)
    }, 600)
  }

  const quickLogin = (user) => {
    setUsername(user.username)
    setPassword(user.password)
    setError("")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--gray-50)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "var(--font-main)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52,
            height: 52,
            background: "var(--gray-800)",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            marginBottom: 14,
          }}>
            🏥
          </div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--gray-800)",
            letterSpacing: "-0.3px",
          }}>
            Wellmeadows Hospital
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>
            Hospital Management Information System
          </p>
        </div>

        {/* Login card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-800)" }}>
              Sign in to your account
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-400)", marginTop: 3 }}>
              Use your staff credentials to continue
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Error */}
            {error && (
              <div style={{
                background: "var(--red-50)",
                border: "1px solid var(--red-500)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--red-600)",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-600)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Username
              </label>
              <input
                type="text"
                className="input-search"
                style={{ width: "100%", fontSize: 14 }}
                placeholder="Enter your username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError("") }}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-600)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="input-search"
                  style={{ width: "100%", fontSize: 14, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--gray-400)",
                    fontSize: 14,
                    padding: 2,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: 14 }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Quick login hints */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: "var(--gray-400)",
            textAlign: "center",
            marginBottom: 10,
          }}>
            Demo accounts — click to fill
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => quickLogin(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.13s, background 0.13s",
                  fontFamily: "var(--font-main)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = ROLE_COLORS[u.role]
                  e.currentTarget.style.background = "var(--gray-50)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.background = "var(--white)"
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: ROLE_COLORS[u.role],
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  letterSpacing: "0.5px",
                }}>
                  {u.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-800)" }}>
                    {u.full_name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 1 }}>
                    {u.position}
                  </div>
                </div>

                {/* Role badge */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: ROLE_COLORS[u.role],
                  background: ROLE_COLORS[u.role] + "15",
                  padding: "2px 8px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}>
                  {ROLE_LABELS[u.role]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11.5, color: "var(--gray-400)" }}>
          Edinburgh · Wellmeadows Hospital HMIS · Mock data
        </div>
      </div>
    </div>
  )
}

export default Login
