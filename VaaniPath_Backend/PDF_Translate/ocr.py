import fitz, subprocess, shutil, os
from pathlib import Path

def rasterize_pdf_to_image_pdf(input_path: str, dpi: int = 300, work_folder: str = "temp") -> str:
    doc = fitz.open(input_path); os.makedirs(work_folder, exist_ok=True)
    out_path = os.path.join(work_folder, "rasterized.pdf")
    out = fitz.open(); zoom = dpi/72.0; mat = fitz.Matrix(zoom, zoom)
    try:
        for pno in range(len(doc)):
            page = doc[pno]; pix = page.get_pixmap(matrix=mat, alpha=False)
            po = out.new_page(width=page.rect.width, height=page.rect.height)
            po.insert_image(po.rect, stream=pix.tobytes("png"))
        out.save(out_path)
    finally:
        out.close(); doc.close()
    return out_path

def ocr_fix_pdf(input_path: str, lang: str, dpi: str, optimize: str, work_folder: str = "temp") -> str:
    if shutil.which("ocrmypdf") is None:
        print("[ocrmypdf] not found; using original.")
        return input_path
    
    os.makedirs(work_folder, exist_ok=True)
    output_path = os.path.join(work_folder, "ocr_fixed.pdf")
    
    # Check for unpaper for extra cleaning
    has_unpaper = shutil.which("unpaper") is not None
    
    cmd = [
        "ocrmypdf", "--language", lang, "--deskew", "--rotate-pages", "--force-ocr",
        "--image-dpi", dpi, "--oversample", dpi, "--optimize", optimize,
    ]
    
    if has_unpaper:
        cmd.extend(["--clean", "--clean-final"])
        
    cmd.extend([os.fspath(input_path), os.fspath(output_path)])
    
    print("[ocrmypdf]", " ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode == 0:
        print("[ocrmypdf] success ->", output_path); return output_path
    
    print("[ocrmypdf] failed; fallback to rasterize.\nSTDERR:\n", proc.stderr)
    try:
        image_pdf = rasterize_pdf_to_image_pdf(input_path, dpi=300, work_folder=work_folder)
    except Exception as e:
        print("[fallback] rasterize failed:", e); return input_path
        
    output_path2 = os.path.join(work_folder, "ocr_fixed_from_image.pdf")
    cmd2 = [
        "ocrmypdf", "--language", lang, "--deskew", "--rotate-pages",
        "--image-dpi", dpi, "--oversample", dpi, "--optimize", optimize,
    ]
    if has_unpaper:
        cmd2.extend(["--clean", "--clean-final"])
    cmd2.extend([os.fspath(image_pdf), os.fspath(output_path2)])
    
    print("[ocrmypdf fallback]", " ".join(cmd2))
    proc2 = subprocess.run(cmd2, capture_output=True, text=True)
    if proc2.returncode == 0:
        print("[ocrmypdf] success via rasterize ->", output_path2); return output_path2
    
    print("[ocrmypdf] fallback failed; using original.\nSTDERR:\n", proc2.stderr)
    return input_path
