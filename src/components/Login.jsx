import { useState } from "react"
import { useAuth } from "../AuthContext"

function Login() {
  const { login, error, setError, loading } = useAuth()
  const [username, setUsername]             = useState("")
  const [password, setPassword]             = useState("")
  const [showPass, setShowPass]             = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Please enter both username and password.")
      return
    }
    await login(username, password)
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
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-800)", letterSpacing: "-0.3px" }}>
            Wellmeadows Hospital
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>
            Hospital Management Information System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-800)" }}>Sign in</div>
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
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--gray-600)", marginBottom: 6,
                textTransform: "uppercase", letterSpacing: "0.5px",
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
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--gray-600)", marginBottom: 6,
                textTransform: "uppercase", letterSpacing: "0.5px",
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
                    position: "absolute", right: 10, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "var(--gray-400)",
                    fontSize: 14, padding: 2,
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

        {/* Hint */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--gray-400)" }}>
          Contact your administrator if you need access.
        </div>

        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11.5, color: "var(--gray-400)" }}>
          Edinburgh · Wellmeadows Hospital HMIS
        </div>
      </div>
    </div>
  )
}

export default Login
