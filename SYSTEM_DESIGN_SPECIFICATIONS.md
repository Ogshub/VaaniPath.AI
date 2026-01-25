# VaaniPath-AI System Design Specifications

## Complete System Design Documentation for Diagrams

This document provides comprehensive specifications for all system design diagrams including DFD Level 0, DFD Level 1, ER Diagram, Activity Diagram, and UML Use Case Diagram.

---

## 1. Data Flow Diagram (DFD) Level 0 - Context Diagram

### Purpose
Shows the system as a single process with external entities and data flows.

### Entities
1. **User** (External Entity)
   - Role: End user who wants to translate PDF documents
   - Actions: Upload PDF, Configure settings, Download result

### Process
- **Process 0: VaaniPath-AI Translation System**
  - Description: Complete PDF translation system with format preservation

### Data Flows

#### Input Flows (User → System)
1. **PDF Document**
   - Content: Original PDF file (digital or scanned)
   - Format: .pdf file (max 200MB)
   - Languages: Hindi or English text

2. **Translation Configuration**
   - Mode: Overlay / Hybrid / Span / Line / Block / All
   - Direction: Hindi→English / English→Hindi / Auto-detect
   - Settings: OCR options, DPI settings

#### Output Flows (System → User)
1. **Translated PDF**
   - Content: Format-preserved translated document
   - Format: .pdf file
   - Quality: Same layout, fonts, images as original

2. **Processing Status**
   - Progress: Percentage completion (0-100%)
   - Step: Current operation (OCR, Translation, Generation)
   - Errors: Any processing errors or warnings

3. **Comparison View**
   - Original: Base64 encoded PNG of original pages
   - Translated: Base64 encoded PNG of translated pages
   - Metadata: Page dimensions, count

### Diagram Structure
```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ PDF Document + Configuration
     ↓
┌────────────────────────────────────┐
│                                    │
│   VaaniPath-AI Translation System  │
│         (Process 0)                │
│                                    │
└────────────┬───────────────────────┘
             │
             │ Translated PDF + Status + Comparison
             ↓
        ┌─────────┐
        │  User   │
        └─────────┘
```

---

## 2. Data Flow Diagram (DFD) Level 1 - Detailed Process

### Purpose
Breaks down the main system into sub-processes showing internal data flows.

### Processes

#### **Process 1: Upload & Validation Module**
- **Input:** PDF File, User Session
- **Output:** Validated PDF Path, Job ID
- **Function:** 
  - Validate file format (.pdf only)
  - Check file size (max 200MB)
  - Generate unique job ID (UUID)
  - Save to temporary storage
- **Data Store:** D1 - Temporary Uploads

#### **Process 2: OCR Engine**
- **Input:** PDF Path, Language Config
- **Output:** OCR-enhanced PDF
- **Function:**
  - Detect if PDF is scanned (image-based)
  - Apply OCRmyPDF with Tesseract
  - Add text layer to scanned pages
  - Optimize image quality
- **Technology:** Tesseract 5.0+, OCRmyPDF 15.0+
- **Data Store:** D2 - OCR Cache

#### **Process 3: Layout Analyzer**
- **Input:** PDF Document
- **Output:** Layout Index (text blocks, fonts, positions)
- **Function:**
  - Extract text spans with coordinates
  - Identify fonts, sizes, colors
  - Detect tables and columns
  - Map images and graphics
- **Technology:** PyMuPDF (Fitz)
- **Data Store:** D3 - Layout Index

#### **Process 4: Translation Module**
- **Input:** Extracted Text, Source/Target Language
- **Output:** Translated Text
- **Function:**
  - Batch texts (50 per chunk)
  - Call Google Translate API
  - Handle rate limits
  - Fallback for failures
- **Technology:** Deep-Translator, Google Translate API
- **Data Store:** D4 - Translation Cache

#### **Process 5: Smart Masking Engine**
- **Input:** Original PDF, Layout Index
- **Output:** Masked PDF (original text removed)
- **Function:**
  - Sample background colors
  - Calculate padding based on font size
  - Apply adaptive masking
  - Preserve images and graphics
- **Algorithm:** Pixel sampling, dominant color detection

