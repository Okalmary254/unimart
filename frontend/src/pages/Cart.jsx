import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

const SHIPPING = 200
const TAX_RATE = 0.16

export default function Cart() {
  const { items, total, count, clearCart, fetchCart, updateItem, removeItem } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchCart().finally(() => setLoading(false))
  }, [])

  const subtotal = total
  const tax = subtotal * TAX_RATE
  const shipping = subtotal > 0 ? SHIPPING : 0
  const grandTotal = subtotal + tax + shipping

  const handleUpdate = async (productId, quantity) => {
    if (quantity < 1) return
    setUpdating(productId)
    await updateItem(productId, quantity)
    setUpdating(null)
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from your cart?')) return
    await removeItem(productId)
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#22c55e' }}></i>
        <p style={{ marginTop: '1rem', color: '#888' }}>Loading your cart...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a', padding: '2.5rem 2rem',
        borderBottom: '3px solid #22c55e',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>
              <i className="fas fa-home"></i> Home
            </Link>
            <span>/</span>
            <span style={{ color: '#22c55e' }}><i className="fas fa-shopping-cart"></i> Cart</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-shopping-cart" style={{ color: '#22c55e' }}></i>
            Your Shopping Cart
          </h1>
          <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Review your items and proceed to checkout
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {items.length === 0 ? (
          /* Empty Cart */
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb',
          }}>
            <i className="fas fa-shopping-cart" style={{ fontSize: '5rem', color: '#e5e7eb', display: 'block', marginBottom: '1.5rem' }}></i>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Your Cart is Empty</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Looks like you haven't added any bikes or gear yet.</p>
            <Link to="/products" style={{
              background: '#22c55e', color: '#fff', textDecoration: 'none',
              padding: '0.9rem 2rem', borderRadius: '4px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <i className="fas fa-motorcycle"></i> Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="cart-layout">

            {/* Cart Items */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '2px solid #f3f4f6', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-shopping-bag" style={{ color: '#22c55e' }}></i> Cart Items
                </h2>
                <span style={{ background: '#22c55e', color: '#fff', padding: '0.2rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {count} item{count !== 1 ? 's' : ''}
                </span>
              </div>

              {items.map(({ product, quantity, subtotal: itemSubtotal }) => (
                <div key={product.id} style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr auto',
                  gap: '1.25rem', padding: '1.25rem 0',
                  borderBottom: '1px solid #f3f4f6',
                }}>
                  {/* Image */}
                  <div style={{ width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-motorcycle" style={{ fontSize: '2rem', color: '#22c55e', opacity: 0.3 }}></i>
                        </div>
                    }
                  </div>

                  {/* Details */}
                  <div>
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.25rem' }}>{product.name}</h3>
                    </Link>
                    <p style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className="fas fa-tag"></i> {product.category?.name || 'Uncategorized'}
                    </p>
                    <p style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>
                      KES {Number(product.discounted_price).toLocaleString()}
                    </p>
                    {product.discount_percentage > 0 && (
                      <p style={{ fontSize: '0.78rem', color: '#bbb', textDecoration: 'line-through' }}>
                        KES {Number(product.price).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    {/* Quantity control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', padding: '0.3rem', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => handleUpdate(product.id, quantity - 1)}
                        disabled={updating === product.id || quantity <= 1}
                        style={{
                          width: '28px', height: '28px', border: 'none',
                          background: '#fff', borderRadius: '50%', cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#22c55e', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          opacity: quantity <= 1 ? 0.4 : 1, transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (quantity > 1) { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#fff' } }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#22c55e' }}
                      >
                        <i className="fas fa-minus" style={{ fontSize: '0.7rem' }}></i>
                      </button>
                      <span style={{ fontWeight: 700, color: '#1a1a1a', minWidth: '28px', textAlign: 'center', fontSize: '0.95rem' }}>
                        {updating === product.id ? <i className="fas fa-spinner fa-spin"></i> : quantity}
                      </span>
                      <button
                        onClick={() => handleUpdate(product.id, quantity + 1)}
                        disabled={updating === product.id}
                        style={{
                          width: '28px', height: '28px', border: 'none',
                          background: '#fff', borderRadius: '50%', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#22c55e', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#22c55e' }}
                      >
                        <i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p style={{ fontWeight: 700, color: '#22c55e', fontSize: '1rem' }}>
                      KES {Number(itemSubtotal).toLocaleString()}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(product.id)}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <i className="fas fa-trash-alt"></i> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '80px',
            }}>
              <div style={{ paddingBottom: '1rem', borderBottom: '2px solid #f3f4f6', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-receipt" style={{ color: '#22c55e' }}></i> Order Summary
                </h3>
              </div>

              {[
                { label: 'Subtotal', value: `KES ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Shipping', value: `KES ${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Tax (16% VAT)', value: `KES ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.9rem', color: '#666' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #f3f4f6', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#22c55e' }}>
                  KES {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {subtotal < 2000 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '4px', padding: '0.65rem 0.85rem', marginTop: '1rem', fontSize: '0.82rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-truck"></i>
                  Add KES {(2000 - subtotal).toLocaleString()} more for free shipping!
                </div>
              )}

              <button
                onClick={handleCheckout}
                style={{
                  width: '100%', padding: '0.9rem', background: '#22c55e',
                  color: '#fff', border: 'none', borderRadius: '6px',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', marginTop: '1.25rem', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
              >
                <i className="fas fa-lock"></i> Proceed to Checkout
              </button>

              <Link to="/products" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', color: '#22c55e', textDecoration: 'none',
                marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem',
                transition: 'gap 0.2s',
              }}>
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>

              {!user && (
                <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                  <Link to="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Login</Link> or{' '}
                  <Link to="/register" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Register</Link> to checkout
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
