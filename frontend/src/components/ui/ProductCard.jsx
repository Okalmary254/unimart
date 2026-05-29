import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    await addItem(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      className="fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#22c55e' : '#e5e7eb'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(34,197,94,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ position: 'relative', height: '220px', background: '#f0fdf4', overflow: 'hidden' }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-motorcycle" style={{ fontSize: '3rem', color: '#22c55e', opacity: 0.4 }}></i>
            </div>
          )}
          {product.discount_percentage > 0 && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#22c55e', color: '#fff',
              fontSize: '0.75rem', fontWeight: 700,
              padding: '3px 8px', borderRadius: '3px',
            }}>
              -{product.discount_percentage}% OFF
            </span>
          )}
          {product.is_new && !product.discount_percentage && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#1a1a1a', color: '#22c55e',
              fontSize: '0.75rem', fontWeight: 700,
              padding: '3px 8px', borderRadius: '3px',
            }}>
              NEW
            </span>
          )}
        </div>

        <div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            {product.category?.name}
          </p>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
            {product.name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            {product.description?.substring(0, 80)}...
          </p>
        </div>
      </Link>

      <div style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>
            KES {Number(product.discounted_price).toLocaleString()}
          </span>
          {product.discount_percentage > 0 && (
            <span style={{ fontSize: '0.8rem', color: '#bbb', textDecoration: 'line-through', marginLeft: '6px' }}>
              KES {Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            background: added ? '#16a34a' : '#22c55e',
            color: '#fff', border: 'none',
            padding: '0.45rem 1rem', borderRadius: '4px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            transition: 'background 0.2s',
          }}
        >
          <i className={added ? 'fas fa-check' : 'fas fa-cart-plus'}></i>
          {added ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  )
}
