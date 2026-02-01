from typing import List, Tuple, Dict, Optional, Any
import fitz, os, zipfile, statistics
from .utils import Span, pick_redact_fill_for_color, insert_text_fit, _dominant_script, build_base
from .constants import _DEV
from .textlayer import extract_blocks_from_textlayer, extract_lines_from_textlayer, extract_spans_from_textlayer, derive_line_styles_from_spans, derive_block_styles_from_spans, transfer_color_size_from_original
from .overlay import overlay_choose_fontfile_for_text, overlay_draw_text_as_image, overlay_transform_rect, dominant_text_fill_for_rect
from .hybrid import extract_blocks_with_segments, is_table_like, build_columns
from .image_ocr import translate_text

def erase_original_text(out_doc: fitz.Document, spans: List[Span], mode: str, erase_mode: str, _unused_fill):
    if erase_mode not in ("mask", "redact"):
        return
    spans_by_page: Dict[int, List[Span]] = {}
    for sp in spans:
        spans_by_page.setdefault(sp.page, []).append(sp)
    for pno, sps in spans_by_page.items():
        page = out_doc[pno]
        if erase_mode == "mask":
            for sp in sps:
                pad = max(1.0, 0.18 * sp.fontsize)
                r = fitz.Rect(*sp.rect)
                rr = fitz.Rect(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad) & page.rect
                if rr.is_empty: continue
                fill = pick_redact_fill_for_color(sp.color)
                page.draw_rect(rr, color=None, fill=fill, overlay=True, width=0)
        else:
            added_any = False
            for sp in sps:
                pad = max(1.0, 0.18 * sp.fontsize)
                r = fitz.Rect(*sp.rect)
                rr = fitz.Rect(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad) & page.rect
                if rr.is_empty: continue
                fill = pick_redact_fill_for_color(sp.color)
                page.add_redact_annot(rr, fill=fill)
                added_any = True
            if added_any:
                try: page.apply_redactions()
                except Exception as e: print(f"[page {pno}] apply_redactions error: {e}")

