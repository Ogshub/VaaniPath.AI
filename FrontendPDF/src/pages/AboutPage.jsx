const AboutPage = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="container" style={{ flex: 1, padding: '4rem 0' }}>
                 <div className="glass-card" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }}>About <span className="text-gradient">VaaniPath.AI</span></h1>
                    
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        VaaniPath-AI is a next-generation document translation tool designed to solve a critical problem in the language industry: 
                        <strong> format preservation.</strong>
                    </p>
                    
                    <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Most translation tools destroy your document's layout, scrambling tables, images, and fonts. VaaniPath uses advanced computer vision 
                        and AI models (OCR + Layout Analysis) to deconstruct your PDF, translate the text while respecting its spatial context, 
                        and reconstruct it pixel-perfectly in the target language.
                    </p>
                    
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '3rem', marginBottom: '1rem' }}>Our Mission</h2>
                    <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                        To break down language barriers without breaking your documents. Whether you are a student, researcher, or business, 
                        your content deserves to look as good in Hindi as it does in English.
                    </p>
                 </div>
            </div>
        </div>
    );
};

export default AboutPage;
