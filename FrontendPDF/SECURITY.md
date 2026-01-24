# Security Implementation Checklist

## Frontend Security
- [x] **Protected Routes**: Prevent unauthorized access to Upload and Dashboard pages.
- [x] **Authentication State**: Managed via Context API.
- [ ] **Token Storage**: Move from localStorage to HttpOnly Cookies (requires backend).
- [ ] **Input Validation**: Ensure file types (PDF only) are strictly enforced before upload.

## Backend Security (To Be Implemented)
- [ ] **JWT Authentication**: validate `Authorization` header on API requests.
- [ ] **Rate Limiting**: Limit translation requests (e.g., 5 per hour for free users).
- [ ] **File Sanitization**: Scan uploaded PDFs for malware.
- [ ] **Secure Cleanup**: Auto-delete uploaded files after processing (Data Retention Policy).
- [ ] **CORS**: Restrict API access to your frontend domain only.

## Next Steps
1. Create a Python backend (FastAPI/Flask) to replace the mock AuthContext.
2. Implement PDF Validation logic on the server.