#### **Process 6: PDF Reconstructor**
- **Input:** Masked PDF, Translated Text, Layout Index
- **Output:** Final Translated PDF
- **Function:**
  - Overlay translated text at original positions
  - Match font styles and sizes
  - Preserve colors and formatting
  - Handle multi-column layouts
- **Modes:** Overlay (image-based) / Hybrid (text-based)
- **Data Store:** D5 - Output PDFs

#### **Process 7: Cloud Storage Manager**
- **Input:** Final PDF, Job ID
- **Output:** Public URL or Local Path
- **Function:**
  - Attempt Supabase upload
  - Generate public URL
  - Fallback to local serving
  - Track upload status
- **Technology:** Supabase Storage API
- **Data Store:** D6 - Cloud Storage / D7 - Local Storage

#### **Process 8: Comparison Generator**
- **Input:** Original PDF, Translated PDF, Page Number
- **Output:** Base64 Image Pair
- **Function:**
  - Render PDF pages to PNG (150 DPI)
  - Encode to Base64
  - Return dimensions
- **Technology:** PyMuPDF rendering

### Data Stores

1. **D1: Temporary Uploads**
   - Content: Uploaded PDF files
   - Retention: Until processing complete
   - Location: `temp_uploads/`

2. **D2: OCR Cache**
   - Content: OCR-processed PDFs
   - Retention: Work session
   - Location: `uploads/work_{job_id}/`

3. **D3: Layout Index**
   - Content: JSON with text positions, fonts, colors
   - Structure: `{page: int, spans: [{text, rect, font, size, color}]}`
   - Retention: In-memory during processing

4. **D4: Translation Cache**
   - Content: Source→Target text mappings
   - Structure: `{(text, src_lang, dest_lang): translated_text}`
   - Retention: In-memory during processing

5. **D5: Output PDFs**
   - Content: Final translated documents
   - Retention: Permanent (user downloads)
   - Location: `output_pdfs/`

6. **D6: Cloud Storage (Supabase)**
   - Content: Uploaded PDFs
   - Retention: Permanent
   - Access: Public URLs

7. **D7: Local Storage**
   - Content: Fallback PDF storage
   - Retention: Permanent
   - Access: HTTP static serving

### Data Flow Connections

```
User → [1. Upload] → D1
D1 → [2. OCR] → D2
D2 → [3. Layout Analyzer] → D3
D3 → [4. Translation] → D4
D2 + D3 → [5. Smart Masking] → Masked PDF
Masked PDF + D4 + D3 → [6. PDF Reconstructor] → D5
D5 → [7. Cloud Storage] → D6/D7
D1 + D5 → [8. Comparison Generator] → User
D5 → User (Download)
```

---

## 3. Entity-Relationship (ER) Diagram

### Purpose
Shows the data model and relationships between entities in the system.

### Entities

#### **1. User Session**
- **Attributes:**
  - session_id (PK) - UUID
  - ip_address - String
  - user_agent - String
  - created_at - Timestamp
  - last_active - Timestamp
- **Description:** Tracks active user interactions

#### **2. Translation Job**
- **Attributes:**
  - job_id (PK) - UUID
  - session_id (FK) - References User Session
  - status - Enum (queued, processing, done, failed)
  - progress - Integer (0-100)
  - current_step - String
  - mode - Enum (overlay, hybrid, span, line, block, all)
  - translate_direction - Enum (hi→en, en→hi, auto)
  - created_at - Timestamp
  - completed_at - Timestamp
  - error_message - Text (nullable)
- **Description:** Represents a single translation task

#### **3. Source Document**
- **Attributes:**
  - document_id (PK) - UUID
  - job_id (FK) - References Translation Job
  - original_filename - String
  - file_path - String
  - file_size - Integer (bytes)
  - page_count - Integer
  - is_scanned - Boolean
  - uploaded_at - Timestamp
- **Description:** Original PDF uploaded by user

#### **4. Output Document**
- **Attributes:**
  - output_id (PK) - UUID
  - job_id (FK) - References Translation Job
  - file_path - String
  - cloud_url - String (nullable)
  - local_url - String
  - file_size - Integer (bytes)
  - page_count - Integer
  - generated_at - Timestamp
- **Description:** Final translated PDF

