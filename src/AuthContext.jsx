import { createContext, useContext, useState } from "react"
import { users } from "./data/users"

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
// Provides currentUser and login/logout to all components
// Same concept as your darkMode state but lifted to context so every
// component can read the logged-in user without prop drilling

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError]             = useState("")

  const login = (username, password) => {
    const match = users.find(
      u => u.username === username.trim() && u.password === password
    )
    if (match) {
      setCurrentUser(match)
      setError("")
      return true
    }
    setError("Invalid username or password.")
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    setError("")
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component: const { currentUser } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
