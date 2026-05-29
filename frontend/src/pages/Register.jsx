import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'

export default function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { setAuth } = useAuthStore()
  const { fetchCart } = useCartStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim()) e.last_name = 'Last name is required'
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    try {
      const res = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      setAuth(res.data.user, res.data.access, res.data.refresh)
      await fetchCart()
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.error) setErrors({ submit: data.error })
      else setErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.85rem 0.85rem 0.85rem 2.75rem',
    border: `1.5px solid ${hasError ? '#e74c3c' : '#e5e7eb'}`,
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  })

  const Field = ({ name, label, placeholder, icon, type = 'text', showToggle, show, onToggle }) => (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <i className={`fas ${icon}`} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '0.85rem', pointerEvents: 'none' }}></i>
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={form[name]}
          onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })) }}
          placeholder={placeholder}
          style={{ ...inputStyle(errors[name]), paddingRight: showToggle ? '2.75rem' : '0.85rem' }}
          onFocus={e => e.target.style.borderColor = '#22c55e'}
          onBlur={e => e.target.style.borderColor = errors[name] ? '#e74c3c' : '#e5e7eb'}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem' }}>
            <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
      </div>
      {errors[name] && (
        <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <i className="fas fa-exclamation-circle"></i> {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', background: '#f9fafb',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <i className="fas fa-motorcycle" style={{ fontSize: '2.5rem', color: '#22c55e', display: 'block', marginBottom: '0.5rem' }}></i>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '1px' }}>
              AFRIKAN<span style={{ color: '#22c55e' }}>BIKERS</span>
            </span>
          </Link>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '8px',
          padding: '2.5rem', border: '1.5px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-user-plus" style={{ color: '#22c55e' }}></i>
            Register
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field name="first_name" label="First Name" placeholder="First name" icon="fa-user" />
              <Field name="last_name" label="Last Name" placeholder="Last name" icon="fa-user" />
            </div>

            <Field name="username" label="Username" placeholder="Choose a username" icon="fa-at" />
            <Field name="email" label="Email Address" placeholder="your@email.com" icon="fa-envelope" type="email" />

            <Field
              name="password" label="Password" placeholder="Min. 8 characters" icon="fa-lock"
              showToggle show={showPassword} onToggle={() => setShowPassword(s => !s)}
            />

            {/* Password strength */}
            {form.password && (
              <div style={{ marginTop: '-0.5rem' }}>
                <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s',
                    width: form.password.length >= 12 ? '100%' : form.password.length >= 8 ? '66%' : '33%',
                    background: form.password.length >= 12 ? '#22c55e' : form.password.length >= 8 ? '#f59e0b' : '#e74c3c',
                  }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>
                  Strength: {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Medium' : 'Weak'}
                </p>
              </div>
            )}

            <Field
              name="confirm_password" label="Confirm Password" placeholder="Repeat your password" icon="fa-lock"
              showToggle show={showConfirm} onToggle={() => setShowConfirm(s => !s)}
            />

            {/* Terms */}
            <p style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
              By registering you agree to our{' '}
              <Link to="/terms" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
              {' '}and{' '}
              <span style={{ color: '#22c55e', fontWeight: 600 }}>Privacy Policy</span>.
            </p>

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
                ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
                : <><i className="fas fa-user-plus"></i> Create Account</>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