#### **5. Page Object**
- **Attributes:**
  - page_id (PK) - UUID
  - document_id (FK) - References Source Document
  - page_number - Integer
  - width - Float
  - height - Float
  - text_blocks - JSON
  - image_count - Integer
  - has_tables - Boolean
- **Description:** Individual page metadata

#### **6. Text Block**
- **Attributes:**
  - block_id (PK) - UUID
  - page_id (FK) - References Page Object
  - block_type - Enum (text, table, image)
  - bbox - JSON {x0, y0, x1, y1}
  - original_text - Text
  - translated_text - Text
  - font_name - String
  - font_size - Float
  - color - JSON {r, g, b}
  - is_bold - Boolean
  - is_italic - Boolean
- **Description:** Atomic text unit with styling

#### **7. Processing Log**
- **Attributes:**
  - log_id (PK) - UUID
  - job_id (FK) - References Translation Job
  - timestamp - Timestamp
  - level - Enum (info, warning, error)
  - message - Text
  - details - JSON
- **Description:** Audit trail of processing steps

### Relationships

1. **User Session ←→ Translation Job** (1:N)
   - One session can have multiple jobs
   - Each job belongs to one session

2. **Translation Job ←→ Source Document** (1:1)
   - Each job has exactly one source document
   - Each source document belongs to one job

3. **Translation Job ←→ Output Document** (1:1 or 1:N for "all" mode)
   - Each job produces one or more output documents
   - Each output belongs to one job

4. **Source Document ←→ Page Object** (1:N)
   - One document has multiple pages
   - Each page belongs to one document

5. **Page Object ←→ Text Block** (1:N)
   - One page contains multiple text blocks
   - Each block belongs to one page

6. **Translation Job ←→ Processing Log** (1:N)
   - One job generates multiple log entries
   - Each log belongs to one job

### ER Diagram Structure
```
┌─────────────────┐
│  User Session   │
│  PK: session_id │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────┴────────────┐
│  Translation Job    │
│  PK: job_id         │
│  FK: session_id     │
└──┬──────────────┬───┘
   │ 1            │ 1
   │              │
   │ 1            │ 1..N
┌──┴──────────┐ ┌─┴──────────────┐
│   Source    │ │     Output     │
│  Document   │ │    Document    │
│PK:doc_id    │ │ PK: output_id  │
│FK:job_id    │ │  FK: job_id    │
└──┬──────────┘ └────────────────┘
   │ 1
   │
   │ N
┌──┴──────────┐
│ Page Object │
│ PK: page_id │
│ FK: doc_id  │
└──┬──────────┘
   │ 1
   │
   │ N
┌──┴──────────┐
│ Text Block  │
│PK: block_id │
│FK: page_id  │
└─────────────┘
```

---

## 4. Activity Diagram

### Purpose
Shows the sequential flow of activities in the translation process.

### Swimlanes
1. **User** - User actions
2. **Frontend (React)** - UI interactions
3. **Backend (FastAPI)** - Server processing
4. **PDF Engine** - Core translation logic

### Activities Flow

#### **User Lane**
1. **Start** → Navigate to application
2. **Upload PDF** → Drag & drop or select file
3. **Configure Settings** → Select mode and language
4. **Click Translate** → Initiate processing
5. **Wait** → Monitor progress
6. **View Comparison** → Interact with slider
7. **Download Result** → Save translated PDF
8. **End**

#### **Frontend Lane**
1. **Display Upload UI** → File dropzone
2. **Validate File** → Check format and size
   - Decision: Valid?
     - No → Show error message → Return to upload
     - Yes → Continue
3. **Show Configuration** → Mode and language selectors
4. **POST /translate** → Send file to backend
5. **Receive Job ID** → Store in state
6. **Poll /status/{job_id}** → Every 1 second
7. **Update Progress Bar** → Show percentage and step
8. **GET /compare/{job_id}/{page}** → Fetch comparison images
9. **Render Comparison Slider** → Display side-by-side
10. **Provide Download Link** → From result URL

#### **Backend Lane**
1. **Receive Upload** → Save to temp_uploads/
2. **Generate Job ID** → UUID
3. **Create Background Task** → Async processing
4. **Return Job ID** → Immediate response
5. **Update Job Status** → "processing"
6. **Call PDF Engine** → Pass file path and config
7. **Monitor Progress** → Update job object
8. **Receive Result** → PDF path or error
9. **Upload to Cloud** → Supabase (with fallback)
10. **Update Job Status** → "done" or "failed"
11. **Serve Comparison** → Render pages on demand

