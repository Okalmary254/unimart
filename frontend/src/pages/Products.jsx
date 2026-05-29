import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../api'
import ProductCard from '../components/ui/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [view, setView] = useState('grid')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')

  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = { page }
        if (selectedCategory) params.category = selectedCategory
        if (sort) params.sort = sort
        if (appliedMin) params.min_price = appliedMin
        if (appliedMax) params.max_price = appliedMax
        const res = await getProducts(params)
        setProducts(res.data.results)
        setPagination({ count: res.data.count, next: res.data.next, previous: res.data.previous })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, selectedCategory, sort, appliedMin, appliedMax])

  const totalPages = Math.ceil(pagination.count / 12)

  const handleCategoryClick = (slug) => {
    setPage(1)
    if (slug) setSearchParams({ category: slug })
    else setSearchParams({})
    setFilterOpen(false)
  }

  const handleApplyPrice = () => {
    setPage(1)
    setAppliedMin(minPrice)
    setAppliedMax(maxPrice)
  }

  const inputFocus = (e) => e.target.style.borderColor = '#22c55e'
  const inputBlur = (e) => e.target.style.borderColor = '#e5e7eb'

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a',
        padding: '2.5rem 2rem',
        borderBottom: '3px solid #22c55e',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>
              <i className="fas fa-home"></i> Home
            </Link>
            <span>/</span>
            <span style={{ color: '#22c55e' }}>
              <i className="fas fa-box"></i> Products
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-box-open" style={{ color: '#22c55e' }}></i>
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All Products'}
          </h1>
          <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Browse our complete collection of quality bikes and gear
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="mobile-filter-btn"
          style={{
            display: 'none', marginBottom: '1rem',
            background: '#fff', border: '1.5px solid #e5e7eb',
            padding: '0.65rem 1.25rem', borderRadius: '4px',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            alignItems: 'center', gap: '0.5rem', color: '#1a1a1a',
          }}
        >
          <i className="fas fa-sliders-h" style={{ color: '#22c55e' }}></i>
          {filterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="products-layout">

          {/* Sidebar */}
          <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`} style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '8px', padding: '1.5rem',
            height: 'fit-content', position: 'sticky', top: '80px',
          }}>

            {/* Categories */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-list" style={{ color: '#22c55e' }}></i> Categories
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>
                  <button
                    onClick={() => handleCategoryClick('')}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                      background: !selectedCategory ? '#f0fdf4' : 'transparent',
                      color: !selectedCategory ? '#22c55e' : '#555',
                      fontWeight: !selectedCategory ? 600 : 400, fontSize: '0.9rem', textAlign: 'left',
                    }}
                  >
                    <span><i className="fas fa-box" style={{ marginRight: '0.5rem', color: '#22c55e' }}></i> All Products</span>
                    <span style={{ background: '#f3f4f6', color: '#888', fontSize: '0.75rem', padding: '1px 7px', borderRadius: '20px' }}>
                      {pagination.count || 0}
                    </span>
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: selectedCategory === cat.slug ? '#f0fdf4' : 'transparent',
                        color: selectedCategory === cat.slug ? '#22c55e' : '#555',
                        fontWeight: selectedCategory === cat.slug ? 600 : 400, fontSize: '0.9rem', textAlign: 'left',
                      }}
                    >
                      <span><i className="fas fa-motorcycle" style={{ marginRight: '0.5rem', color: '#22c55e' }}></i> {cat.name}</span>
                      <span style={{ background: '#f3f4f6', color: '#888', fontSize: '0.75rem', padding: '1px 7px', borderRadius: '20px' }}>
                        {cat.product_count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-coins" style={{ color: '#22c55e' }}></i> Price Range
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  style={{
                    flex: 1, minWidth: 0, padding: '0.45rem 0.5rem',
                    border: '1.5px solid #e5e7eb', borderRadius: '4px',
                    fontSize: '0.82rem', outline: 'none',
                  }}
                />
                <span style={{ color: '#999', flexShrink: 0, fontSize: '0.85rem' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  style={{
                    flex: 1, minWidth: 0, padding: '0.45rem 0.5rem',
                    border: '1.5px solid #e5e7eb', borderRadius: '4px',
                    fontSize: '0.82rem', outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={handleApplyPrice}
                style={{
                  width: '100%', padding: '0.55rem', background: '#22c55e',
                  color: '#fff', border: 'none', borderRadius: '4px',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                <i className="fas fa-check"></i> Apply Filter
              </button>
              {(appliedMin || appliedMax) && (
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setAppliedMin(''); setAppliedMax('') }}
                  style={{
                    width: '100%', padding: '0.45rem', background: 'transparent',
                    color: '#888', border: '1px solid #e5e7eb', borderRadius: '4px',
                    fontWeight: 500, cursor: 'pointer', fontSize: '0.78rem', marginTop: '0.4rem',
                  }}
                >
                  <i className="fas fa-times"></i> Clear Price Filter
                </button>
              )}
            </div>

            {/* Availability */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i> Availability
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ accentColor: '#22c55e', width: '16px', height: '16px' }} />
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Products Section */}
          <section>
            {/* Filter Bar */}
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1) }}
                  style={{ padding: '0.45rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '4px', fontSize: '0.85rem', color: '#333', cursor: 'pointer' }}
                >
                  <option value="">Sort by: Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              <span style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fas fa-box" style={{ color: '#22c55e' }}></i>
                {loading ? 'Loading...' : `${pagination.count || 0} products`}
              </span>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setView('grid')}
                  style={{
                    padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer',
                    border: '1.5px solid', borderColor: view === 'grid' ? '#22c55e' : '#e5e7eb',
                    background: view === 'grid' ? '#f0fdf4' : '#fff', color: view === 'grid' ? '#22c55e' : '#888',
                  }}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  onClick={() => setView('list')}
                  style={{
                    padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer',
                    border: '1.5px solid', borderColor: view === 'list' ? '#22c55e' : '#e5e7eb',
                    background: view === 'list' ? '#f0fdf4' : '#fff', color: view === 'list' ? '#22c55e' : '#888',
                  }}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#22c55e' }}></i>
                <p style={{ marginTop: '1rem', color: '#888' }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
                <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No Products Found</h3>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Try adjusting your filters or browse all products.</p>
                <button onClick={() => handleCategoryClick('')} style={{
                  background: '#22c55e', color: '#fff', border: 'none',
                  padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
                }}>
                  View All Products
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: view === 'list' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}>
                {products.map(product => (
                  view === 'list' ? (
                    <div key={product.id} style={{
                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
                      display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <div style={{ height: '180px', background: '#f0fdf4', overflow: 'hidden' }}>
                        {product.image
                          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fas fa-motorcycle" style={{ fontSize: '2rem', color: '#22c55e', opacity: 0.3 }}></i>
                            </div>
                        }
                      </div>
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                            {product.category?.name}
                          </p>
                          <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#1a1a1a' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{product.name}</h3>
                          </Link>
                          <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>
                            {product.description?.substring(0, 150)}...
                          </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>
                              KES {Number(product.discounted_price).toLocaleString()}
                            </span>
                            {product.discount_percentage > 0 && (
                              <span style={{ fontSize: '0.8rem', color: '#bbb', textDecoration: 'line-through', marginLeft: '6px' }}>
                                KES {Number(product.price).toLocaleString()}
                              </span>
                            )}
                            <p style={{ fontSize: '0.8rem', color: product.is_in_stock ? '#22c55e' : '#e74c3c', marginTop: '2px' }}>
                              <i className={`fas ${product.is_in_stock ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                              {product.is_in_stock ? ` In Stock (${product.stock})` : ' Out of Stock'}
                            </p>
                          </div>
                          <Link to={`/products/${product.id}`} style={{
                            background: '#22c55e', color: '#fff', textDecoration: 'none',
                            padding: '0.5rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem',
                          }}>
                            View <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ProductCard key={product.id} product={product} />
                  )
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.previous} style={{
                  width: '38px', height: '38px', border: '1px solid #e5e7eb', borderRadius: '4px',
                  background: '#fff', cursor: pagination.previous ? 'pointer' : 'not-allowed',
                  opacity: pagination.previous ? 1 : 0.4,
                }}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: '38px', height: '38px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
                    border: p === page ? 'none' : '1px solid #e5e7eb',
                    background: p === page ? '#22c55e' : '#fff',
                    color: p === page ? '#fff' : '#333',
                  }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.next} style={{
                  padding: '0 1rem', height: '38px', border: '1px solid #e5e7eb', borderRadius: '4px',
                  background: '#fff', cursor: pagination.next ? 'pointer' : 'not-allowed',
                  opacity: pagination.next ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontWeight: 600, fontSize: '0.85rem',
                }}>
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .products-layout { grid-template-columns: 1fr !important; }
          .filter-sidebar { display: none; }
          .filter-sidebar.open { display: block !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
