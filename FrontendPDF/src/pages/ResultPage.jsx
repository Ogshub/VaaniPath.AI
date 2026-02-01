import React, { useEffect, useState, useRef } from 'react';
import { Download, CheckCircle, ArrowLeft, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const ResultPage = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;
  const [comparisonData, setComparisonData] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [jobData, setJobData] = useState(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    setShowConfetti(true);
    if (jobId) {
        fetchJobDetails(jobId);
    } else {
        // Fallback for direct access
        navigate('/');
    }
  }, [jobId, navigate]);

  const fetchJobDetails = async (id) => {
      try {
          const res = await fetch(`${API_BASE_URL}/status/${id}`);
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
    const handleTouchEnd = () => { isDragging.current = false; };
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (jobId) {
        setComparisonData(null); // Clear while loading next page
        fetch(`${API_BASE_URL}/compare/${jobId}/${currentPage}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setComparisonData(data);
                }
            })
            .catch(err => console.error("Comparison not available for page", currentPage));
    }
  }, [jobId, currentPage]);

  const goToNextPage = () => {
      if (jobData && currentPage < jobData.total_pages - 1) {
          setCurrentPage(prev => prev + 1);
      }
  };
  const goToPrevPage = () => setCurrentPage(prev => Math.max(0, prev - 1));

  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '2rem 0',
      position: 'relative'
    }}>
      <div className="glass-card" style={{ 
        padding: '2.5rem', 
        textAlign: 'center', 
        maxWidth: '1000px', 
        width: '100%',
        borderTop: '4px solid #4ade80',
        zIndex: 1
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            background: 'rgba(74, 222, 128, 0.1)',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={48} color="#4ade80" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Translation <span style={{ color: '#4ade80' }}>Ready!</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            Compare original vs translated pages using the slider below.
          </p>
        </div>

        {/* COMPARISON SLIDER */}
        <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto 2rem auto' }}>
            {comparisonData ? (
                <>
                    <div 
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onTouchMove={(e) => {
                            if (!containerRef.current) return;
                            const rect = containerRef.current.getBoundingClientRect();
                            const touch = e.touches[0];
                            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                            setSliderPosition((x / rect.width) * 100);
                        }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            cursor: 'ew-resize',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                            userSelect: 'none',
                            aspectRatio: `${comparisonData.width} / ${comparisonData.height}`,
                            background: '#0a0a0a'
                        }}
                    >
                        {/* Translated Image (Background) */}
                        <img 
                            src={comparisonData.translated} 
                            alt="Translated" 
                            draggable={false}
                            style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none', objectFit: 'contain' }} 
                        />
                        
                        {/* Original Image (Overlay) */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${sliderPosition}%`,
                            height: '100%',
                            overflow: 'hidden',
                            borderRight: '3px solid #6366f1',
                            zIndex: 5
                        }}>
                            <img 
                                src={comparisonData.original} 
                                alt="Original"
                                draggable={false}
                                style={{ 
                                    width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', 
                                    height: containerRef.current ? `${containerRef.current.offsetHeight}px` : '100%', 
                                    maxWidth: 'none',
                                    display: 'block', 
                                    objectFit: 'contain',
                                    pointerEvents: 'none'
                                }} 
                            />
                        </div>
                        
                        {/* Handle */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${sliderPosition}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '48px',
                            height: '48px',
                            background: '#6366f1',
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
                            zIndex: 10,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <ChevronLeft size={16} />
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Page Controls */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '2rem', 
                        marginTop: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <button 
                            onClick={goToPrevPage} 
                            disabled={currentPage === 0}
                            className="btn-secondary"
                            style={{ 
                                padding: '0.6rem 1.5rem', 
                                opacity: currentPage === 0 ? 0.3 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ChevronLeft size={18} /> Prev
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#4ade80' }}>
                                Page {currentPage + 1} {jobData?.total_pages && `of ${jobData.total_pages}`}
                            </span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Select Page</span>
                        </div>

                        <button 
                            onClick={goToNextPage}
                            disabled={jobData && currentPage >= jobData.total_pages - 1}
                            className="btn-secondary"
                            style={{ 
                                padding: '0.6rem 1.5rem',
                                opacity: (jobData && currentPage >= jobData.total_pages - 1) ? 0.3 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                             Next <ChevronRight size={18} />
                        </button>
                    </div>
                </>
            ) : (
                 <div style={{ 
                     padding: '6rem 2rem', 
                     border: '2px dashed rgba(255,255,255,0.08)', 
                     borderRadius: '20px', 
                     color: 'var(--text-secondary)',
                     background: 'rgba(0,0,0,0.3)',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '1rem'
                 }}>
                     <div className="animate-spin" style={{ 
                         width: '30px', 
                         height: '30px', 
                         border: '3px solid #6366f1', 
                         borderTopColor: 'transparent', 
                         borderRadius: '50%' 
                     }} />
                     {currentPage > 0 ? `Loading Page ${currentPage + 1}...` : "Preparing comparison tool..."}
                 </div>
            )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem', 
          marginBottom: '2rem',
          maxWidth: '550px',
          margin: '0 auto 2rem auto'
        }}>
          <button 
            onClick={handleDownload} 
            disabled={!jobData?.result_url}
            className="btn-primary" 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem',
                opacity: !jobData?.result_url ? 0.5 : 1
            }}
          >
            <Download size={22} />
            Download PDF
          </button>
          
          <button 
            onClick={() => {
              const shareUrl = `${window.location.origin}/share/${jobId}`;
              navigator.clipboard.writeText(shareUrl);
              alert('Share link copied to clipboard!');
            }}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            <Share2 size={22} />
            Share Link
          </button>
        </div>

        <Link to="/" style={{ 
          color: 'var(--text-secondary)', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.95rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          transition: 'all 0.3s'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <ArrowLeft size={18} /> Start New Translation
        </Link>
      </div>

      {/* Background Gradients */}
      <div style={{ 
        position: 'fixed', 
        width: '50vw', 
        height: '50vh', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', 
        top: '-10%', 
        left: '-10%', 
        zIndex: 0 
      }} />
      <div style={{ 
        position: 'fixed', 
        width: '60vw', 
        height: '60vh', 
        background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)', 
        bottom: '-10%', 
        right: '-10%', 
        zIndex: 0 
      }} />
    </div>
  );
};

export default ResultPage;
