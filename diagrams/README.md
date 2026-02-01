# VaaniPath-AI System Design Diagrams

This folder contains all the professional system design diagrams for the **VaaniPath-AI: Smart Format Preserving PDF Translation Tool** project.

## 📊 Diagram Collection

### 1. **ER_Diagram.png** - Entity-Relationship Diagram
**Purpose:** Shows the complete data model and relationships between entities in the system.

**Entities (7):**
- User Session
- Translation Job
- Source Document
- Output Document
- Page Object
- Text Block
- Processing Log

**Relationships (6):**
- User Session ↔ Translation Job (1:N)
- Translation Job ↔ Source Document (1:1)
- Translation Job ↔ Output Document (1:N)
- Source Document ↔ Page Object (1:N)
- Page Object ↔ Text Block (1:N)
- Translation Job ↔ Processing Log (1:N)

**Use Case:** Database design, data modeling, understanding system architecture

---

### 2. **DFD_Level_0.png** - Data Flow Diagram Level 0 (Context Diagram)
**Purpose:** High-level view of the system showing external entities and main data flows.

**Components:**
- External Entity: User
- Central Process: VaaniPath-AI Translation System
- Input Flows: PDF Document, Translation Configuration
- Output Flows: Translated PDF, Processing Status, Comparison View

**Use Case:** System overview, stakeholder presentations, understanding system boundaries

---

### 3. **DFD_Level_1.png** - Data Flow Diagram Level 1 (Detailed Process)
**Purpose:** Detailed breakdown of internal processes and data stores.

**Processes (8):**
1. Upload & Validation Module
2. OCR Engine
3. Layout Analyzer
4. Translation Module
5. Smart Masking Engine
6. PDF Reconstructor
7. Cloud Storage Manager
8. Comparison Generator

**Data Stores (7):**
- D1: Temporary Uploads
- D2: OCR Cache
- D3: Layout Index
- D4: Translation Cache
- D5: Output PDFs
- D6: Cloud Storage
- D7: Local Storage

**Use Case:** Understanding internal workflows, process optimization, technical documentation

---

### 4. **Activity_Diagram.png** - UML Activity Diagram
**Purpose:** Shows the sequential flow of activities across different system components.

**Swimlanes (4):**
1. **User** - User interactions
2. **Frontend (React)** - UI layer activities
3. **Backend (FastAPI)** - Server-side processing
4. **PDF Engine** - Core translation logic

**Key Features:**
- Decision points (File validation, OCR detection)
- Parallel activities (Progress polling)
- Complete workflow from upload to download

**Use Case:** Understanding process flow, identifying bottlenecks, workflow optimization

---

### 5. **Use_Case_Diagram.png** - UML Use Case Diagram
**Purpose:** Shows interactions between actors and system use cases.

**Actors:**
- **Primary:** User
- **Secondary:** Google Translate API, Supabase Storage, Tesseract OCR

**Use Cases (10):**
1. Upload PDF Document
2. Configure Translation Settings
3. Translate PDF
4. View Translation Progress
5. Compare Original and Translated
6. Download Translated PDF
7. Perform OCR (included)
8. Translate Text (included)
9. Store in Cloud (extends)
10. View Translation History

**Relationships:**
- Include: Translate PDF includes Perform OCR and Translate Text
- Extend: Store in Cloud extends Translate PDF

**Use Case:** Requirements analysis, user story mapping, feature planning

---

### 6. **Class_Diagram.png** - UML Class Diagram
**Purpose:** Shows the object-oriented structure of key system classes.

**Classes (6):**
1. **TranslationJob** - Manages translation tasks
2. **PDFProcessor** - Core PDF processing logic
3. **TranslationService** - Handles API translation
4. **StorageManager** - Manages file storage
5. **LayoutAnalyzer** - Extracts PDF layout
6. **MaskingEngine** - Applies smart masking

**Relationships:**
- TranslationJob uses PDFProcessor and StorageManager
- PDFProcessor uses TranslationService, LayoutAnalyzer, and MaskingEngine

**Use Case:** Code architecture, implementation planning, OOP design

---

## 🎨 Design Standards

All diagrams follow professional standards:

- **Color Coding:**
  - Light Blue (#E3F2FD) - Processes/Entities
  - Light Green (#E8F5E9) - Data Stores
  - Light Orange (#FFF3E0) - External Entities
  - Pastel Colors - Swimlanes

- **Notation:**
  - ER Diagram: Chen notation with cardinality
  - DFD: Yourdon-DeMarco notation
  - UML: Standard UML 2.0 notation

- **Quality:**
  - High resolution PNG format
  - Academic textbook quality
  - Clear labels and professional spacing

---

## 📖 Reference Documentation

For detailed specifications of each diagram, refer to:
- **SYSTEM_DESIGN_SPECIFICATIONS.md** (in project root)

This document contains:
- Complete entity attributes
- Detailed process descriptions
- Data flow specifications
- Use case scenarios
- Class method signatures

---

## 🔧 Usage

### For Academic Submissions:
- Include diagrams in project reports
- Reference in system design chapters
- Use for presentations and viva

### For Development:
- Guide implementation architecture
- Understand data relationships
- Plan API endpoints
- Design database schema

### For Documentation:
- Technical documentation
- Developer onboarding
- System maintenance guides

---

## 📝 Diagram Summary Table

| Diagram | File Name | Type | Complexity | Best For |
|---------|-----------|------|------------|----------|
| ER Diagram | ER_Diagram.png | Database | Medium | Data modeling |
| DFD Level 0 | DFD_Level_0.png | Process | Low | System overview |
| DFD Level 1 | DFD_Level_1.png | Process | High | Detailed workflow |
| Activity Diagram | Activity_Diagram.png | UML | High | Process flow |
| Use Case Diagram | Use_Case_Diagram.png | UML | Medium | Requirements |
| Class Diagram | Class_Diagram.png | UML | Medium | Code structure |

---

## 🚀 Project Information

- **Project Name:** VaaniPath-AI
- **Full Title:** A Smart Format Preserving PDF Translation Tool
- **Version:** 1.0
- **Last Updated:** January 30, 2026
- **Technology Stack:** Python, FastAPI, React, PyMuPDF, Tesseract OCR

---

## 📧 Contact

For questions about these diagrams or the VaaniPath-AI project, please refer to the main project documentation.

---

**Note:** All diagrams are generated based on the actual system implementation and design specifications. They accurately represent the current architecture of VaaniPath-AI.
