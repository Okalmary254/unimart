import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendContact } from '../api'

const HOURS = [
  { icon: 'fa-calendar-day', day: 'Monday - Friday', time: '8:00 AM - 6:00 PM', status: 'Open', color: '#22c55e' },
  { icon: 'fa-calendar-day', day: 'Saturday', time: '9:00 AM - 3:00 PM', status: 'Open', color: '#22c55e' },
  { icon: 'fa-calendar-day', day: 'Sunday', time: 'Closed', status: 'Closed', color: '#e74c3c' },
  { icon: 'fa-calendar-day', day: 'Public Holidays', time: '10:00 AM - 2:00 PM', status: 'Limited', color: '#f39c12' },
]

const FAQS = [
  { q: 'How fast is your delivery?', a: 'We deliver within Nairobi in 2-4 hours. Upcountry deliveries take 1-2 business days via our courier partners.' },
  { q: "What's your return policy?", a: 'We offer 7-day returns for defective items. Contact us with your order number and we\'ll arrange pickup and replacement.' },
  { q: 'Do you accept M-Pesa?', a: 'Yes! We accept M-Pesa STK push, bank transfer, and cash on delivery for all orders.' },
  { q: 'Are all bikes and parts genuine?', a: 'Absolutely. Every product is verified genuine. We work directly with authorized dealers and importers across Kenya.' },
]

const inputStyle = {
  width: '100%',
  padding: '0.85rem 0.85rem 0.85rem 2.6rem',
  border: '1.5px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const iconStyle = {
  position: 'absolute',
  left: '0.85rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#22c55e',
  fontSize: '0.9rem',
  pointerEvents: 'none',
}

