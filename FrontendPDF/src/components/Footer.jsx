import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--glass-border)', 
      padding: '3rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          &copy; {new Date().getFullYear()} VaaniPath-AI. Smart Format Preserving Translation.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
