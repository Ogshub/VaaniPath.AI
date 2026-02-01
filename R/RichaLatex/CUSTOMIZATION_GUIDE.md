# Quick Customization Guide

## Required Changes Before Submission

### 1. Student Information
Replace these placeholders with actual information:

**In cover.tex (line ~35-38):**
```latex
{\Large \textbf{[STUDENT NAME]}}
{\large \textbf{PRN: [PRN NUMBER]}}
```

**In cert.tex (line ~23):**
```latex
submitted by \textbf{[STUDENT NAME]} (PRN: \textbf{[PRN NUMBER]})
```

**In declaration.tex (line ~8):**
```latex
\noindent I, \textbf{[STUDENT NAME]}, student of Bachelor of Computer Applications
```

**In ack.tex (line ~38-39):**
```latex
\textbf{[STUDENT NAME]}\\
PRN: \textbf{[PRN NUMBER]}
```

### 2. Guide Information
**In cover.tex (line ~46):**
```latex
{\Large \textbf{[GUIDE NAME]}}
```

**In cert.tex (line ~33):**
```latex
\textbf{[GUIDE NAME]}\\
```

**In declaration.tex (line ~18):**
```latex
carried out by me under the guidance of \textbf{[GUIDE NAME]}.
```

**In ack.tex (line ~13):**
```latex
\noindent I would like to express my sincere gratitude to \textbf{[GUIDE NAME]},
```

### 3. HOD Information
**In cert.tex (line ~38-40):**
```latex
\textbf{[HOD NAME]}\\
Head of Department\\
```

**In ack.tex (line ~19):**
```latex
\noindent I am deeply grateful to \textbf{[HOD NAME]},
```

### 4. Principal Information
**In ack.tex (line ~25):**
```latex
\noindent I would like to thank \textbf{[PRINCIPAL NAME]},
```

## Example Replacement

If the student's name is "Priya Sharma", PRN is "2021BCA123", guide is "Dr. Anjali Desai", HOD is "Dr. Rajesh Kumar", and Principal is "Dr. Suresh Patil":

**Before:**
```latex
{\Large \textbf{[STUDENT NAME]}}
{\large \textbf{PRN: [PRN NUMBER]}}
```

**After:**
```latex
{\Large \textbf{Priya Sharma}}
{\large \textbf{PRN: 2021BCA123}}
```

## Recompilation Steps

After making all changes:

1. Open PowerShell/Command Prompt
2. Navigate to the report directory:
   ```
   cd "c:\ShubhamCollege\PDFtranslator\Friend_TodoList_Report"
   ```
3. Run pdflatex twice (for cross-references):
   ```
   pdflatex -interaction=nonstopmode main.tex
   pdflatex -interaction=nonstopmode main.tex
   ```
4. The updated PDF will be `main.pdf`

## Optional Customizations

### Change Project Title (if needed)
In `cover.tex`, line ~24-26:
```latex
{\LARGE \textbf{My Task Manager}}
{\large \textbf{A Smart Web-Based To-Do List Application}}
```

### Change Academic Year
In `cover.tex`, line ~51:
```latex
{\large \textbf{Academic Year: 2025-2026}}
```

### Adjust Header Text
In `main.tex`, line ~60:
```latex
\rhead{Task Manager}
```

## Files to Modify

Only modify these files:
- ✏️ `cover.tex`
- ✏️ `cert.tex`
- ✏️ `declaration.tex`
- ✏️ `ack.tex`

Do NOT modify:
- ❌ `main.tex` (unless changing header/footer)
- ❌ `chap1.tex` through `chap8.tex`
- ❌ `abst.tex`
- ❌ Any diagram files

## Verification Checklist

Before final submission, verify:
- [ ] Student name appears correctly on cover page
- [ ] PRN number is correct
- [ ] Guide name is correct in all places
- [ ] HOD name is correct
- [ ] Principal name is correct
- [ ] All placeholders ([...]) are removed
- [ ] PDF compiles without errors
- [ ] Page count is 60+ pages ✅ (Currently 113 pages)
- [ ] All diagrams are visible
- [ ] Table of contents is generated
- [ ] References are included

## Common Issues

### Issue: PDF not updating after changes
**Solution:** Delete auxiliary files and recompile:
```
del main.aux main.toc main.lof main.lot
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

### Issue: Compilation errors
**Solution:** Check for special characters in names. Use:
- `\&` instead of `&`
- `\_` instead of `_`
- `\%` instead of `%`

### Issue: Missing diagrams
**Solution:** Ensure all PNG files are in the same directory as main.tex

## Support

If you encounter any issues:
1. Check the `main.log` file for error details
2. Ensure all `.tex` files are in the same directory
3. Ensure all `.png` diagram files are present
4. Make sure MiKTeX/LaTeX is properly installed

---

**Ready to customize and submit!** 📄✨