export default function Contact() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', subject: '', message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim()) e.last_name = 'Last name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.subject) e.subject = 'Please select a subject'
    if (!form.message.trim()) e.message = 'Message is required'
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    try {
      await sendContact({
        name: `${form.first_name} ${form.last_name}`,
        email: form.email,
        subject: form.subject,
        message: form.message,
      })
      setSuccess(true)
      setForm({ first_name: '', last_name: '', email: '', phone: '', subject: '', message: '' })
      setErrors({})
      setTimeout(() => setSuccess(false), 5000)
    } catch {
      setErrors({ submit: 'Failed to send message. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const Field = ({ name, placeholder, icon, type = 'text' }) => (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })) }}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: errors[name] ? '#e74c3c' : '#e5e7eb' }}
        onFocus={e => e.target.style.borderColor = '#22c55e'}
        onBlur={e => e.target.style.borderColor = errors[name] ? '#e74c3c' : '#e5e7eb'}
      />
      <i className={`fas ${icon}`} style={iconStyle}></i>
      {errors[name] && <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <i className="fas fa-exclamation-circle"></i> {errors[name]}
      </p>}
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a', padding: '3rem 2rem', textAlign: 'center',
        borderBottom: '3px solid #22c55e', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(34,197,94,0.03) 20px, rgba(34,197,94,0.03) 40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: '#22c55e', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
            We're Here to Help
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            <i className="fas fa-headset" style={{ color: '#22c55e', marginRight: '0.75rem' }}></i>
            Get in Touch
          </h1>
          <p style={{ color: '#888', fontSize: '1.05rem' }}>
            Have a question about a bike or an order? We'd love to hear from you.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
          <span>/</span>
          <span style={{ color: '#22c55e' }}><i className="fas fa-envelope"></i> Contact Us</span>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '6px',
            padding: '1rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <i className="fas fa-check-circle" style={{ color: '#22c55e', fontSize: '1.25rem' }}></i>
            <span style={{ color: '#15803d', fontWeight: 600 }}>Message sent! We'll get back to you within 24 hours.</span>
            <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: '1.1rem' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Contact Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }} className="contact-grid">

          {/* Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                icon: 'fa-map-marker-alt',
                title: 'Visit Us',
                lines: [
                  { icon: 'fa-map-pin', text: 'Nairobi, Kenya' },
                  { icon: 'fa-building', text: 'Industrial Area, Mombasa Rd' },
                  { icon: 'fa-info-circle', text: 'Open for walk-ins Mon-Sat' },
                ],
              },
              {
                icon: 'fa-phone-alt',
                title: 'Call Us',
                lines: [
                  { icon: 'fa-phone', text: '+254 743 874 690', href: 'tel:+254743874690' },
                  { icon: 'fa-phone', text: '+254 783 845 747', href: 'tel:+254783845747' },
                  { icon: 'fa-clock', text: 'Mon-Fri, 8am - 6pm' },
                ],
                social: [
                  { href: 'https://wa.me/254783845747', icon: 'fa-whatsapp' },
                  { href: 'https://t.me/ProfJeanMarie', icon: 'fa-telegram' },
                ],
              },
              {
                icon: 'fa-envelope',
                title: 'Email Us',
                lines: [
                  { icon: 'fa-envelope', text: 'support@afrikanbikers.com' },
                  { icon: 'fa-envelope', text: 'sales@afrikanbikers.com' },
                  { icon: 'fa-clock', text: 'Response within 24 hours' },
                ],
              },
            ].map(({ icon, title, lines, social }) => (
              <div key={title} style={{
                background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                padding: '1.5rem', borderLeft: '3px solid #22c55e',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <i className={`fas ${icon}`} style={{ color: '#22c55e', fontSize: '1.25rem' }}></i>
                </div>
                <h3 style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>{title}</h3>
                {lines.map(({ icon: li, text, href }) => (
                  <p key={text} style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <i className={`fas ${li}`} style={{ color: '#22c55e', width: '16px' }}></i>
                    {href ? <a href={href} style={{ color: '#22c55e', textDecoration: 'none' }}>{text}</a> : text}
                  </p>
                ))}
                {social && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
                    {social.map(({ href, icon: si }) => (
                      <a key={href} href={href} target="_blank" rel="noreferrer" style={{
                        width: '34px', height: '34px', background: '#f0fdf4', border: '1px solid #22c55e',
                        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#22c55e', textDecoration: 'none', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#22c55e' }}
                      >
                        <i className={`fab ${si}`}></i>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <i className="fas fa-paper-plane" style={{ color: '#22c55e' }}></i>
                Send Message
              </h2>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>We'll get back to you within 24 hours</p>
            </div>

            {errors.submit && (
              <p style={{ color: '#e74c3c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-circle"></i> {errors.submit}
              </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field name="first_name" placeholder="First Name" icon="fa-user" />
                <Field name="last_name" placeholder="Last Name" icon="fa-user" />
              </div>

              <Field name="email" placeholder="Email Address" icon="fa-envelope" type="email" />
              <Field name="phone" placeholder="Phone Number (optional)" icon="fa-phone" type="tel" />

              <div style={{ position: 'relative' }}>
                <select
                  value={form.subject}
                  onChange={e => { setForm(f => ({ ...f, subject: e.target.value })); setErrors(er => ({ ...er, subject: '' })) }}
                  style={{ ...inputStyle, borderColor: errors.subject ? '#e74c3c' : '#e5e7eb', appearance: 'none', color: form.subject ? '#1a1a1a' : '#888' }}
                >
                  <option value="" disabled>Select Subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Delivery Issue">Delivery Issue</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
                <i className="fas fa-tag" style={iconStyle}></i>
                {errors.subject && <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '3px' }}><i className="fas fa-exclamation-circle"></i> {errors.subject}</p>}
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                  value={form.message}
                  onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: '' })) }}
                  placeholder="Your Message"
                  rows={5}
                  style={{ ...inputStyle, padding: '1rem 0.85rem 0.85rem 2.6rem', resize: 'vertical', borderColor: errors.message ? '#e74c3c' : '#e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = errors.message ? '#e74c3c' : '#e5e7eb'}
                />
                <i className="fas fa-comment" style={{ ...iconStyle, top: '1.1rem', transform: 'none' }}></i>
                {errors.message && <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '3px' }}><i className="fas fa-exclamation-circle"></i> {errors.message}</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? '#86efac' : '#22c55e', color: '#fff',
                    border: 'none', padding: '0.85rem 2rem', borderRadius: '6px',
                    fontWeight: 700, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s',
                  }}
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <><span>Send Message</span><i className="fas fa-paper-plane"></i></>
                  )}
                </button>
                <p style={{ color: '#888', fontSize: '0.8rem' }}>
                  <span style={{ color: '#e74c3c' }}>*</span> Required fields
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Business Hours */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            <i className="fas fa-clock" style={{ color: '#22c55e' }}></i> Business Hours
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {HOURS.map(({ icon, day, time, status, color }) => (
              <div key={day} style={{
                textAlign: 'center', padding: '1.5rem', background: '#f9fafb',
                border: '1.5px solid #e5e7eb', borderRadius: '6px', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <i className={`fas ${icon}`} style={{ fontSize: '1.75rem', color: '#22c55e', display: 'block', marginBottom: '0.75rem' }}></i>
                <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '0.3rem', fontSize: '0.9rem' }}>{day}</p>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{time}</p>
                <span style={{ background: color, color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '20px' }}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick FAQ */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            <i className="fas fa-question-circle" style={{ color: '#22c55e' }}></i> Quick Help
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} style={{
                background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                padding: '1.25rem', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fas fa-question" style={{ color: '#22c55e', fontSize: '0.75rem' }}></i>
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>{q}</h4>
                </div>
                <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '2.25rem' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
