
# FastAPI Backend Design
# This file serves as the main entry point (api.py) for the backend.
# It uses FastAPI for the web server, Supabase for auth/db, and standard python libs for processing.
# It connects to the EXISTING core translation logic (PDF_Translate module).

import os
import shutil
import uuid
import time
import base64
import fitz  # PyMuPDF
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from supabase import create_client, Client
from pdf2image import convert_from_path

# --- Import Core Translation Logic ---
from PDF_Translate.constants import DEFAULT_LANG, DEFAULT_DPI, DEFAULT_OPTIMIZE
from PDF_Translate.textlayer import extract_original_page_objects
from PDF_Translate.ocr import ocr_fix_pdf
from PDF_Translate.utils import build_base, resolve_font
from PDF_Translate.overlay import build_overlay_items_from_doc
from PDF_Translate.pipeline import run_mode
from PDF_Translate.constants import FONT_EN_LOGICAL, FONT_EN_PATH, FONT_HI_LOGICAL_2, FONT_HI_PATH_2

# --- Supabase Config ---
SUPABASE_URL = "https://yamsbobotytqyhzqfxzx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbXNib2JvdHl0cXloenFmeHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDYxNTAsImV4cCI6MjA4NDgyMjE1MH0.yf6aRsE4Skk3GmhtVW0Cs5zb8h_h4hw0q61MCvAntGU" 

supabase: Client = None
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase Client Initialized")
except Exception as e:
    print(f"Supabase Connection Failed: {e}")
    print("Running in Offline Mode. Files will be saved locally.")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
TEMP_DIR = Path("temp_uploads")
OUTPUT_DIR = Path("output_pdfs")
UPLOADS_DIR = Path("uploads")
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# Set TESSDATA_PREFIX to local folder if exists
if Path("tessdata").exists():
    os.environ["TESSDATA_PREFIX"] = str(Path("tessdata").absolute())
    print(f"TESSDATA_PREFIX set to: {os.environ['TESSDATA_PREFIX']}")

# Mount Output Directory for Local Downloads
app.mount("/downloads", StaticFiles(directory=str(OUTPUT_DIR)), name="downloads")

class JobStatus(BaseModel):
    id: str
    status: str
    progress: int
    step: str
    filename: str
    result_url: str = None
    error: str = None

jobs = {}

def process_pdf_task(job_id: str, file_path: str, mode: str, translate_dir: str):
    try:
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['step'] = 'Initializing...'
        jobs[job_id]['progress'] = 5
        print(f"TASK STARTED: {job_id}")
        
        # Unique work folder for this job
        work_folder = Path(f"uploads/work_{job_id}")
        work_folder.mkdir(parents=True, exist_ok=True)

        # 1. Analysis
        jobs[job_id]['step'] = 'Analyzing Original PDF...'
        orig_index = extract_original_page_objects(file_path)
        jobs[job_id]['progress'] = 20

        # 2. OCR
        jobs[job_id]['step'] = 'Performing OCR & Layout Fix...'
        # ocr_fix_pdf returns path to fixed PDF
        src_fixed = ocr_fix_pdf(
            file_path, 
            lang=DEFAULT_LANG, 
            dpi=DEFAULT_DPI, 
            optimize=DEFAULT_OPTIMIZE, 
            work_folder=str(work_folder)
        )
        jobs[job_id]['progress'] = 50

        # 3. Layout Analysis
        jobs[job_id]['step'] = 'Parsing Layout Structure...'
        src, out = build_base(src_fixed)
        jobs[job_id]['total_pages'] = len(src)
        jobs[job_id]['progress'] = 60

        # Prepare fonts
        en_name, en_file = resolve_font(FONT_EN_LOGICAL, FONT_EN_PATH)
        hi_name, hi_file = resolve_font(FONT_HI_LOGICAL_2, FONT_HI_PATH_2)

        overlay_items = None
        if mode in ("overlay", "all"):
            overlay_items = build_overlay_items_from_doc(src, translate_direction=translate_dir)

        # 4. Translation & Generation
        jobs[job_id]['step'] = 'Translating & Generating PDF...'
        output_pdf_path = str(OUTPUT_DIR / f"result_{job_id}.pdf")
        
        run_mode(
            mode=mode,
            src=src, out=out, orig_index=orig_index, translate_dir=translate_dir,
            erase_mode='mask', redact_color=(1,1,1),
            font_en_name=en_name, font_en_file=en_file,
            font_hi_name=hi_name, font_hi_file=hi_file,
            output_pdf=output_pdf_path,
            overlay_items=overlay_items
        )
        jobs[job_id]['progress'] = 90
        
        # 5. Upload / Finalize
        final_filename = f"result_{job_id}.pdf"
        local_final_path = output_pdf_path
        
        # Use relative URL or placeholder, will be resolved by frontend or detected
        public_url = f"/downloads/{final_filename}"
        
        if supabase:
            try:
                jobs[job_id]['step'] = 'Uploading to Cloud...'
                print(f"TASK: Uploading {final_filename} to Supabase...")
                with open(local_final_path, 'rb') as f:
                    supabase.storage.from_('pdfs').upload(final_filename, f, {"content-type": "application/pdf"})
                
                # Get public URL
                res = supabase.storage.from_('pdfs').get_public_url(final_filename)
                public_url = res if isinstance(res, str) else res.get('publicURL') or res.get('publicUrl')
                print(f"TASK: Upload success. URL: {public_url}")
            except Exception as e:
                print(f"TASK: Cloud upload failed: {e}")

        jobs[job_id]['status'] = 'done'
        jobs[job_id]['progress'] = 100
        jobs[job_id]['step'] = 'Finished'
        jobs[job_id]['result_url'] = public_url
        print(f"TASK COMPLETED: {job_id}")

    except Exception as e:
        print(f"Processing failed: {e}")
        import traceback
        traceback.print_exc()
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)