#### **PDF Engine Lane**
1. **Analyze PDF** → Extract original layout
   - Update progress: 20%
2. **Check if Scanned** → Decision point
   - Yes → Apply OCR → Add text layer
   - No → Continue
   - Update progress: 50%
3. **Extract Text Blocks** → Parse layout
   - Update progress: 60%
4. **Batch Translate** → Group by language pair
   - Update progress: 70%
5. **Smart Masking** → Sample backgrounds, erase text
   - Update progress: 80%
6. **Overlay Translation** → Draw translated text
   - Update progress: 90%
7. **Save PDF** → Write to output_pdfs/
   - Update progress: 100%
8. **Return Path** → Success or error

### Decision Points

1. **File Valid?**
   - Condition: Format == .pdf AND Size <= 200MB
   - True → Continue
   - False → Error message

2. **Is Scanned?**
   - Condition: PDF has no text layer
   - True → Apply OCR
   - False → Skip OCR

3. **Translation Success?**
   - Condition: API returns valid response
   - True → Continue
   - False → Retry or use fallback

4. **Cloud Upload Success?**
   - Condition: Supabase returns URL
   - True → Use cloud URL
   - False → Use local URL

### Parallel Activities
- **Progress Polling** (Frontend) runs in parallel with **PDF Processing** (Backend)
- **Comparison Generation** happens on-demand, independent of main flow

---

## 5. UML Use Case Diagram

### Purpose
Shows interactions between actors and system use cases.

### Actors

#### **Primary Actor: User**
- Description: End user who needs to translate PDF documents
- Goals: Translate documents while preserving format

#### **Secondary Actors:**
1. **Google Translate API** (External System)
   - Provides translation services
   
2. **Supabase Storage** (External System)
   - Provides cloud file storage

3. **Tesseract OCR** (External System)
   - Provides OCR capabilities

### Use Cases

#### **UC1: Upload PDF Document**
- **Actor:** User
- **Precondition:** User has a PDF file
- **Main Flow:**
  1. User navigates to upload page
  2. User drags file or clicks to select
  3. System validates file format and size
  4. System saves file temporarily
  5. System displays success message
- **Postcondition:** PDF is ready for translation
- **Extensions:**
  - 3a. Invalid format → Show error
  - 3b. File too large → Show size limit error

#### **UC2: Configure Translation Settings**
- **Actor:** User
- **Precondition:** PDF is uploaded
- **Main Flow:**
  1. User selects translation mode
  2. User selects language direction
  3. User optionally adjusts OCR settings
  4. System validates configuration
- **Postcondition:** Settings are stored for job

#### **UC3: Translate PDF**
- **Actor:** User
- **Precondition:** PDF uploaded and configured
- **Main Flow:**
  1. User clicks "Translate" button
  2. System creates translation job
  3. System returns job ID
  4. System processes in background
  5. System updates progress in real-time
- **Postcondition:** Translated PDF is generated
- **Includes:** UC7 (Perform OCR), UC8 (Translate Text)

#### **UC4: View Translation Progress**
- **Actor:** User
- **Precondition:** Translation job started
- **Main Flow:**
  1. System displays progress bar
  2. System shows current step
  3. System updates every second
  4. User monitors progress
- **Postcondition:** User is informed of status

#### **UC5: Compare Original and Translated**
- **Actor:** User
- **Precondition:** Translation completed
- **Main Flow:**
  1. System displays side-by-side viewer
  2. User drags slider to compare
  3. User navigates between pages
  4. System renders pages on demand
- **Postcondition:** User verifies translation quality

#### **UC6: Download Translated PDF**
- **Actor:** User
- **Precondition:** Translation completed
- **Main Flow:**
  1. User clicks download button
  2. System retrieves PDF from storage
  3. System initiates download
  4. User saves file locally
- **Postcondition:** User has translated PDF

#### **UC7: Perform OCR (Include)**
- **Actor:** Tesseract OCR (System)
- **Precondition:** PDF is scanned/image-based
- **Main Flow:**
  1. System detects no text layer
  2. System calls OCRmyPDF
  3. Tesseract processes images
  4. System adds text layer
