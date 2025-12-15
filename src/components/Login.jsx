import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Mail, Lock, LogIn } from 'lucide-react'
import './Login.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Inserisci email e password')
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Login effettuato con successo!')
      if (onLogin) onLogin(data.user)
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }
        }}
      />
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🎄 Noel Fest 2025</h1>
            <p>Pannello Amministrazione</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@noelfest.com"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Accesso in corso...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Accedi
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>🔒 Accesso riservato al personale autorizzato</p>
          </div>
        </div>
      </div>
    </div>
  )
}
