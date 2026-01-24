# PROPOSED FREE TECH STACK & DATA STRATEGY

To move from mock data to a fully functional, production-ready "VaaniPath AI" with free tiers, I recommend the following Modern Stack (T3/Supabase style):

## 1. The "All Free" Infrastructure
We will use **Supabase** (an open-source Firebase alternative) which provides:
*   **Database**: PostgreSQL (Store users, translation history, file metadata).
*   **Authentication**: Secure Email/Password, Google Login, Github Login (Free tier handles 50,000 MAU).
*   **Storage**: S3-compatible file storage (Store original & translated PDFs). Set buckets to specific privacy rules (e.g., public for shared links).

**Why Supabase?**
*   It's free for reasonable usage.
*   Integration with React is seamless (`@supabase/supabase-js`).
*   Data is relational (SQL), which is better for "User has many Files" relationships than Firebase's NoSQL.

## 2. Backend Architecture (Python)
Since we have Python logic (`pdf_translator`), we need a real backend API, not just Streamlit.
*   **Framework**: **FastAPI** (High performance, easy to use).
*   **Hosting**: **Render.com** (Free tier for Web Services) or **Railway** (Trial/Low cost).
*   **Process**:
    1.  Frontend sends PDF to Backend.
    2.  Backend runs OCR & Translation logic.
    3.  Backend uploads result to Supabase Storage.
    4.  Backend updates Supabase Database with record (File Name, URL, UserID).
    5.  Frontend listens for completion.

## 3. Data Schema (PostgreSQL)

### Table: `users`
(Managed by Supabase Auth)

### Table: `translations`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Unique ID (used for sharing links) |
| `user_id` | uuid | Owner of the file |
| `original_filename` | text | Name of uploaded file |
| `source_lang` | text | e.g., 'en' |
| `target_lang` | text | e.g., 'hi' |
| `storage_path` | text | Path in Supabase Storage bucket |
| `status` | text | 'processing', 'completed', 'failed' |
| `is_public` | boolean | If true, anyone with link can view |
| `created_at` | timestamp | |

## 4. Work Required to "Make it Work"
1.  **Sign up for Supabase**: Create a project (I can guide you through the keys).
2.  **Create API Service**: Refactor your `ocr`, `pipeline`, and `translator` python scripts into a `main.py` (FastAPI app).
3.  **Connect Frontend**: Replace `AuthContext` with Supabase Client.

---

### Immediate Action Plan (Current Step)
I am currently implementing the **Frontend Preparations** for this:
1.  Refining UI (Fluent transitions, better Navbar).
2.  Adding the **Page Structure** for Sharing `(VaaniPath.ai/share/xyz-123)`.
3.  Polishing the Dashboard to handle "Real" data structure.
