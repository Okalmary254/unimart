import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getCategories, getProducts } from '../api'
import ProductCard from '../components/ui/ProductCard'

export default function Categories() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (slug && categories.length > 0) {
      const cat = categories.find(c => c.slug === slug)
      setSelectedCat(cat || null)
      setLoading(true)
      getProducts({ category: slug, sort })
        .then(r => setProducts(r.data.results || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (!slug) {
      setSelectedCat(null)
      setLoading(false)
    }
  }, [slug, categories, sort])

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a',
        padding: '2.5rem 2rem',
        borderBottom: '3px solid #22c55e',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#888' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>
              <i className="fas fa-home"></i> Home
            </Link>
            <span>/</span>
            {selectedCat ? (
              <>
                <Link to="/categories" style={{ color: '#888', textDecoration: 'none' }}>
                  <i className="fas fa-folder-open"></i> Categories
                </Link>
                <span>/</span>
                <span style={{ color: '#22c55e' }}>{selectedCat.name}</span>
              </>
            ) : (
              <span style={{ color: '#22c55e' }}>
                <i className="fas fa-folder-open"></i> Categories
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className={selectedCat ? 'fas fa-motorcycle' : 'fas fa-folder-open'} style={{ color: '#22c55e' }}></i>
            {selectedCat ? selectedCat.name : 'Browse Categories'}
          </h1>
          <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            {selectedCat
              ? `Browse our collection of ${selectedCat.name.toLowerCase()}`
              : 'Find everything you need in our carefully organized categories'}
          </p>

          {/* Switch category bar when a category is selected */}
          {selectedCat && categories.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>
                <i className="fas fa-arrow-right" style={{ color: '#22c55e' }}></i> Other categories:
              </span>
              {categories.filter(c => c.slug !== slug).map(cat => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  style={{
                    textDecoration: 'none', color: '#ccc', fontSize: '0.85rem',
                    background: '#2a2a2a', border: '1px solid #333',
                    padding: '0.3rem 0.85rem', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc' }}
                >
                  <i className="fas fa-motorcycle" style={{ fontSize: '0.75rem' }}></i>
                  {cat.name}
                  <span style={{ background: '#333', color: '#888', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px' }}>
                    {cat.product_count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {!selectedCat ? (
          /* All Categories Grid */
          <div>
            <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.5rem' }}>
              {categories.length} Categories Available
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}>
              {categories.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
                  <p style={{ color: '#888' }}>No categories available yet.</p>
                </div>
              ) : (
                categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="fade-in"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: '#fff',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#22c55e'
                        e.currentTarget.style.background = '#f0fdf4'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.12)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <i className="fas fa-motorcycle" style={{ fontSize: '2.5rem', color: '#22c55e', display: 'block', marginBottom: '1rem' }}></i>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {cat.description || 'Shop now'}
                      </p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: '#f0fdf4', color: '#22c55e',
                        fontSize: '0.78rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '20px',
                      }}>
                        <i className="fas fa-box" style={{ fontSize: '0.7rem' }}></i>
                        {cat.product_count} bikes
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Selected Category Products */
          <div>
            {/* Category header card */}
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '1.5rem 2rem', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
            }}>
              <div style={{
                width: '64px', height: '64px', background: '#f0fdf4',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #22c55e',
              }}>
                <i className="fas fa-motorcycle" style={{ fontSize: '1.75rem', color: '#22c55e' }}></i>
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                  {selectedCat.name}
                </h2>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                  {selectedCat.description || `Browse our collection of ${selectedCat.name.toLowerCase()}`}
                </p>
                <p style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  <i className="fas fa-box"></i> {products.length} product{products.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb',
                    borderRadius: '4px', fontSize: '0.85rem', color: '#333', cursor: 'pointer',
                  }}
                >
                  <option value="">Sort by: Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#22c55e' }}></i>
                <p style={{ marginTop: '1rem', color: '#888' }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
                <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No products in this category</h3>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Check back later or browse other categories.</p>
                <Link to="/categories" style={{
                  background: '#22c55e', color: '#fff', textDecoration: 'none',
                  padding: '0.7rem 1.5rem', borderRadius: '4px', fontWeight: 600,
                }}>
                  <i className="fas fa-folder-open"></i> View All Categories
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
