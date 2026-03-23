import { createContext, useContext, useState } from "react"
import { supabase } from "./data/supabaseClient"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    setError("")

    try {
      // Check staff_account table in Supabase
      const { data, error: dbError } = await supabase
        .from("staff_account")
        .select("*, staff(*)")          // also fetch linked staff info
        .eq("username", username.trim())
        .eq("password", password)
        .eq("is_active", true)
        .single()

      if (dbError || !data) {
        setError("Invalid username or password.")
        return false
      }

      // Build the current user object
      const staff = data.staff ?? {}
      setCurrentUser({
        account_id: data.account_id,
        staff_no:   data.staff_no,
        username:   data.username,
        role:       data.role,
        full_name:  data.staff_no
          ? `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim()
          : data.username,
        position:   staff.position ?? data.role.replace(/_/g, " "),
        avatar:     data.staff_no
          ? `${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`
          : data.username.slice(0, 2).toUpperCase(),
      })
      return true

    } catch (err) {
      setError("Something went wrong. Try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setError("")
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
