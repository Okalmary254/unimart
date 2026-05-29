import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'John Mary',
    position: 'Founder & CEO',
    bio: 'Data Analyst with a passion for motorcycles and e-commerce. Plumber (Data Engineer).',
    image: 'https://okalmjohn.netlify.app/images/profilePic.jpg',
    twitter: 'https://x.com/jean__marie_',
    github: 'https://github.com/okalmary254',
  },
  {
    name: 'Adero David',
    position: 'Operations Manager',
    bio: 'Statistics biker ensuring smooth delivery and customer satisfaction across Kenya.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    twitter: 'https://x.com/jean__marie_',
    github: 'https://github.com/okalmary254',
  },
  {
    name: 'Sam Maina',
    position: 'Tech Lead',
    bio: 'Software Engineering biker building and maintaining our marketplace platform.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    twitter: 'https://x.com/jean__marie_',
    github: 'https://github.com/okalmary254',
  },
  {
    name: 'Odero Anold',
    position: 'Customer Relations',
    bio: 'Marketing biker passionate about creating amazing experiences for the biker community.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    twitter: 'https://x.com/jean__marie_',
    instagram: 'https://instagram.com/phil.anth.ropist',
  },
]

const TESTIMONIALS = [
  {
    text: 'AfrikanBikers is the best marketplace for bikes in Kenya. Found my dream Ninja here at a price I couldn\'t beat anywhere else. The delivery was seamless.',
    author: 'Kevin Mutua',
    role: 'Sports Bike Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108777-466fd103c8ab?auto=format&fit=crop&w=200&q=80',
  },
  {
    text: 'Finally a platform that understands riders. Great selection of cruisers and the team actually knows what they\'re talking about. Highly recommended!',
    author: 'James Omondi',
    role: 'Cruiser Rider, Nairobi',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    text: 'Got my Harley parts at unbeatable prices. The customer service team helped me find exactly what I needed. These guys really live and breathe bikes.',
    author: 'Aisha Mohammed',
    role: 'Touring Biker',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
]

const FAQS = [
  {
    q: 'What are your delivery times?',
    icon: 'fa-clock',
    a: 'We deliver within Nairobi in 2-4 hours for orders placed before 4 PM. Upcountry deliveries take 1-2 business days via our trusted courier partners.',
  },
  {
    q: 'What payment methods do you accept?',
    icon: 'fa-credit-card',
    a: 'We accept M-Pesa, bank transfer, and cash on delivery. M-Pesa STK push is available for instant seamless payment.',
  },
  {
    q: 'What is your return policy?',
    icon: 'fa-undo-alt',
    a: 'We offer a 7-day return policy for defective items. Contact us with your order number and we\'ll arrange a pickup and full refund or replacement.',
  },
  {
    q: 'Do you sell genuine parts and accessories?',
    icon: 'fa-certificate',
    a: 'Yes. Every product listed on AfrikanBikers is verified genuine. We work directly with authorized dealers and importers to guarantee authenticity.',
  },
]

const STATS = [
  { icon: 'fa-users', value: '500+', label: 'Happy Riders' },
  { icon: 'fa-motorcycle', value: '200+', label: 'Bikes Listed' },
  { icon: 'fa-truck', value: '24/7', label: 'Delivery Service' },
  { icon: 'fa-star', value: '4.8/5', label: 'Customer Rating' },
]

export default function About() {
  const [openFaq, setOpenFaq] = useState(0)
  const statsRef = useRef(null)

  const sectionStyle = {
    background: '#fff',
    borderRadius: '8px',
    padding: '3rem',
    marginBottom: '2rem',
    border: '1px solid #e5e7eb',
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2.5rem',
  }

  const h2Style = {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  }

  const underlineStyle = {
    width: '60px',
    height: '3px',
    background: '#22c55e',
    margin: '0 auto',
    borderRadius: '2px',
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#1a1a1a',
        padding: '3.5rem 2rem',
        borderBottom: '3px solid #22c55e',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(34,197,94,0.03) 30px, rgba(34,197,94,0.03) 60px)',
        }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: '#22c55e', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
            Kenya's Premier Bike Marketplace
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            <i className="fas fa-motorcycle" style={{ color: '#22c55e', marginRight: '0.75rem' }}></i>
            About AfrikanBikers
          </h1>
          <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Your trusted partner for premium motorcycles, genuine parts, and riding gear since 2025.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
          <span>/</span>
          <span style={{ color: '#22c55e' }}><i className="fas fa-info-circle"></i> About Us</span>
        </div>

        {/* Story Section */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>
              <i className="fas fa-motorcycle" style={{ color: '#22c55e' }}></i>
              Our Story
            </h2>
            <div style={underlineStyle} />
          </div>

          {/* Mission & Vision */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { icon: 'fa-bullseye', title: 'Our Mission', text: 'To give every Kenyan rider access to premium motorcycles, genuine parts, and expert advice -- all in one trusted marketplace.' },
              { icon: 'fa-eye', title: 'Our Vision', text: 'To become East Africa\'s number one destination for everything motorcycles, built on trust, quality, and a deep love for the ride.' },
            ].map(({ icon, title, text }) => (
              <div key={title} style={{
                background: '#f9fafb', border: '1.5px solid #e5e7eb',
                borderRadius: '8px', padding: '2rem', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '56px', height: '56px', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <i className={`fas ${icon}`} style={{ fontSize: '1.5rem', color: '#22c55e' }}></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: '#666', lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Story content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="story-grid">
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>How We Started</h3>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
                Founded in 2025 by a group of passionate riders and tech bikers at Mama Ngina University, AfrikanBikers was born out of frustration -- finding quality bikes and genuine parts in Kenya was too hard, too expensive, and too unreliable.
              </p>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
                We set out to change that. Starting with a small inventory of cruisers and sports bikes, we built relationships with verified dealers and importers across Kenya, so every listing on our platform is guaranteed authentic.
              </p>
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '1.25rem', borderRadius: '0 6px 6px 0', marginTop: '1.5rem' }}>
                <i className="fas fa-quote-left" style={{ color: '#22c55e', fontSize: '1.25rem', marginRight: '0.5rem' }}></i>
                <strong style={{ color: '#1a1a1a' }}>From riders, for riders</strong>
                <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.95rem' }}>This simple philosophy guides every decision we make.</p>
              </div>
            </div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '340px' }}>
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
                alt="Bikers on the road"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATS.map(({ icon, value, label }) => (
            <div key={label} style={{
              background: '#1a1a1a', borderRadius: '8px', padding: '2rem',
              textAlign: 'center', border: '1.5px solid #2a2a2a', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <i className={`fas ${icon}`} style={{ fontSize: '2rem', color: '#22c55e', display: 'block', marginBottom: '0.75rem' }}></i>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</p>
              <p style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>
              <i className="fas fa-heart" style={{ color: '#22c55e' }}></i>
              Our Values
            </h2>
            <div style={underlineStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: 'fa-motorcycle', title: 'Riders First', text: 'Every decision we make puts riders\' needs at the forefront. We\'re here to serve the riding community.' },
              { icon: 'fa-certificate', title: 'Genuine Only', text: 'We personally verify every product to ensure 100% authenticity. No counterfeits, ever.' },
              { icon: 'fa-hand-holding-usd', title: 'Fair Prices', text: 'We work directly with dealers and importers to cut out the middlemen and pass savings to you.' },
              { icon: 'fa-leaf', title: 'Sustainability', text: 'We promote responsible riding and eco-conscious products including electric bike options.' },
            ].map(({ icon, title, text }) => (
              <div key={title} style={{
                textAlign: 'center', padding: '2rem',
                background: '#f9fafb', border: '1.5px solid #e5e7eb',
                borderRadius: '8px', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '60px', height: '60px', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <i className={`fas ${icon}`} style={{ fontSize: '1.5rem', color: '#22c55e' }}></i>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>
              <i className="fas fa-users" style={{ color: '#22c55e' }}></i>
              Meet Our Team
            </h2>
            <div style={underlineStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {TEAM.map((member) => (
              <div key={member.name} style={{
                background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                overflow: 'hidden', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden', background: '#f0fdf4' }}>
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.7)', padding: '0.75rem',
                    display: 'flex', justifyContent: 'center', gap: '0.75rem',
                  }}>
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer" style={{ width: '34px', height: '34px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', textDecoration: 'none' }}>
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noreferrer" style={{ width: '34px', height: '34px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', textDecoration: 'none' }}>
                        <i className="fab fa-github"></i>
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noreferrer" style={{ width: '34px', height: '34px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', textDecoration: 'none' }}>
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>{member.name}</h3>
                  <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{member.position}</p>
                  <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>
              <i className="fas fa-comments" style={{ color: '#22c55e' }}></i>
              What Riders Say
            </h2>
            <div style={underlineStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.author} style={{
                background: '#f9fafb', border: '1.5px solid #e5e7eb',
                borderRadius: '8px', padding: '1.75rem', position: 'relative',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <i className="fas fa-quote-right" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '3rem', color: 'rgba(34,197,94,0.1)' }}></i>
                <p style={{ color: '#555', lineHeight: 1.8, marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={t.image} alt={t.author} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }} />
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>{t.author}</p>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>
              <i className="fas fa-question-circle" style={{ color: '#22c55e' }}></i>
              Frequently Asked Questions
            </h2>
            <div style={underlineStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: `1.5px solid ${openFaq === i ? '#22c55e' : '#e5e7eb'}`, borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{
                    width: '100%', padding: '1.1rem 1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: openFaq === i ? '#f0fdf4' : '#fff',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem' }}>
                    <i className={`fas ${faq.icon}`} style={{ color: '#22c55e' }}></i>
                    {faq.q}
                  </span>
                  <i className={`fas fa-chevron-${openFaq === i ? 'up' : 'down'}`} style={{ color: '#22c55e', fontSize: '0.85rem', flexShrink: 0 }}></i>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0.75rem 1.25rem 1.25rem', background: '#f9fafb' }}>
                    <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.9rem' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: '#1a1a1a', borderRadius: '8px', padding: '3.5rem 2rem',
          textAlign: 'center', marginBottom: '2rem', border: '1.5px solid #2a2a2a',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(34,197,94,0.03) 20px, rgba(34,197,94,0.03) 40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <i className="fas fa-motorcycle" style={{ fontSize: '3rem', color: '#22c55e', display: 'block', marginBottom: '1rem' }}></i>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Join the AfrikanBikers Community
            </h2>
            <p style={{ color: '#888', fontSize: '1.05rem', marginBottom: '2rem' }}>
              Be part of Kenya's fastest-growing motorcycle marketplace.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/products" style={{
                background: '#22c55e', color: '#fff', textDecoration: 'none',
                padding: '0.9rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <i className="fas fa-motorcycle"></i> Browse Bikes
              </Link>
              <Link to="/contact" style={{
                background: 'transparent', color: '#fff', textDecoration: 'none',
                padding: '0.9rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.95rem',
                border: '1.5px solid #444', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
              >
                <i className="fas fa-envelope"></i> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
