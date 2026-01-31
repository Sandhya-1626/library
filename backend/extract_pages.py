import fitz  # PyMuPDF
import os

pdf_path = "uploads/EDC-Lecture-Notes.pdf"
output_dir = "uploads/edc_pages"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

for i in range(len(doc)):
    page = doc.load_page(i)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Higher resolution
    output_path = os.path.join(output_dir, f"page_{i+1}.png")
    pix.save(output_path)
    print(f"Saved page {i+1}")

doc.close()
