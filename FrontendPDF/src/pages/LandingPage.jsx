import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileType, Languages, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '4rem 0'
      }}>
        <div className="animate-float" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(236, 72, 153, 0.5) 100%)', 
            padding: '1px', 
            borderRadius: '9999px',
            display: 'inline-block'
          }}>
            <span style={{ 
              background: 'rgba(0, 0, 0, 0.6)', 
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1.5rem', 
              borderRadius: '9999px',
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              ✨ Now with Smart Format Retention
            </span>
          </div>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
          fontWeight: '900', 
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          letterSpacing: '-2px'
        }}>
          Translate PDFs<br />
          <span className="text-gradient">Without Losing Formatting</span>
        </h1>

        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          VaaniPath-AI preserves your document's original layout, fonts, and images while translating content into any language instantly.
        </p>

        <Link to="/upload" className="btn-primary flex-center animate-pulse-glow" style={{ gap: '0.5rem', fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
          Start Translating <ArrowRight size={20} />
        </Link>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '4rem 0', marginBottom: '4rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          <FeatureCard 
            icon={<FileType size={32} color="#6366f1" />}
            title="Format Preservation"
            desc="Keep your tables, charts, and layouts exactly where they belong."
          />
          <FeatureCard 
            icon={<Languages size={32} color="#ec4899" />}
            title="100+ Languages"
            desc="Powered by advanced AI models for accurate and nuanced translations."
          />
          <FeatureCard 
            icon={<Zap size={32} color="#a855f7" />}
            title="Lightning Fast"
            desc="Get your translated documents in seconds, not ours."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card" style={{ padding: '2rem' }}>
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      width: '60px', 
      height: '60px', 
      borderRadius: '16px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: '1.5rem'
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

export default LandingPage;