def run_mode(mode: str, src: fitz.Document, out: fitz.Document,
             orig_index: Dict[int, List[Dict[str, Any]]],
             translate_dir: str,
             erase_mode: str, redact_color: Tuple[float,...],
             font_en_name: str, font_en_file: Optional[str],
             font_hi_name: str, font_hi_file: Optional[str],
             output_pdf: str,
             overlay_items: Optional[List[Dict[str, Any]]] = None,
             overlay_render: str = "image",
             overlay_align: int = 0,
             overlay_line_spacing: float = 1.10,
             overlay_margin_px: float = 0.1,
             overlay_target_dpi: int = 600,
             overlay_scale_x: float = 1.0, overlay_scale_y: float = 1.0,
             overlay_off_x: float = 0.0, overlay_off_y: float = 0.0) -> None:

    if mode == "all":
        src_path = getattr(src, "name", None)
        if not src_path or not os.path.exists(src_path):
            raise ValueError("all mode requires 'src' to come from a real file.")
        try: out.close()
        except Exception: pass
        try: src.close()
        except Exception: pass

        base, ext = os.path.splitext(output_pdf)
        out_files: List[Tuple[str, str]] = []

        def _make_output(label: str) -> str: return f"{base}.{label}{ext}"
        def _fresh_src_out() -> Tuple[fitz.Document, fitz.Document]:
            s = fitz.open(src_path)
            o = fitz.open()
            for p in range(len(s)):
                po = o.new_page(width=s[p].rect.width, height=s[p].rect.height)
                po.show_pdf_page(po.rect, s, p)
            return s, o

        for sub_mode in ("span", "line", "block", "hybrid"):
            try:
                s, o = _fresh_src_out()
                run_mode(mode=sub_mode, src=s, out=o, orig_index=orig_index, translate_dir=translate_dir,
                         erase_mode=erase_mode, redact_color=redact_color,
                         font_en_name=font_en_name, font_en_file=font_en_file,
                         font_hi_name=font_hi_name, font_hi_file=font_hi_file,
                         output_pdf=_make_output(sub_mode))
                out_files.append((sub_mode, _make_output(sub_mode)))
            except Exception as e: print(f"[WARN] {sub_mode} failed: {e}")
        return

    spans = extract_spans_from_textlayer(src)
    transfer_color_size_from_original(spans, orig_index)

    if mode == "overlay":
        if not overlay_items: raise ValueError("overlay mode requires overlay_items.")
        if erase_mode in ("mask", "redact"):
            spans_by_page: Dict[int, List[Span]] = {}
            for sp in spans: spans_by_page.setdefault(sp.page, []).append(sp)
            redacted_pages = set()
            for it in overlay_items:
                pno = int(it["page"])
                if not (0 <= pno < len(out)): continue
                page = out[pno]
                r = overlay_transform_rect(it["bbox"], scale_x=overlay_scale_x, scale_y=overlay_scale_y,
                                          off_x=overlay_off_x, off_y=overlay_off_y) & page.rect
                if r.is_empty: continue
                fill = dominant_text_fill_for_rect(pno, r, spans_by_page)
                if erase_mode == "mask": page.draw_rect(r, color=None, fill=fill, overlay=True, width=0)
                else: page.add_redact_annot(r, fill=fill); redacted_pages.add(pno)
            if erase_mode == "redact":
                for pno in redacted_pages:
                    try: out[pno].apply_redactions()
                    except Exception as e: print(f"[page {pno}] apply_redactions error: {e}")

        for it in overlay_items:
            pno = int(it["page"])
            if not (0 <= pno < len(out)): continue
            page = out[pno]
            rect = overlay_transform_rect(it["bbox"], scale_x=overlay_scale_x, scale_y=overlay_scale_y,
                                         off_x=overlay_off_x, off_y=overlay_off_y)
            if rect.is_empty: continue
            text = it.get("text", "") or it.get("translated_text", "") or ""
            base_fs = float(it.get("fontsize", 11.5))
            fontfile = overlay_choose_fontfile_for_text(text, font_en_file, font_hi_file)
            if overlay_render == "image":
                overlay_draw_text_as_image(page, rect, text, base_fs, fontfile, target_dpi=overlay_target_dpi,
                                          line_spacing=overlay_line_spacing, align=overlay_align, margin_px=overlay_margin_px)
            else:
                if _DEV.search(text): fname, ffile = font_hi_name, font_hi_file
                else: fname, ffile = font_en_name, font_en_file
                insert_text_fit(page, (rect.x0, rect.y0, rect.x1, rect.y1), text, fname, base_fs, (0.0,), fontfile=ffile)
    
    elif mode == "hybrid":
        hblocks = extract_blocks_with_segments(src)
        derive_block_styles_from_spans(hblocks, spans)
        erase_original_text(out, spans, mode, erase_mode, redact_color)
        for bl in hblocks:
            page = out[bl.page]
            if translate_dir == "hi->en": sl, dl = "hi", "en"
            elif translate_dir == "en->hi": sl, dl = "en", "hi"
            else:
                sl = _dominant_script(bl.text); dl = "en" if sl == "hi" else "hi"
            if is_table_like(bl):
                cols = build_columns(bl)
                for ln in bl.lines:
                    for seg in ln.segments:
                        text_out = translate_text(seg.text, sl, dl) or ""
                        if _DEV.search(text_out): fname, ffile = font_hi_name, font_hi_file
                        else: fname, ffile = font_en_name, font_en_file
                        best_col = max(cols, key=lambda c: max(0.0, min(seg.rect[2], c[1]) - max(seg.rect[0], c[0])))
                        insert_text_fit(page, (best_col[0], ln.rect[1], best_col[1], ln.rect[3]), text_out, fname, bl.fontsize, bl.color, fontfile=ffile)
            else:
                text_out = translate_text(bl.text, sl, dl) or ""
                if _DEV.search(text_out): fname, ffile = font_hi_name, font_hi_file
                else: fname, ffile = font_en_name, font_en_file
                insert_text_fit(page, bl.rect, text_out, fname, bl.fontsize, bl.color, fontfile=ffile)

    else:
        erase_original_text(out, spans, mode, erase_mode, redact_color)
        if mode == "span":
            for sp in spans:
                sl, dl = ("hi", "en") if translate_dir == "hi->en" else (("en", "hi") if translate_dir == "en->hi" else (_dominant_script(sp.text), "en" if _dominant_script(sp.text) == "hi" else "hi"))
                text_out = translate_text(sp.text, sl, dl) or ""
                page = out[sp.page]
                fname, ffile = (font_hi_name, font_hi_file) if _DEV.search(text_out) else (font_en_name, font_en_file)
                insert_text_fit(page, sp.rect, text_out, fname, sp.fontsize, sp.color, fontfile=ffile)
        elif mode == "line":
            lines = extract_lines_from_textlayer(src)
            derive_line_styles_from_spans(lines, spans)
            for ln in lines:
                sl, dl = ("hi", "en") if translate_dir == "hi->en" else (("en", "hi") if translate_dir == "en->hi" else (_dominant_script(ln.text), "en" if _dominant_script(ln.text) == "hi" else "hi"))
                text_out = translate_text(ln.text, sl, dl) or ""
                page = out[ln.page]
                fname, ffile = (font_hi_name, font_hi_file) if _DEV.search(text_out) else (font_en_name, font_en_file)
                insert_text_fit(page, ln.rect, text_out, fname, ln.fontsize, ln.color, fontfile=ffile)
        elif mode == "block":
            blocks = extract_blocks_from_textlayer(src)
            derive_block_styles_from_spans(blocks, spans)
            for bl in blocks:
                sl, dl = ("hi", "en") if translate_dir == "hi->en" else (("en", "hi") if translate_dir == "en->hi" else (_dominant_script(bl.text), "en" if _dominant_script(bl.text) == "hi" else "hi"))
                text_out = translate_text(bl.text, sl, dl) or ""
                page = out[bl.page]
                fname, ffile = (font_hi_name, font_hi_file) if _DEV.search(text_out) else (font_en_name, font_en_file)
                insert_text_fit(page, bl.rect, text_out, fname, bl.fontsize, bl.color, fontfile=ffile)

    os.makedirs(os.path.dirname(output_pdf) or ".", exist_ok=True)
    out.save(output_pdf); out.close(); src.close()