- **Postcondition:** PDF has extractable text

#### **UC8: Translate Text (Include)**
- **Actor:** Google Translate API (System)
- **Precondition:** Text extracted from PDF
- **Main Flow:**
  1. System batches text (50 per chunk)
  2. System calls translation API
  3. API returns translated text
  4. System maps to original positions
- **Postcondition:** All text is translated
- **Extensions:**
  - 3a. API fails → Retry with fallback

#### **UC9: Store in Cloud (Extend)**
- **Actor:** Supabase Storage (System)
- **Precondition:** PDF generated
- **Main Flow:**
  1. System uploads to Supabase
  2. Supabase returns public URL
  3. System stores URL in job
- **Postcondition:** PDF accessible via cloud
- **Extensions:**
  - 2a. Upload fails → Use local storage

#### **UC10: View Translation History**
- **Actor:** User
- **Precondition:** User has previous translations
- **Main Flow:**
  1. User navigates to dashboard
  2. System displays list of jobs
  3. User clicks on a job
  4. System shows details and download link
- **Postcondition:** User can access old translations

### Use Case Relationships

**Include Relationships:**
- UC3 (Translate PDF) **includes** UC7 (Perform OCR)
- UC3 (Translate PDF) **includes** UC8 (Translate Text)

**Extend Relationships:**
- UC9 (Store in Cloud) **extends** UC3 (Translate PDF)

**Generalization:**
- UC2 (Configure Settings) is a specialization of system configuration

### System Boundary
All use cases occur within the **VaaniPath-AI System** boundary, with external actors (APIs) interacting from outside.

---

## 6. Class Diagram (Bonus)

### Key Classes

#### **TranslationJob**
```python
class TranslationJob:
    - job_id: UUID
    - status: JobStatus
    - progress: int
    - mode: TranslationMode
    - translate_dir: str
    + create_job()
    + update_progress(step, percent)
    + mark_complete(result_url)
    + mark_failed(error)
```

#### **PDFProcessor**
```python
class PDFProcessor:
    - source_path: str
    - output_path: str
    + analyze_layout()
    + apply_ocr()
    + extract_text_blocks()
    + translate_blocks()
    + generate_output()
```

#### **TranslationService**
```python
class TranslationService:
    - api_client: GoogleTranslator
    + batch_translate(texts, src, dest)
    + translate_single(text, src, dest)
    + detect_language(text)
```

#### **StorageManager**
```python
class StorageManager:
    - supabase_client: Client
    + upload_to_cloud(file_path)
    + get_public_url(filename)
    + fallback_to_local(file_path)
```

---

## Summary Table

| Diagram | Purpose | Key Elements | Complexity |
|---------|---------|--------------|------------|
| **DFD Level 0** | System context | 1 Process, 1 External Entity, 4 Data Flows | Low |
| **DFD Level 1** | Detailed processes | 8 Processes, 7 Data Stores, Multiple Flows | High |
| **ER Diagram** | Data model | 7 Entities, 6 Relationships | Medium |
| **Activity Diagram** | Process flow | 4 Swimlanes, 30+ Activities, 4 Decisions | High |
| **Use Case Diagram** | User interactions | 1 Primary Actor, 3 External Actors, 10 Use Cases | Medium |

---

## Implementation Notes

### For Drawing Tools
- **Lucidchart:** Best for all diagrams
- **Draw.io:** Free alternative
- **PlantUML:** Code-based diagrams
- **Microsoft Visio:** Professional tool

### Color Coding Recommendations
- **Processes:** Light Blue (#E3F2FD)
- **Data Stores:** Light Green (#E8F5E9)
- **External Entities:** Light Orange (#FFF3E0)
- **Data Flows:** Black arrows
- **Decision Points:** Yellow (#FFF9C4)

### Diagram Sizes
- **DFD Level 0:** A4 Portrait
- **DFD Level 1:** A3 Landscape
- **ER Diagram:** A4 Landscape
- **Activity Diagram:** A3 Portrait
- **Use Case:** A4 Portrait

---

**Document Version:** 1.0  
**Last Updated:** January 25, 2026  
**Project:** VaaniPath-AI  
**Author:** System Design Team
