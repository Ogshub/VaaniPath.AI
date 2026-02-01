FROM python:3.12-slim

# System deps for ocrmypdf + fonts + runtime
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ocrmypdf tesseract-ocr ghostscript qpdf pngquant unpaper \
    fonts-noto fonts-noto-cjk fonts-noto-unhinted fonts-noto-color-emoji \
    libglib2.0-0 libgl1 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Ensure output and temp dirs exist
RUN mkdir -p output_pdfs temp uploads temp_uploads

# FastAPI runs on port 8000
ENV PORT=8000
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
