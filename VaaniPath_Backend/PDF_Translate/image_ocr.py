import asyncio
import nest_asyncio
import re
from .constants import _TR

nest_asyncio.apply()

def translate_text(text: str, src_lang: str, dest_lang: str) -> str:
    if not text.strip():
        return ""
    try:
        # Use the global translator from constants
        res = _TR.translate(text, src=src_lang, dest=dest_lang)
        
        # Handle async objects if returned (depends on googletrans version)
        if asyncio.iscoroutine(res):
            loop = asyncio.get_event_loop()
            res = loop.run_until_complete(res)
            
        out = getattr(res, "text", text)
        
        # Cleanup
        out = "\n".join(" ".join(line.split()) for line in out.splitlines())
        out = re.sub(r"\s+([,.;:!?\u0964])", r"\1", out)
        return out
    except Exception as e:
        print(f"⚠️ [translate] Error: {e}")
        return text
