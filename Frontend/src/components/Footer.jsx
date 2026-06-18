// src/components/Footer.jsx
import React from 'react';

/**
 * Footer — Global footer component.
 * Displays branding, quick links, and social media icons.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      Icon: InstagramIcon,
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com',
      Icon: TikTokIcon,
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/6281234567890',
      Icon: WhatsAppIcon,
    },
  ];

  const footerLinks = [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Cara Order', href: '/how-to-order' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
  ];

  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid rgba(51, 65, 85, 0.5)',
        marginTop: 'auto',
      }}
    >
      {/* ── Main footer content ── */}
      <div
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Brand column */}
          <div>
            <p style={{ margin: '0 0 6px 0' }}>
              <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.125rem' }}>Risol</span>
              <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 800, fontSize: '1.125rem' }}>Mayo</span>
            </p>
            <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '0.8125rem', lineHeight: 1.6, margin: '0 0 1.25rem 0', maxWidth: '200px' }}>
              Risol Mayo renyah, creamy, dan selalu bikin ketagihan. Pesan sekarang, kirim ke mana saja!
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
                    e.currentTarget.style.color = '#22d3ee';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                    e.currentTarget.style.color = 'rgba(148, 163, 184, 0.8)';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links column */}
          <div>
            <h4
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 1rem 0',
              }}
            >
              Navigasi
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      color: 'rgba(148, 163, 184, 0.75)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.92)')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(148, 163, 184, 0.75)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 1rem 0',
              }}
            >
              Kontak
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'rgba(148, 163, 184, 0.75)', fontSize: '0.875rem', margin: 0 }}>
                📍 Jl. Risol Enak No. 42, Jakarta
              </p>
              <p style={{ color: 'rgba(148, 163, 184, 0.75)', fontSize: '0.875rem', margin: 0 }}>
                📞 +62 812-3456-7890
              </p>
              <p style={{ color: 'rgba(148, 163, 184, 0.75)', fontSize: '0.875rem', margin: 0 }}>
                ✉️ hello@risolmayo.id
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div
        style={{
          borderTop: '1px solid rgba(51, 65, 85, 0.4)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            color: 'rgba(100, 116, 139, 0.8)',
            fontSize: '0.8125rem',
            margin: 0,
            textAlign: 'center',
          }}
        >
          &copy; {year} Risol Mayo. Dibuat dengan ❤️ di Indonesia.
        </p>
      </div>
    </footer>
  );
};

/* ── Inline SVG Icon Components ── */
const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.26 8.26 0 004.83 1.55V6.94a4.85 4.85 0 01-1.06-.25z" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default Footer;
