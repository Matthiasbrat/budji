import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import LogoPng from '../assets/logo.png';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F7FA',
      fontFamily: "'DM Sans', sans-serif",
      overflowX: 'hidden',
    }}>
      {/* NAV */}
      <nav className="sm:!px-8 lg:!px-12" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(244,247,250,.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,.04)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={LogoPng} alt="Budji" style={{ height: 30 }} />
          <span style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: 20,
            color: '#1A1F3C',
            letterSpacing: '-0.03em',
          }}>Budji</span>
        </div>

        {/* Liens de navigation */}
        <div className="hidden md:flex items-center gap-9">
          {['Fonctionnalités', 'Tarifs', 'Sécurité', 'Contact'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#5A6A8A',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#1A1F3C'}
              onMouseLeave={e => e.currentTarget.style.color = '#5A6A8A'}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Bouton Se connecter */}
        <button
          className="hidden sm:block"
          onClick={() => navigate('/app')}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(16,185,129,.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,.25)';
          }}
        >
          Essayer gratuitement
        </button>
      </nav>
      {/* HERO */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-16 sm:pb-20 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
        {/* Colonne gauche — Texte */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl" style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#1A1F3C',
            letterSpacing: '-0.035em',
            marginBottom: 20,
          }}>
            Reprenez le contrôle de votre budget.
          </h1>
          <p style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: '#6B7280',
            marginBottom: 36,
          }}>
            Budji vous aide à suivre vos revenus, dépenses et factures en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* CTA principal */}
            <motion.button
              onClick={() => navigate('/app')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px 32px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(16,185,129,.30)',
                textAlign: 'center',
              }}
            >
              Essayer gratuitement
            </motion.button>
            {/* Bouton secondaire */}
            <button
              onClick={() => {
                document.getElementById('fonctionnalités')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '16px 24px',
                borderRadius: 14,
                background: 'white',
                color: '#3D4A5C',
                fontSize: 15,
                fontWeight: 700,
                border: '1px solid rgba(0,0,0,.08)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                textAlign: 'center',
              }}
            >
              Voir comment ça marche
            </button>
          </div>
        </motion.div>

        {/* Colonne droite — Screenshot de l'app */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.04)',
          }}
        >
          <img
            src="https://picsum.photos/seed/budji-dashboard/1200/800"
            alt="Aperçu de l'application Budji"
            referrerPolicy="no-referrer"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </motion.div>
      </section>
      {/* FEATURES */}
      <section id="fonctionnalités" className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {[
            {
              title: 'Enveloppes budgétaires',
              desc: 'Mettez de l\'argent de côté pour vos projets. Créez des enveloppes, suivez les dépôts et retraits, et gardez le cap sur vos objectifs.',
              bg: 'linear-gradient(135deg, rgba(139,92,246,.06) 0%, rgba(139,92,246,.02) 100%)',
              border: 'rgba(139,92,246,.10)',
              iconColor: '#8B5CF6',
              // Icône enveloppe
              iconPath: 'M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2m18 0v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0l-9 6-9-6',
            },
            {
              title: 'Récurrences & calculs en temps réel',
              desc: 'Configurez vos charges fixes une fois : loyer, abonnements, factures. Elles s\'importent chaque mois et vos soldes se mettent à jour instantanément.',
              bg: 'linear-gradient(135deg, rgba(59,130,246,.06) 0%, rgba(59,130,246,.02) 100%)',
              border: 'rgba(59,130,246,.10)',
              iconColor: '#3B82F6',
              // Icône refresh/récurrence
              iconPath: 'M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 0 0 5.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 0 1 3.51 15',
            },
            {
              title: 'Personnalisation totale',
              desc: 'Couleurs, mode sombre, dégradés de fond, catégories sur mesure. Votre outil de budget s\'adapte à vous, pas l\'inverse.',
              bg: 'linear-gradient(135deg, rgba(16,185,129,.06) 0%, rgba(245,158,11,.02) 100%)',
              border: 'rgba(16,185,129,.10)',
              iconColor: '#10B981',
              // Icône palette/pinceau
              iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9zM6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{
                background: feat.bg,
                border: `1px solid ${feat.border}`,
                borderRadius: 20,
                padding: '36px 32px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,.04)',
                border: '1px solid rgba(0,0,0,.04)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={feat.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={feat.iconPath} />
                </svg>
              </div>
              <h3 style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: '#1A1F3C',
                marginBottom: 10,
                letterSpacing: '-0.01em',
              }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#6B7280' }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* TRUST + PRICING */}
      <section id="tarifs" className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Bloc Confiance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '36px 32px',
              boxShadow: '0 4px 24px rgba(0,0,0,.04)',
              border: '1px solid rgba(0,0,0,.04)',
            }}
          >
            <h3 style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: '#1A1F3C',
              marginBottom: 28,
            }}>
              Vous commencez?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { icon: '🛡️', title: 'Vos données sont sécurisées', desc: '' },
                { icon: '🚫', title: 'Aucune publicité', desc: 'Importez facilement vos transactions bancaires' },
                { icon: '✨', title: 'Simple et transparent', desc: '' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(16,185,129,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1F3C', marginBottom: 2 }}>{item.title}</div>
                    {item.desc && <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.4 }}>{item.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan Gratuit */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '36px 32px',
              boxShadow: '0 4px 24px rgba(0,0,0,.04)',
              border: '1px solid rgba(0,0,0,.04)',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(16,185,129,.08)',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>Gratuit</span>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Essentiel pour commencer</p>
            <div style={{ marginBottom: 24 }}>
              <span className="sm:!text-5xl" style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: '#1A1F3C',
              }}>0 CHF</span>
              <span style={{ fontSize: 15, color: '#9CA3AF', fontWeight: 500 }}> / mois</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Revenus & dépenses illimités', 'Factures à venir illimitées'].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#5A6A8A' }}>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan Premium */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '36px 32px',
              boxShadow: '0 8px 32px rgba(0,0,0,.06)',
              border: '1px solid rgba(16,185,129,.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Badge Premium */}
            <div style={{
              display: 'inline-flex',
              padding: '6px 16px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>Premium</span>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Pour aller plus loin</p>
            <div style={{ marginBottom: 24 }}>
              <span className="sm:!text-5xl" style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: '#1A1F3C',
              }}>4.90 CHF</span>
              <span style={{ fontSize: 15, color: '#9CA3AF', fontWeight: 500 }}> / mois</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Revenus & dépenses illimités',
                'Factures à venir illimitées',
                'Reporting avancé',
                'Catégories personnalisées',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#5A6A8A' }}>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 py-6 sm:py-7 px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto" style={{
        borderTop: '1px solid rgba(0,0,0,.06)',
      }}>
        {/* Logo + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={LogoPng} alt="Budji" style={{ height: 20, opacity: 0.5 }} />
            <span style={{ fontFamily: "'Nunito'", fontWeight: 800, fontSize: 14, color: '#9CA3AF' }}>Budji</span>
          </div>
          <span style={{ fontSize: 12, color: '#CCCCCC' }}>
            © {new Date().getFullYear()} Budji. Tous droits réservés.
          </span>
        </div>

        {/* Liens footer */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {['Fonctionnalités', 'Tarifs', 'Sécurité', 'Contact'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textDecoration: 'none' }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Réseaux sociaux */}
        <div className="flex justify-center items-center gap-3">
          {[
            { name: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
            { name: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
            { name: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z' },
          ].map(social => (
            <a
              key={social.name}
              href="#"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BBBBBB',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#5A6A8A'}
              onMouseLeave={e => e.currentTarget.style.color = '#BBBBBB'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
