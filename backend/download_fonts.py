"""
download_fonts.py — Downloads Arial TTF fonts from a public source.
Run once: python download_fonts.py
Fonts are then bundled in /backend/fonts/ for Render deployment.

If you have Arial fonts locally (Windows: C:/Windows/Fonts/):
  copy C:/Windows/Fonts/arial.ttf fonts/arial.ttf
  copy C:/Windows/Fonts/arialbd.ttf fonts/arialbd.ttf
"""

import os
import shutil
import sys

FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")
os.makedirs(FONTS_DIR, exist_ok=True)

WINDOWS_FONTS = r"C:\Windows\Fonts"

def copy_from_windows():
    for src_name, dst_name in [("arial.ttf", "arial.ttf"), ("arialbd.ttf", "arialbd.ttf")]:
        src = os.path.join(WINDOWS_FONTS, src_name)
        dst = os.path.join(FONTS_DIR, dst_name)
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)
            print(f"Copied {src_name} → fonts/{dst_name}")
        elif os.path.exists(dst):
            print(f"Already exists: fonts/{dst_name}")
        else:
            print(f"NOT FOUND: {src} — please manually copy Arial fonts to fonts/")

if __name__ == "__main__":
    copy_from_windows()
    arial = os.path.join(FONTS_DIR, "arial.ttf")
    arialbd = os.path.join(FONTS_DIR, "arialbd.ttf")
    if os.path.exists(arial) and os.path.exists(arialbd):
        print("\nFonts ready. Backend will use Arial for invoices.")
    else:
        print("\nWARNING: fonts/arial.ttf or fonts/arialbd.ttf missing.")
        print("Invoices will fall back to Helvetica (PDF built-in font).")
