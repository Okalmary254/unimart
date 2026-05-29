import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCategories, getSettings } from '../../api'

export default function Footer() {
  const [categories, setCategories] = useState([])
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || [])).catch(() => {})
    getSettings().then(r => setSettings(r.data)).catch(() => {})
  }, [])

  return (
    <footer style={{ background: '#1a1a1a', color: '#ccc', marginTop: 'auto', padding: '3rem 2rem 1.5rem' }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <i className="fas fa-motorcycle" style={{ color: '#22c55e', fontSize: '1.4rem' }}></i>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
              AFRIKAN<span style={{ color: '#22c55e' }}>BIKERS</span>
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#888' }}>
            {settings?.about_text || 'Kenya\'s premier motorcycle marketplace. Quality bikes, parts and gear for serious riders.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { href: 'https://www.instagram.com/phil.anth.ropist', icon: 'fa-instagram' },
              { href: 'https://x.com/jean__marie_', icon: 'fa-twitter' },
              { href: 'https://wa.me/254743874690', icon: 'fa-whatsapp' },
            ].map(({ href, icon }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" style={{
                width: '36px', height: '36px', borderRadius: '4px',
                background: '#2a2a2a', border: '1px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#888', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
              >
                <i className={`fab ${icon}`}></i>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact Us' },
              { to: '/faq', label: 'FAQ' },
              { to: '/shipping', label: 'Shipping Info' },
              { to: '/returns', label: 'Returns Policy' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#22c55e' }}></i> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.slug}`} style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#22c55e' }}></i> {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { icon: 'fa-map-marker-alt', text: settings?.contact_address || 'Industrial Area, Nairobi' },
              { icon: 'fa-phone-alt', text: settings?.contact_phone || '+254 743 874 690' },
              { icon: 'fa-envelope', text: settings?.contact_email || 'info@afrikanbikers.com' },
              { icon: 'fa-clock', text: settings?.business_hours || 'Mon-Fri: 8am - 6pm' },
            ].map(({ icon, text }) => (
              <li key={icon} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#888' }}>
                <i className={`fas ${icon}`} style={{ color: '#22c55e', width: '16px' }}></i> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px', margin: '2rem auto 0',
        paddingTop: '1.5rem', borderTop: '1px solid #2a2a2a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: '#555',
      }}>
        <p>&copy; {new Date().getFullYear()} {settings?.site_name || 'AfrikanBikers'}. All rights reserved.</p>
        <p>Maintained by <a href={settings?.maintainer_url || 'https://okalmary254.netlify.app'} target="_blank" rel="noreferrer" style={{ color: '#22c55e', textDecoration: 'none' }}>{settings?.maintainer_name || 'Jean Marie'}</a></p>
      </div>
    </footer>
  )
}
