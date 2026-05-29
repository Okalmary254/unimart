import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { logout } from '../../api'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const { count } = useCartStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh')
      await logout({ refresh })
    } catch {}
    clearAuth()
    clearCart()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: 'fa-home' },
    { to: '/products', label: 'Products', icon: 'fa-box' },
    { to: '/categories', label: 'Categories', icon: 'fa-list' },
    { to: '/deals', label: 'Deals', icon: 'fa-tag' },
    { to: '/about', label: 'About', icon: 'fa-info-circle' },
    { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
  ]

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#22c55e' : '#ccc',
    fontWeight: isActive(path) ? 600 : 400,
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    display: 'flex',
    admilignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.9rem',
    borderBottom: isActive(path) ? '2px solid #22c55e' : '2px solid transparent',
    transition: 'all 0.2s ease',
  })

  return (
    <header style={{
      background: '#1a1a1a',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <nav style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.9rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <i className="fas fa-motorcycle" style={{ fontSize: '1.6rem', color: '#22c55e' }}></i>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
            AFRIKAN<span style={{ color: '#22c55e' }}>BIKERS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={linkStyle(to)}>
              <i className={`fas ${icon}`}></i> {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/cart" style={{ position: 'relative', textDecoration: 'none', color: '#fff', padding: '0.4rem' }}>
            <i className="fas fa-shopping-cart" style={{ fontSize: '1.2rem' }}></i>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#22c55e', color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
              }}>{count}</span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/account" style={{ textDecoration: 'none', color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fas fa-user-circle" style={{ color: '#22c55e' }}></i>
                {user.first_name || user.username}
              </Link>
              {user.is_staff && (
                <Link to="/dashboard" style={{
                  textDecoration: 'none', color: '#fff', fontSize: '0.85rem',
                  background: '#22c55e', padding: '0.4rem 0.8rem',
                  borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              <button onClick={handleLogout} style={{
                background: 'transparent', color: '#ccc', border: '1px solid #444',
                padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#ccc', fontSize: '0.9rem' }}>
                Login
              </Link>
              <Link to="/register" style={{
                textDecoration: 'none', color: '#fff', fontSize: '0.85rem',
                background: '#22c55e', padding: '0.4rem 1rem',
                borderRadius: '4px', fontWeight: 600,
              }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', background: 'none', border: 'none',
            color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
          }}
        >
          <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: '#111', padding: '1rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          borderTop: '1px solid #2a2a2a',
        }}>
          {navLinks.map(({ to, label, icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              textDecoration: 'none', color: isActive(to) ? '#22c55e' : '#ccc',
              padding: '0.6rem 0', display: 'flex', alignItems: 'center',
              gap: '0.5rem', borderBottom: '1px solid #2a2a2a', fontSize: '0.95rem',
            }}>
              <i className={`fas ${icon}`}></i> {label}
            </Link>
          ))}
          <Link to="/cart" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#ccc', padding: '0.6rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-shopping-cart"></i> Cart {count > 0 && `(${count})`}
          </Link>
          {user ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#ccc', padding: '0.6rem 0' }}>
                <i className="fas fa-user" style={{ marginRight: '0.5rem' }}></i> {user.first_name || user.username}
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ccc', textAlign: 'left', padding: '0.6rem 0', cursor: 'pointer', fontSize: '0.95rem' }}>
                <i className="fas fa-sign-out-alt" style={{ marginRight: '0.5rem' }}></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#ccc', padding: '0.6rem 0' }}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#22c55e', padding: '0.6rem 0', fontWeight: 600 }}>Register</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
