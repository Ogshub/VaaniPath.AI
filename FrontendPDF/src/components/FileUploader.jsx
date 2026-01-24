import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const FileUploader = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  return (
    <div 
      className="glass-card"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border: isDragging ? '2px dashed #a855f7' : '2px dashed var(--glass-border)',
        padding: '4rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isDragging ? 'rgba(168, 85, 247, 0.1)' : 'var(--glass-bg)'
      }}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept=".pdf" 
        style={{ display: 'none' }} 
      />
      
      {file ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
          <CheckCircle size={64} className="text-gradient" style={{ color: '#4ade80' }} />
          <h3 style={{ fontSize: '1.5rem' }}>{file.name}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p className="text-gradient" style={{ fontWeight: 600 }}>Ready to translate</p>
        </div>
      ) : (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '1.5rem', 
            borderRadius: '50%' 
          }}>
            <Upload size={48} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload your PDF</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Drag & drop or click to browse</p>
          </div>
          <div style={{ marginTop: '1rem' }}>
             <span style={{ 
               background: 'rgba(255,255,255,0.1)', 
               padding: '0.25rem 0.75rem', 
               borderRadius: '4px',
               fontSize: '0.875rem',
               color: 'var(--text-secondary)'
             }}>
               Supports PDF up to 50MB
             </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
