import React, { useState, useEffect } from 'react';
import { Download, FileText, Share2, Copy, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { supabase } from '../utils/supabaseClient';

const SharedPage = () => {
  const { id } = useParams(); // id is filename here for now
  const [copied, setCopied] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (id) {
         fetchFile(id);
     }
  }, [id]);

  const fetchFile = async (id) => {
      // The ID is the jobId, construct the filename
      const filename = `result_${id}.pdf`;
      
      // Get public URL from Supabase
      const { data } = supabase.storage.from('pdfs').getPublicUrl(filename);
      
      if (data?.publicUrl) {
          setFileData({
              name: filename,
              url: data.publicUrl,
              size: "Unknown",
              lang: "Detected",
              date: new Date().toLocaleDateString()
          });
      } else {
          // Fallback to local
          setFileData({
              name: filename,
              url: `http://localhost:8000/downloads/${filename}`,
              size: "Unknown",
              lang: "Detected",
              date: new Date().toLocaleDateString()
          });
      }
      setLoading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
      <div className="animate-float" style={{ marginBottom: '2rem' }}>
        <div style={{ 
          background: 'var(--primary-gradient)', 
          padding: '1.5rem', 
          borderRadius: '24px',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)'
        }}>
          <FileText size={48} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
        Shared Document
      </h1>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        Someone shared a translated document with you. You can download it below.
      </p>

      {loading || !fileData ? (
          <div className="flex-center">Loading...</div>
      ) : (
      <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <FileText size={24} color="#a855f7" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileData.name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {fileData.date} • {fileData.lang}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <a href={fileData.url} download target="_blank" rel="noreferrer" className="btn-primary flex-center" style={{ width: '100%', gap: '0.5rem' }}>
            <Download size={20} /> Download PDF
          </a>
          
          <button 
            onClick={handleCopyLink}
            className="btn-secondary flex-center" 
            style={{ width: '100%', gap: '0.5rem' }}
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied ? "Link Copied!" : "Share Link"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default SharedPage;
