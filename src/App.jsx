import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import MenuNew from './pages/MenuNew'
import AdminKanban from './pages/AdminKanban'
import Login from './components/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        <div>🎄 Caricamento...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuNew />} />
        <Route 
          path="/admin" 
          element={
            user ? (
              <AdminKanban user={user} onLogout={() => setUser(null)} />
            ) : (
              <Login onLogin={setUser} />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
