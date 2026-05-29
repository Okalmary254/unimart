import { Link, useSearchParams } from 'react-router-dom'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const order = params.get('order')

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        <div style={{ width: '80px', height: '80px', background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <i className="fas fa-check" style={{ fontSize: '2.5rem', color: '#22c55e' }}></i>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>Order Placed!</h1>
        {order && (
          <p style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '6px', padding: '0.65rem 1rem', fontSize: '0.9rem', color: '#15803d', marginBottom: '1rem', fontWeight: 600 }}>
            Order #{order}
          </p>
        )}
        <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Thank you for your order! We'll send you a confirmation and keep you updated on your delivery.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '0.8rem 1.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-motorcycle"></i> Continue Shopping
          </Link>
          <Link to="/account" style={{ background: '#fff', color: '#1a1a1a', textDecoration: 'none', padding: '0.8rem 1.75rem', borderRadius: '6px', fontWeight: 600, border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-user"></i> My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
