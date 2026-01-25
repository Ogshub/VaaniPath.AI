# VaaniPath.AI - Smart Format-Preserving PDF Translation Tool

![VaaniPath.AI](https://img.shields.io/badge/VaaniPath-AI-4ade80?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=for-the-badge&logo=supabase)

A full-stack web application that translates PDFs between Hindi and English while **perfectly preserving** the original formatting, layout, fonts, and structure.

## ✨ Features

- 🎨 **Format Preservation** - Maintains exact layout, fonts, colors, and positioning
- 🔄 **Real-time Progress** - Live updates during translation process
- 🎯 **Interactive Comparison Slider** - Side-by-side view of original vs translated
- 🔐 **User Authentication** - Secure login with Supabase Auth
- 📊 **Translation History** - Dashboard to view and download past translations
- ☁️ **Cloud Storage** - Automatic upload to Supabase with local fallback
- 📱 **Responsive Design** - Beautiful glassmorphism UI that works on all devices
- 🔗 **Share Links** - Generate public URLs for translated PDFs

## 🚀 Demo

![Demo GIF](demo.gif)

**Live Demo:** [(https://www.linkedin.com/posts/ogshub_fastapi-python-supabase-activity-7420869943497457664-2K1f?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFBDqncBNuNW_TUJdMo87uB-55BkYTB2WIg)]

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icons
- **Vanilla CSS** - Custom glassmorphism design
- **Supabase JS** - Authentication & storage

### Backend
- **FastAPI** - High-performance Python framework
- **Uvicorn** - ASGI server
- **PyMuPDF (fitz)** - PDF manipulation
- **Tesseract OCR** - Text recognition
- **Google Translate API** - Translation engine
- **ReportLab** - PDF generation
- **Supabase Python SDK** - Cloud backend

### Cloud Services
- **Supabase** - Authentication, Database, Storage

## 📋 Prerequisites

- Python 3.10+
- Node.js 16+
- Tesseract OCR installed
- Supabase account (free tier)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Ogshub/VaaniPath.AI.git
cd VaaniPath.AI
```

### 2. Backend Setup
```bash
cd OK/HIN_EN_PDF_Translator

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir temp_pdfs output_pdfs

# Start the backend server
python api.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup
```bash
cd FrontendPDF

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Supabase Configuration

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

4. Update the credentials in:
   - `FrontendPDF/src/utils/supabaseClient.js`
   - `OK/HIN_EN_PDF_Translator/api.py`

5. Create a storage bucket named `pdfs`:
   - Go to **Storage** → **New Bucket**
   - Name: `pdfs`
   - Make it public
   - Add RLS policies (see below)

#### Supabase Storage Policies

Go to **Storage** → **pdfs** → **Policies** and create:

**Policy 1: Public Read**
- Command: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'pdfs'`

**Policy 2: Authenticated Upload**
- Command: `INSERT`
- Target roles: `authenticated`, `anon`
- WITH CHECK expression: `bucket_id = 'pdfs'`

## 📖 Usage

1. **Sign Up/Login** - Create an account or sign in
2. **Upload PDF** - Navigate to Upload page and select a PDF
3. **Wait for Processing** - Watch real-time progress updates
4. **View Comparison** - Use the interactive slider to compare original vs translated
5. **Download** - Download the translated PDF
6. **Share** - Generate a public link to share your translation
7. **Dashboard** - View all your past translations

## 🏗️ Project Structure

```
VaaniPath.AI/
├── FrontendPDF/              # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth context
│   │   ├── utils/            # Supabase client
│   │   └── index.css         # Global styles
│   └── package.json
│
├── OK/HIN_EN_PDF_Translator/ # Python backend
│   ├── PDF_Translate/        # Core translation logic
│   │   ├── constants.py
│   │   ├── textlayer.py
│   │   ├── ocr.py
│   │   ├── utils.py
│   │   ├── overlay.py
│   │   └── pipeline.py
│   ├── api.py                # FastAPI server
│   ├── temp_pdfs/            # Temporary uploads
│   └── output_pdfs/          # Translated outputs
│
└── README.md
```

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## 🎯 API Endpoints

- `POST /upload` - Upload and translate PDF
- `GET /status/{job_id}` - Get translation progress
- `GET /compare/{job_id}/{page}` - Get comparison images
- `GET /history` - List translation history
- `GET /downloads/{filename}` - Download translated PDF

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham** (Ogshub)

- GitHub: [@Ogshub](https://github.com/Ogshub)
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- Tesseract OCR for text recognition
- Google Translate for translation engine
- Supabase for cloud infrastructure
- React and FastAPI communities

## 📧 Contact

For questions or feedback, please open an issue or reach out via [your email].

---

⭐ If you found this project helpful, please give it a star!
