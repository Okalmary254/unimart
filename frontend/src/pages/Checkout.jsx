import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { checkout } from '../api'

const SHIPPING = 200
const TAX_RATE = 0.16

export default function Checkout() {
  const { items, total, fetchCart, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [showModal, setShowModal] = useState(false)
  const [sameAsMpesa, setSameAsMpesa] = useState(false)
  const [modalState, setModalState] = useState({ icon: 'spinner', title: 'Processing', message: '', details: '' })

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Nairobi',
    postal_code: '',
    notes: '',
    mpesa_phone: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
  })

  const subtotal = total
  const tax = subtotal * TAX_RATE
  const shipping = subtotal > 0 ? SHIPPING : 0
  const grandTotal = subtotal + tax + shipping

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCart().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading && items.length === 0) navigate('/cart')
  }, [loading, items])

  // When phone changes and sameAsMpesa is checked, sync mpesa_phone
  useEffect(() => {
    if (sameAsMpesa) {
      setForm(f => ({ ...f, mpesa_phone: f.phone }))
    }
  }, [form.phone, sameAsMpesa])

  const handlePhoneBlur = () => {
    if (paymentMethod === 'mpesa' && !sameAsMpesa) {
      // prompt user if they want to use same number
    }
  }

  const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatPhone = (phone) => {
    let p = phone.replace(/\D/g, '')
    if (p.startsWith('0')) p = '254' + p.substring(1)
    else if (p.startsWith('7') || p.startsWith('1')) p = '254' + p
    else if (!p.startsWith('254')) p = '254' + p
    return p
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      payment_method: paymentMethod,
    }

    if (paymentMethod === 'mpesa') {
      payload.mpesa_phone = formatPhone(form.mpesa_phone || form.phone)
      setShowModal(true)
      setModalState({ icon: 'spinner', title: 'Processing Payment', message: 'Please check your phone for the M-Pesa STK push prompt.', details: '' })
    }

    if (paymentMethod === 'card') {
      setShowModal(true)
      setModalState({ icon: 'spinner', title: 'Processing Card Payment', message: 'Please wait while we process your card...', details: '' })
    }

    try {
      const res = await checkout(payload)
      if (paymentMethod === 'cash') {
        clearCart()
        navigate(`/order-success?order=${res.data.order_number}`)
      } else {
        setModalState({
          icon: 'success',
          title: paymentMethod === 'card' ? 'Payment Successful!' : 'STK Push Sent!',
          message: paymentMethod === 'card'
            ? 'Your card payment was processed successfully.'
            : 'Check your phone and enter your M-Pesa PIN to complete payment.',
          details: `Order: ${res.data.order_number}`,
        })
        setTimeout(() => {
          clearCart()
          navigate(`/order-success?order=${res.data.order_number}`)
        }, 2500)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setModalState({ icon: 'error', title: 'Payment Failed', message: msg, details: '' })
      if (paymentMethod === 'cash') alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '0.9rem', fontFamily: 'inherit',
    background: '#f9fafb', outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }

  const Field = ({ label, name, type = 'text', placeholder, required, maxLength }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
        {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = '#fff' }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb' }}
      />
    </div>
  )

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#22c55e' }}></i>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#1a1a1a', padding: '2rem', borderBottom: '3px solid #22c55e' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
            <span>/</span>
            <Link to="/cart" style={{ color: '#888', textDecoration: 'none' }}>Cart</Link>
            <span>/</span>
            <span style={{ color: '#22c55e' }}>Checkout</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-lock" style={{ color: '#22c55e' }}></i> Secure Checkout
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.3rem' }}>Complete your purchase in just a few steps</p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Progress Steps */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '22px', left: 0, right: 0, height: '2px', background: '#e5e7eb', zIndex: 0 }} />
            {[
              { label: 'Cart', done: true },
              { label: 'Checkout', num: '2', active: true },
              { label: 'Payment', num: '3' },
              { label: 'Complete', num: '4' },
            ].map(({ label, num, done, active }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1, background: '#fff' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 0.4rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem',
                  background: done || active ? '#22c55e' : '#f3f4f6',
                  color: done || active ? '#fff' : '#9ca3af',
                  border: `2px solid ${done || active ? '#22c55e' : '#e5e7eb'}`,
                }}>
                  {done ? <i className="fas fa-check"></i> : num}
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: active || done ? 700 : 500, color: active || done ? '#22c55e' : '#9ca3af' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }} className="checkout-layout">

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem' }}>

            {/* Shipping */}
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fas fa-shipping-fast" style={{ color: '#22c55e' }}></i> Shipping Information
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="First Name" name="first_name" placeholder="First name" required />
                  <Field label="Last Name" name="last_name" placeholder="Last name" required />
                </div>
                <Field label="Email Address" name="email" type="email" placeholder="your@email.com" required />

                {/* Phone with M-Pesa sync prompt */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    Phone Number <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0712345678"
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb' }}
                  />
                  {paymentMethod === 'mpesa' && form.phone.length >= 9 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#555' }}>
                      <input
                        type="checkbox"
                        checked={sameAsMpesa}
                        onChange={e => {
                          setSameAsMpesa(e.target.checked)
                          if (e.target.checked) setForm(f => ({ ...f, mpesa_phone: f.phone }))
                          else setForm(f => ({ ...f, mpesa_phone: '' }))
                        }}
                        style={{ accentColor: '#22c55e', width: '15px', height: '15px' }}
                      />
                      <span>
                        <i className="fas fa-mobile-alt" style={{ color: '#22c55e', marginRight: '0.3rem' }}></i>
                        Use this number for M-Pesa payment
                      </span>
                    </label>
                  )}
                </div>

                <Field label="Street Address" name="address" placeholder="Building, Street" required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="City" name="city" placeholder="Nairobi" required />
                  <Field label="Postal Code" name="postal_code" placeholder="00100" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Delivery Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special instructions for delivery"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fas fa-credit-card" style={{ color: '#22c55e' }}></i> Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { value: 'mpesa', icon: 'fa-mobile-alt', label: 'M-Pesa', desc: 'Pay securely with M-Pesa STK Push' },
                  { value: 'card', icon: 'fa-credit-card', label: 'Card Payment', desc: 'Visa, Mastercard or any debit/credit card' },
                  { value: 'cash', icon: 'fa-money-bill-wave', label: 'Cash on Delivery', desc: 'Pay with cash when you receive your order' },
                ].map(({ value, icon, label, desc }) => (
                  <label
                    key={value}
                    onClick={() => { setPaymentMethod(value); setSameAsMpesa(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                      border: `1.5px solid ${paymentMethod === value ? '#22c55e' : '#e5e7eb'}`,
                      background: paymentMethod === value ? '#f0fdf4' : '#f9fafb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      style={{ accentColor: '#22c55e', width: '18px', height: '18px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <i className={`fas ${icon}`} style={{ color: '#22c55e' }}></i> {label}
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#888' }}>{desc}</p>
                    </div>
                    {value === 'card' && (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {['fa-cc-visa', 'fa-cc-mastercard'].map(c => (
                          <i key={c} className={`fab ${c}`} style={{ fontSize: '1.5rem', color: '#1a1a1a', opacity: 0.5 }}></i>
                        ))}
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* M-Pesa phone */}
              {paymentMethod === 'mpesa' && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>
                    M-Pesa Phone Number <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.mpesa_phone}
                    onChange={e => { setForm(f => ({ ...f, mpesa_phone: e.target.value })); setSameAsMpesa(false) }}
                    placeholder="0712345678"
                    required={paymentMethod === 'mpesa'}
                    style={{ ...inputStyle, background: '#fff' }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fas fa-info-circle" style={{ color: '#22c55e' }}></i>
                    You'll receive an STK push to complete payment
                  </p>
                </div>
              )}

              {/* Card details */}
              {paymentMethod === 'card' && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-lock" style={{ color: '#22c55e' }}></i> Card Details
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem' }}>
                      <i className="fab fa-cc-visa" style={{ fontSize: '1.3rem', color: '#1a56db' }}></i>
                      <i className="fab fa-cc-mastercard" style={{ fontSize: '1.3rem', color: '#eb001b' }}></i>
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                        Name on Card <span style={{ color: '#e74c3c' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.card_name}
                        onChange={e => setForm(f => ({ ...f, card_name: e.target.value }))}
                        placeholder="John Doe"
                        required={paymentMethod === 'card'}
                        style={{ ...inputStyle, background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = '#22c55e'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                        Card Number <span style={{ color: '#e74c3c' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={form.card_number}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').substring(0, 16)
                            const fmt = val.replace(/(.{4})/g, '$1 ').trim()
                            setForm(f => ({ ...f, card_number: fmt }))
                          }}
                          placeholder="0000 0000 0000 0000"
                          required={paymentMethod === 'card'}
                          maxLength={19}
                          style={{ ...inputStyle, background: '#fff', paddingRight: '2.5rem' }}
                          onFocus={e => e.target.style.borderColor = '#22c55e'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <i className="fas fa-credit-card" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', opacity: 0.6 }}></i>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                          Expiry Date <span style={{ color: '#e74c3c' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={form.card_expiry}
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '').substring(0, 4)
                            if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2)
                            setForm(f => ({ ...f, card_expiry: val }))
                          }}
                          placeholder="MM/YY"
                          required={paymentMethod === 'card'}
                          maxLength={5}
                          style={{ ...inputStyle, background: '#fff' }}
                          onFocus={e => e.target.style.borderColor = '#22c55e'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                          CVV <span style={{ color: '#e74c3c' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="password"
                            value={form.card_cvv}
                            onChange={e => setForm(f => ({ ...f, card_cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                            placeholder="•••"
                            required={paymentMethod === 'card'}
                            maxLength={4}
                            style={{ ...inputStyle, background: '#fff' }}
                            onFocus={e => e.target.style.borderColor = '#22c55e'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                          />
                          <i className="fas fa-question-circle" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '0.85rem', cursor: 'help' }} title="3-4 digit code on the back of your card"></i>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className="fas fa-lock" style={{ color: '#22c55e' }}></i>
                      Your card details are encrypted and secure
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: submitting ? '#86efac' : '#22c55e',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '1rem', fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#16a34a' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#22c55e' }}
              >
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  : <><i className="fas fa-lock"></i> Place Order Securely</>
                }
              </button>

              {/* Security badge */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.85rem 1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-shield-alt" style={{ color: '#22c55e', fontSize: '1.25rem' }}></i>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>
                  <strong style={{ color: '#1a1a1a' }}>Secure Checkout</strong><br />
                  Your information is protected with SSL encryption
                </div>
              </div>

              <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', textDecoration: 'none', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <i className="fas fa-arrow-left"></i> Back to Cart
              </Link>
            </div>
          </form>

          {/* Order Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '1rem' }}>
              Order Summary
            </h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1rem' }}>
              {items.map(({ product, quantity, subtotal: itemSub }) => (
                <div key={product.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-motorcycle" style={{ color: '#22c55e', opacity: 0.3 }}></i>
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                      {product.name.substring(0, 28)}{product.name.length > 28 ? '...' : ''}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#888' }}>Qty: {quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    KES {fmt(itemSub)}
                  </p>
                </div>
              ))}
            </div>
            {[
              { label: 'Subtotal', value: fmt(subtotal) },
              { label: 'Tax (16% VAT)', value: fmt(tax) },
              { label: 'Shipping', value: fmt(shipping) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                <span>{label}</span>
                <span style={{ color: '#1a1a1a', fontWeight: 500 }}>KES {value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '2px solid #f3f4f6', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#22c55e' }}>KES {fmt(grandTotal)}</span>
            </div>
            {subtotal < 2000 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '6px', padding: '0.65rem', marginTop: '0.85rem', fontSize: '0.8rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fas fa-truck"></i>
                Add KES {(2000 - subtotal).toLocaleString()} more for free shipping!
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', maxWidth: '380px', width: '90%', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: '1rem' }}>
              {modalState.icon === 'spinner' && <i className="fas fa-spinner fa-pulse" style={{ fontSize: '3rem', color: '#22c55e' }}></i>}
              {modalState.icon === 'success' && <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#22c55e' }}></i>}
              {modalState.icon === 'error' && <i className="fas fa-times-circle" style={{ fontSize: '3rem', color: '#e74c3c' }}></i>}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>{modalState.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{modalState.message}</p>
            {modalState.details && (
              <p style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.6rem', fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                {modalState.details}
              </p>
            )}
            {modalState.icon !== 'spinner' && (
              <button onClick={() => setShowModal(false)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                {modalState.icon === 'success' ? 'Continue' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .checkout-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) {
          .checkout-layout > form > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
