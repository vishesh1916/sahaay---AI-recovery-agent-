"""Document parsing service using pure-Python pypdf or text parser."""
import os
import json
from config import settings

class ParsedDocument:
    def __init__(self, content: str, tables: list[dict], metadata: dict):
        self.content = content
        self.tables = tables
        self.metadata = metadata

class DocumentParser:
    def __init__(self):
        self.llama_api_key = settings.LLAMA_CLOUD_API_KEY
    
    async def parse(self, file_path: str, doc_type: str) -> ParsedDocument:
        """Parse a PDF, image, or text document."""
        lower_path = file_path.lower()
        if lower_path.endswith(".pdf"):
            return self._parse_with_pypdf(file_path, doc_type)
        elif lower_path.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif")):
            return self._parse_image(file_path, doc_type)
        return self._parse_with_text(file_path, doc_type)
    
    def _parse_with_pypdf(self, file_path: str, doc_type: str) -> ParsedDocument:
        """Pure-Python PDF parser using pypdf."""
        import pypdf
        content_parts = []
        try:
            reader = pypdf.PdfReader(file_path)
            for page_num, page in enumerate(reader.pages, 1):
                text = page.extract_text() or ""
                if text.strip():
                    content_parts.append(f"--- Page {page_num} ---\n{text.strip()}")
        except Exception as e:
            content_parts.append(f"PDF extraction notice: {e}")

        content = "\n\n".join(content_parts)
        return ParsedDocument(
            content=content,
            tables=[],
            metadata={"parser": "pypdf", "doc_type": doc_type, "file": os.path.basename(file_path)}
        )

    def _parse_image(self, file_path: str, doc_type: str) -> ParsedDocument:
        """Handle uploaded image files without dumping raw binary bytes."""
        filename = os.path.basename(file_path)
        return ParsedDocument(
            content=f"[Attached Image File: {filename}. Line items will be audited based on user narrative and invoice amounts.]",
            tables=[],
            metadata={"parser": "image_descriptor", "doc_type": doc_type, "file": filename, "is_image": True}
        )

    def _parse_with_text(self, file_path: str, doc_type: str) -> ParsedDocument:
        """Plain text reader for .txt, .csv, .json files."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            content = ""
        return ParsedDocument(
            content=content,
            tables=[],
            metadata={"parser": "plaintext", "doc_type": doc_type, "file": os.path.basename(file_path)}
        )
