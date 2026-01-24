import React, { useState, useEffect } from 'react';
import { Clock, Download, FileText, Search, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // 1. Try Supabase first
      const { data, error } = await supabase.storage.from('pdfs').list();
      
      if (!error && data && data.length > 0) {
          const files = data.map((file) => ({
            id: file.name,
            name: file.name,
            lang: 'Detected',
            date: new Date(file.created_at).toLocaleDateString(),
            status: 'Completed',
            size: (file.metadata?.size / 1024 / 1024).toFixed(2) + ' MB'
          }));
          setHistory(files);
          setLoading(false);
          return;
      }
    } catch (e) {
      console.log("Supabase fetch failed, trying local...");
    }

    // 2. Fallback to Local API
    try {
        const res = await fetch('http://localhost:8000/history');
        if (res.ok) {
            const localData = await res.json();
            setHistory(localData);
        }
    } catch (e) {
        console.error("Local history fetch failed", e);
    } finally {
        setLoading(false);
    }
  };

  const handleShare = (id) => {
    navigate(`/share/${encodeURIComponent(id)}`);
  };
  
  const handleDownload = async (file) => {
      // Check if file object already has a full URL (Local mode)
      if (file.url) {
          window.location.href = file.url;
          return;
      }
      
      // Otherwise try Supabase public URL
      const { data } = supabase.storage.from('pdfs').getPublicUrl(file.id);
      if (data?.publicUrl) {
          window.location.href = data.publicUrl;
      }
  };

  return (
    <div className="container" style={{ padding: '2rem 2rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Translations</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and download your translated documents.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search files..." 
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '9999px',
              padding: '0.6rem 1rem 0.6rem 3rem',
              color: 'white',
              outline: 'none',
              minWidth: '250px'
            }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Document Name</th>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Language</th>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</th>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Size</th>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                    <FileText size={20} color="#6366f1" />
                  </div>
                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{item.lang}</td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> {item.date}
                  </div>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{item.size}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: item.status === 'Completed' ? '#10b981' : '#ef4444'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  {item.status === 'Completed' && (
                    <>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="btn-secondary" 
                        title="Download"
                        style={{ padding: '0.5rem', borderRadius: '8px' }}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleShare(item.id)}
                        className="btn-secondary" 
                        title="Share"
                        style={{ padding: '0.5rem', borderRadius: '8px', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                      >
                        <Share2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
