import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { Loader2, ArrowRight } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, done, error
  const [progress, setProgress] = useState(0);
  const [stepName, setStepName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const startTranslation = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'overlay');
    formData.append('translate_dir', 'auto');

    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const jobId = data.job_id;

      // Start polling for status
      setStatus('processing');
      pollStatus(jobId);
      
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Failed to upload document. Is the backend running?');
    }
  };

  const pollStatus = async (jobId) => {
    // Fake progress for visual feedback + real polling
    let p = 0;
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/status/${jobId}`);
            if (res.ok) {
                const job = await res.json();
                if (job.status === 'done') {
                    clearInterval(interval);
                    setProgress(100);
                    setTimeout(() => {
                        navigate('/result', { state: { jobId: jobId } });
                    }, 500);
                } else if (job.status === 'failed') {
                    clearInterval(interval);
                    setStatus('error');
                    setErrorMessage(job.error || 'Translation failed');
                } else {
                    // Still processing, update progress from server
                    setProgress(job.progress);
                    setStepName(job.step);
                }
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 2000);
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '2rem 0' 
    }}>
      
      {status === 'processing' || status === 'uploading' ? (
        <div className="glass-card" style={{ 
          padding: '4rem', 
          width: '100%', 
          maxWidth: '600px', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Background Blob */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
            animation: 'pulse-glow 3s infinite',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Loader2 className="animate-spin" size={64} style={{ color: '#ec4899', marginBottom: '2rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Translating Magic...</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Analyzing layout, detecting fonts, and rewriting history.
            </p>
            
            {/* Progress Bar */}
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              height: '8px', 
              borderRadius: '4px', 
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'var(--primary-gradient)',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#a855f7' }}>
              <span>{Math.round(progress)}%</span>
              <span>{stepName || 'Initializing...'}</span>
            </div>
          </div>
        </div>
      ) : status === 'error' ? (
         <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderColor: '#ef4444' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ marginBottom: '2rem' }}>{errorMessage}</p>
            <button className="btn-secondary" onClick={() => setStatus('idle')}>Try Again</button>
         </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
              Upload Your <span className="text-gradient">Document</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
              We'll handle the rest. PDF format supported.
            </p>
          </div>

          <FileUploader onFileSelect={handleFileSelect} />

          <div className="flex-center" style={{ marginTop: '3rem' }}>
            <button 
              onClick={startTranslation}
              disabled={!file}
              className="btn-primary"
              style={{ 
                opacity: file ? 1 : 0.5, 
                cursor: file ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.25rem',
                padding: '1rem 3rem'
              }}
            >
              Translate Now <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
