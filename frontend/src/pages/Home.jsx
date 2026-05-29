import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../api'
import ProductCard from '../components/ui/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ page }),
          getCategories(),
        ])
        setProducts(prodRes.data.results)
        setPagination({ count: prodRes.data.count, next: prodRes.data.next, previous: prodRes.data.previous })
        setCategories(catRes.data.results || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const totalPages = Math.ceil(pagination.count / 16)

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#fff',
        borderBottom: '3px solid #22c55e',
        padding: '3rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          fontSize: '18rem', color: '#22c55e', zIndex: 0,
        }}>
          <i className="fas fa-motorcycle"></i>
        </div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: '#22c55e', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
            Kenya's Premier Bike Marketplace
          </p>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.1, marginBottom: '1rem' }}>
            Ride The Road<br />Before It Calls<br />Your Name
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem', maxWidth: '480px' }}>
            Premium motorcycles, parts and gear for serious riders across Kenya.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/products" style={{
              background: '#22c55e', color: '#fff', textDecoration: 'none',
              padding: '0.8rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.95rem',
            }}>
              Shop Now
            </Link>
            <Link to="/deals" style={{
              background: 'transparent', color: '#1a1a1a', textDecoration: 'none',
              padding: '0.8rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.95rem',
              border: '1.5px solid #1a1a1a',
            }}>
              View Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Categories 
      <section style={{ background: '#f9fafb', padding: '3rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.25rem' }}>
            Browse Categories
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '1.5px solid #e5e7eb',
                  borderRadius: '6px', padding: '1.25rem', textAlign: 'center',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = '#f0fdf4' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}
                >
                  <i className="fas fa-motorcycle" style={{ fontSize: '1.5rem', color: '#22c55e', display: 'block', marginBottom: '0.5rem' }}></i>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{cat.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>{cat.product_count} bikes</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Products */}
      <section style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              {pagination.count} Products Available
            </p>
            <Link to="/products" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {/* Pagination top */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff', padding: '0.75rem 1.25rem', borderRadius: '6px',
              border: '1px solid #e5e7eb', marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.previous} style={{
                  padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px',
                  background: '#fff', cursor: pagination.previous ? 'pointer' : 'not-allowed',
                  opacity: pagination.previous ? 1 : 0.4, color: '#333',
                }}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
                    border: p === page ? 'none' : '1px solid #e5e7eb',
                    background: p === page ? '#22c55e' : '#fff',
                    color: p === page ? '#fff' : '#333',
                  }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.next} style={{
                  padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px',
                  background: '#fff', cursor: pagination.next ? 'pointer' : 'not-allowed',
                  opacity: pagination.next ? 1 : 0.4, color: '#333',
                }}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#22c55e' }}></i>
                <p style={{ marginTop: '1rem', color: '#888' }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-motorcycle" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4, marginBottom: '1rem', display: 'block' }}></i>
                <p style={{ color: '#888' }}>No products available at the moment.</p>
              </div>
            ) : (
              products.map(product => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section style={{ background: '#1a1a1a', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#22c55e', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
              Limited Time
            </p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Biker Exclusive Deals
            </h2>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>Verified biker discounts available now.</p>
          </div>
          <Link to="/deals" style={{
            background: '#22c55e', color: '#fff', textDecoration: 'none',
            padding: '0.9rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.95rem',
            whiteSpace: 'nowrap',
          }}>
            Browse Deals <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>
    </div>
  )
}
