import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../api'
import useCartStore from '../store/cartStore'

const COUPONS = [
  { icon: 'fa-gift', title: 'Biker Special', desc: 'Get 20% off on all gear', code: 'BIKER20', expiry: 'Dec 31, 2026' },
  { icon: 'fa-truck', title: 'Free Delivery', desc: 'On orders above Ksh 500000', code: 'FREESHIP', expiry: 'Dec 31, 2026' },
  { icon: 'fa-motorcycle', title: 'Bikers Deal', desc: '15% off on all accessories', code: 'BIKER15', expiry: 'Dec 31, 2026' },
]

function Countdown() {
  const [time, setTime] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const endRef = useRef(Date.now() + 24 * 60 * 60 * 1000)

  useEffect(() => {
    const tick = setInterval(() => {
      const dist = endRef.current - Date.now()
      if (dist < 0) { clearInterval(tick); return }
      setTime({
        days: String(Math.floor(dist / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((dist % 86400000) / 3600000)).padStart(2, '0'),
        minutes: String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0'),
        seconds: String(Math.floor((dist % 60000) / 1000)).padStart(2, '0'),
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const block = (val, label) => (
    <div style={{
      background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
      padding: '1rem', borderRadius: '8px', minWidth: '80px', textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.15)',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
      {block(time.days, 'Days')}
      {block(time.hours, 'Hours')}
      {block(time.minutes, 'Minutes')}
      {block(time.seconds, 'Seconds')}
    </div>
  )
}

export default function Deals() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState('')
  const [copiedCode, setCopiedCode] = useState('')
  const { addItem } = useCartStore()
  const [addedId, setAddedId] = useState(null)

  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { featured: 'false' }
    if (selectedCategory) params.category = selectedCategory
    if (sort) params.sort = sort
    getProducts(params)
      .then(r => setProducts((r.data.results || []).filter(p => p.discount_percentage > 0)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedCategory, sort])

  const handleAddToCart = async (id) => {
    await addItem(id)
    setAddedId(id)
    setTimeout(() => setAddedId(null), 2000)
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const maxDiscount = products.length > 0
    ? Math.max(...products.map(p => Number(p.discount_percentage)))
    : 0

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        borderBottom: '3px solid #22c55e',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(34,197,94,0.03) 20px, rgba(34,197,94,0.03) 40px)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: '#22c55e', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
            Limited Time Only
          </p>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <i className="fas fa-bolt" style={{ color: '#22c55e' }}></i>
            HOT DEALS!
          </h1>
          <p style={{ color: '#888', fontSize: '1.05rem', marginTop: '0.75rem' }}>
            Limited time offers. Grab them before they're gone!
          </p>
          <Countdown />
        </div>
      </section>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
          <span>/</span>
          <span style={{ color: '#22c55e' }}><i className="fas fa-tag"></i> Deals</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: 'fa-percent', label: 'Max Discount', value: `Up to ${maxDiscount}%` },
            { icon: 'fa-fire', label: 'Active Deals', value: `${products.length} deals` },
            { icon: 'fa-truck', label: 'Free Shipping', value: 'Orders over KES 500000' },
            { icon: 'fa-gift', label: 'Coupon Codes', value: `${COUPONS.length} available` },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: '48px', height: '48px', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${icon}`} style={{ color: '#22c55e', fontSize: '1.3rem' }}></i>
              </div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '3px' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={e => { e.target.value ? setSearchParams({ category: e.target.value }) : setSearchParams({}) }}
              style={{ padding: '0.45rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '4px', fontSize: '0.85rem', color: '#333', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ padding: '0.45rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '4px', fontSize: '0.85rem', color: '#333', cursor: 'pointer' }}
            >
              <option value="">Sort: Biggest Discount</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="fas fa-tag" style={{ color: '#22c55e' }}></i>
            {loading ? 'Loading...' : `${products.length} deals available`}
          </span>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#22c55e' }}></i>
            <p style={{ marginTop: '1rem', color: '#888' }}>Loading deals...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <i className="fas fa-tag" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No Deals Available</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Check back later for exciting offers!</p>
            <Link to="/products" style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '0.7rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {products.map(product => {
              const saved = Number(product.price) - Number(product.discounted_price)
              return (
                <div key={product.id} className="fade-in" style={{
                  background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                  overflow: 'hidden', position: 'relative', transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Ribbon */}
                  <div style={{
                    position: 'absolute', top: '16px', left: '-32px',
                    background: '#22c55e', color: '#fff',
                    padding: '0.35rem 2.5rem', transform: 'rotate(-45deg)',
                    fontWeight: 700, fontSize: '0.75rem', zIndex: 2,
                    letterSpacing: '1px',
                  }}>
                    <i className="fas fa-bolt"></i> DEAL
                  </div>

                  {/* Image */}
                  <div style={{ position: 'relative', height: '220px', background: '#f0fdf4', overflow: 'hidden' }}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-motorcycle" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.3 }}></i>
                        </div>
                    }
                    {/* Discount badge */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: '#22c55e', color: '#fff',
                      width: '60px', height: '60px', borderRadius: '50%',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                    }}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{product.discount_percentage}%</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>OFF</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      <i className="fas fa-tag"></i> {product.category?.name}
                    </p>
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>{product.name}</h3>
                    </Link>
                    <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {product.description?.substring(0, 80)}...
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>
                        <span><i className="fas fa-fire" style={{ color: '#22c55e' }}></i> Selling fast!</span>
                        <span>{product.stock} left in stock</span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: '#22c55e', borderRadius: '3px',
                          width: `${Math.min((product.stock / 10) * 100, 100)}%`,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#bbb', textDecoration: 'line-through' }}>
                          KES {Number(product.price).toLocaleString()}
                        </p>
                        <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a' }}>
                          KES {Number(product.discounted_price).toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>
                          <i className="fas fa-check-circle"></i> Save KES {saved.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        style={{
                          background: addedId === product.id ? '#16a34a' : '#22c55e',
                          color: '#fff', border: 'none',
                          padding: '0.6rem 1.1rem', borderRadius: '4px',
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          transition: 'background 0.2s',
                        }}
                      >
                        <i className={addedId === product.id ? 'fas fa-check' : 'fas fa-bolt'}></i>
                        {addedId === product.id ? 'Added!' : 'Grab Deal'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Flash Deals */}
        {products.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-bolt" style={{ color: '#22c55e' }}></i> Flash Deals
              </h2>
              <Link to="/products" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {products.slice(0, 4).map(product => (
                <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
                    overflow: 'hidden', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ height: '130px', background: '#f0fdf4', position: 'relative', overflow: 'hidden' }}>
                      {product.image
                        ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-motorcycle" style={{ fontSize: '2rem', color: '#22c55e', opacity: 0.3 }}></i>
                          </div>
                      }
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <i className="fas fa-clock" style={{ color: '#22c55e' }}></i> Ends today
                      </div>
                    </div>
                    <div style={{ padding: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>
                        {product.name.substring(0, 35)}{product.name.length > 35 ? '...' : ''}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>
                          KES {Number(product.discounted_price).toLocaleString()}
                        </span>
                        <span style={{ color: '#bbb', textDecoration: 'line-through', fontSize: '0.8rem' }}>
                          KES {Number(product.price).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#22c55e', width: '65%', borderRadius: '2px' }} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span><i className="fas fa-fire" style={{ color: '#22c55e' }}></i> 65% sold</span>
                        <span>{product.stock} left</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coupons */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-ticket-alt" style={{ color: '#22c55e' }}></i> Exclusive Coupons
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {COUPONS.map(coupon => (
              <div key={coupon.code} style={{
                background: '#1a1a1a', borderRadius: '8px', padding: '1.5rem',
                position: 'relative', overflow: 'hidden',
                border: '1.5px solid #2a2a2a',
              }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(34,197,94,0.03) 10px, rgba(34,197,94,0.03) 20px)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <i className={`fas ${coupon.icon}`} style={{ fontSize: '2rem', color: '#22c55e', display: 'block', marginBottom: '0.75rem' }}></i>
                  <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.25rem' }}>{coupon.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{coupon.desc}</p>
                  <div style={{
                    background: 'rgba(34,197,94,0.1)', border: '1px dashed #22c55e',
                    padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-block',
                    fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px',
                    color: '#22c55e', fontWeight: 700, marginBottom: '0.75rem',
                  }}>
                    {coupon.code}
                  </div>
                  <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fas fa-calendar-alt" style={{ color: '#22c55e' }}></i> Expires: {coupon.expiry}
                  </p>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    style={{
                      background: copiedCode === coupon.code ? '#16a34a' : '#22c55e',
                      color: '#fff', border: 'none', padding: '0.5rem 1.25rem',
                      borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
                      fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                      transition: 'background 0.2s',
                    }}
                  >
                    <i className={copiedCode === coupon.code ? 'fas fa-check' : 'fas fa-copy'}></i>
                    {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
