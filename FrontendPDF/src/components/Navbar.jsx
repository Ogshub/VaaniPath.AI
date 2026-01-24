import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, User, LogOut, LayoutDashboard, ChevronDown, Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full py-4" style={{ zIndex: 50 }}>
      {/* ... keeping logo same ... */}
      <div className="container flex-center" style={{ justifyContent: 'space-between' }}>
        <Link to="/" className="flex-center" style={{ gap: '0.75rem' }}>
          <div className="flex-center" style={{ 
            background: 'var(--primary-gradient)', 
            padding: '0.5rem', 
            borderRadius: '12px' 
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            letterSpacing: '-0.5px' 
          }}>
            VaaniPath<span className="text-gradient">.AI</span>
          </span>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="/#features" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Features</a>
          <a href="/about" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>About</a>
          <a 
            href="https://github.com/Ogshub/VaaniPath.AI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-center"
            style={{ color: 'var(--text-secondary)', fontWeight: 500, gap: '0.5rem', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Github size={20} />
            <span>GitHub</span>
          </a>
          
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex-center btn-secondary"
                style={{ gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '12px' }}
              >
                <div style={{ background: '#a855f7', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontWeight: '500' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {dropdownOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '120%', 
                  right: 0, 
                  width: '200px', 
                  background: 'rgba(20, 20, 30, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px',
                  padding: '0.5rem',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex-center"
                    style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="flex-center"
                    style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', color: '#ef4444', width: '100%', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