@app.post("/translate")
async def translate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    mode: str = Form("overlay"),
    translate_dir: str = Form("auto")
):
    job_id = str(uuid.uuid4())
    
    # Save uploaded file temporarily
    file_path = TEMP_DIR / f"{job_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 0,
        "step": "Queued",
        "filename": file.filename
    }
    
    background_tasks.add_task(process_pdf_task, job_id, str(file_path), mode, translate_dir)
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

# Endpoint to fetch comparison images (Placeholder logic using PDF pages)
@app.get("/compare/{job_id}/{page_num}")
async def get_comparison(job_id: str, page_num: int):
    # Debug Logging
    print(f"DEBUG: Comparison Request - Job: {job_id}, Page: {page_num}")
    
    # 1. Find Original
    temp_files = list(TEMP_DIR.glob(f"{job_id}_*"))
    if not temp_files:
        raise HTTPException(status_code=404, detail="Original file not found")
    original_pdf = temp_files[0]
    
    # 2. Find Translated
    translated_pdf = OUTPUT_DIR / f"result_{job_id}.pdf"
    if not translated_pdf.exists():
         raise HTTPException(status_code=404, detail="Translated file not found")
         
    try:
        # Use PyMuPDF (fitz) to render images
        doc_orig = fitz.open(str(original_pdf))
        doc_trans = fitz.open(str(translated_pdf))
        
        if page_num >= len(doc_orig) or page_num >= len(doc_trans):
             raise HTTPException(status_code=404, detail="Page out of range")
             
        # Render Original
        page_orig = doc_orig[page_num]
        pix_orig = page_orig.get_pixmap(dpi=150)
        img_data_orig = pix_orig.tobytes("png")
        b64_orig = base64.b64encode(img_data_orig).decode('utf-8')
        
        # Render Translated
        page_trans = doc_trans[page_num]
        pix_trans = page_trans.get_pixmap(dpi=150)
        img_data_trans = pix_trans.tobytes("png")
        b64_trans = base64.b64encode(img_data_trans).decode('utf-8')
        
        return {
            "original": f"data:image/png;base64,{b64_orig}",
            "translated": f"data:image/png;base64,{b64_trans}",
            "width": pix_orig.width,
            "height": pix_orig.height
        }
    except Exception as e:
        print(f"Comparison generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    try:
        files = []
        for f in OUTPUT_DIR.glob("*.pdf"):
             stats = f.stat()
             files.append({
                 "id": f.name,
                 "name": f.name,
                 "date": time.strftime('%Y-%m-%d', time.localtime(stats.st_mtime)),
                 "size": f"{stats.st_size / 1024 / 1024:.2f} MB",
                 "status": "Completed",
                 "url": f"http://localhost:8000/downloads/{f.name}"
             })
        return files
    except Exception as e:
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
