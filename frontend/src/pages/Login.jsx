import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setAuth } = useAuthStore()
  const { fetchCart } = useCartStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    try {
      const res = await login(form)
      setAuth(res.data.user, res.data.access, res.data.refresh)
      await fetchCart()
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid username or password.'
      setErrors({ submit: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.85rem 0.85rem 0.85rem 2.75rem',
    border: `1.5px solid ${hasError ? '#e74c3c' : '#e5e7eb'}`,
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  })

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', background: '#f9fafb',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <i className="fas fa-motorcycle" style={{ fontSize: '2.5rem', color: '#22c55e', display: 'block', marginBottom: '0.5rem' }}></i>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '1px' }}>
              AFRIKAN<span style={{ color: '#22c55e' }}>BIKERS</span>
            </span>
          </Link>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '8px',
          padding: '2.5rem', border: '1.5px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-sign-in-alt" style={{ color: '#22c55e' }}></i>
            Login
          </h2>

          {errors.submit && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '6px', padding: '0.75rem 1rem',
              marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#e74c3c', fontSize: '0.9rem',
            }}>
              <i className="fas fa-exclamation-circle"></i> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-user" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '0.9rem', pointerEvents: 'none' }}></i>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setErrors(er => ({ ...er, username: '' })) }}
                  placeholder="Enter your username"
                  style={inputStyle(errors.username)}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = errors.username ? '#e74c3c' : '#e5e7eb'}
                />
              </div>
              {errors.username && (
                <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <i className="fas fa-exclamation-circle"></i> {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '0.9rem', pointerEvents: 'none' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
                  placeholder="Enter your password"
                  style={{ ...inputStyle(errors.password), paddingRight: '2.75rem' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#e74c3c' : '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <i className="fas fa-exclamation-circle"></i> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '0.9rem',
                background: submitting ? '#86efac' : '#22c55e',
                color: '#fff', border: 'none', borderRadius: '6px',
                fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s', marginTop: '0.25rem',
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#16a34a' }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#22c55e' }}
            >
              {submitting
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : <><i className="fas fa-sign-in-alt"></i> Login</>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>

        {/* Social login hint */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
