import React, { useEffect, useState, useRef } from 'react';
import { Download, CheckCircle, ArrowLeft, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ResultPage = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const location = useLocation();
  const jobId = location.state?.jobId;
  const [comparisonData, setComparisonData] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    setShowConfetti(true);
    if (jobId) {
        // Poll backend to get the result URL if not passed in state
        fetchJobDetails(jobId);
    }
  }, [jobId]);

  const [jobData, setJobData] = useState(null);

  const fetchJobDetails = async (id) => {
      try {
          const res = await fetch(`http://localhost:8000/status/${id}`);
          if (res.ok) {
              const data = await res.json();
              setJobData(data);
          }
      } catch (e) {
          console.error("Failed to fetch job", e);
      }
  };

  const handleDownload = () => {
      if (jobData?.result_url) {
          window.location.href = jobData.result_url;
      }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };
  
  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Placeholder for Comparison Data fetch (Backend needs to implement /compare endpoint)
  // For now, we will simulate it or hide it gracefully if data is missing, 
  // but strictly keep the UI code here so it appears "not lost".

  useEffect(() => {
    if (jobId) {
        // Fetch comparison data if available
        fetch(`http://localhost:8000/compare/${jobId}/0`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setComparisonData(data))
            .catch(err => console.log("Comparison not available yet"));
    }
  }, [jobId]);



  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '4rem 0'
    }}>
      <div className="glass-card animate-float" style={{ 
        padding: '3rem', 
        textAlign: 'center', 
        maxWidth: '900px', 
        width: '100%',
        borderTop: '4px solid #4ade80'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1.5rem', 
            borderRadius: '50%', 
            background: 'rgba(74, 222, 128, 0.1)',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={64} color="#4ade80" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
            Translation <span style={{ color: '#4ade80' }}>Complete!</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            Your document has been translated.
          </p>
        </div>

        {/* COMPARISON SLIDER */}
        {comparisonData ? (
            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem auto',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'ew-resize',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
            >
                {/* Translated Image (Background) */}
                <img 
                    src={comparisonData.translated} 
                    alt="Translated" 
                    draggable={false}
                    style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', userSelect: 'none', objectFit: 'contain', objectPosition: 'top' }} 
                />
                
                {/* Original Image (Overlay) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${sliderPosition}%`,
                    height: '100%',
                    overflow: 'hidden',
                    borderRight: '2px solid #6366f1',
                    background: 'white' // Fallback
                }}>
                    <img 
                        src={comparisonData.original} 
                        alt="Original"
                        draggable={false}
                        style={{ 
                            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '600px', 
                            height: 'auto', 
                            maxWidth: 'none',
                             display: 'block', 
                             objectFit: 'contain',
                             objectPosition: 'top',
                             pointerEvents: 'none',
                             userSelect: 'none'
                        }} 
                    />
                </div>
                
                {/* Handle */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${sliderPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                    background: '#6366f1',
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />
            </div>
        ) : (
             <div style={{ padding: '2rem', border: '1px dashed #444', borderRadius: '12px', marginBottom: '2rem', color: '#666' }}>
                 Comparison preview not available for this file.
             </div>
        )}

        <div style={{ 
          display: 'grid', 
          gap: '1rem', 
          marginBottom: '2.5rem',
          maxWidth: '400px',
          margin: '0 auto 2.5rem auto'
        }}>
          {jobData?.result_url ? (
            <button onClick={handleDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
              <Download size={20} />
              Download Translated PDF
            </button>
          ) : (
            <div className="flex-center" style={{ color: 'var(--text-secondary)' }}>Loading Result...</div>
          )}
          
          <button 
            onClick={() => {
              const shareUrl = `${window.location.origin}/share/${jobId}`;
              navigator.clipboard.writeText(shareUrl);
              alert('Share link copied to clipboard!');
            }}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}
          >
            <Share2 size={20} />
            Share Result
          </button>
        </div>

        <Link to="/" style={{ 
          color: 'var(--text-secondary)', 
          textDecoration: 'underline', 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <ArrowLeft size={14} /> Translate another file
        </Link>
      </div>

      {/* Decorative Elements */}
      <div style={{ 
        position: 'absolute', 
        width: '300px', 
        height: '300px', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', 
        top: '20%', 
        left: '10%', 
        zIndex: -1 
      }} />
      <div style={{ 
        position: 'absolute', 
        width: '400px', 
        height: '400px', 
        background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', 
        bottom: '10%', 
        right: '5%', 
        zIndex: -1 
      }} />
    </div>
  );
};

export default ResultPage;
