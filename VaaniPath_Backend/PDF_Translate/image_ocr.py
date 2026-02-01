import re
from deep_translator import GoogleTranslator

def translate_text(text: str, src_lang: str, dest_lang: str) -> str:
    if not text.strip():
        return ""
    try:
        # Initializing Translator per call is fine for deep-translator
        # It doesn't have the same overhead/connection issues as googletrans
        
        # map 'hi' to 'hindi' or use 'auto'
        s = 'auto' if src_lang == 'auto' else src_lang
        d = dest_lang
        
        translator = GoogleTranslator(source=s, target=d)
        out = translator.translate(text)
        
        if not out:
            return text
            
        # Cleanup
        out = "\n".join(" ".join(line.split()) for line in out.splitlines())
        out = re.sub(r"\s+([,.;:!?\u0964])", r"\1", out)
        return out
    except Exception as e:
        print(f"⚠️ [translate] Error: {e}")
        return text
