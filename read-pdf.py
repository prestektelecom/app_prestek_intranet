import PyPDF2
reader = PyPDF2.PdfReader('c:/Users/FelixBR/Desktop/stitch/docs/Manual-da-Marca-Prestek-Telecom.pdf')
for page in reader.pages:
    print(page.extract_text())
