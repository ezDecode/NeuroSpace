import PyPDF2
import docx
import os
from typing import List, Optional

class TextExtractor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
        """
        Extract text from PDF file
        """
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None

    @staticmethod
    def extract_text_from_docx(file_path: str) -> Optional[str]:
        """
        Extract text from DOCX file
        """
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return None

    @staticmethod
    def extract_text_from_txt(file_path: str) -> Optional[str]:
        """
        Extract text from TXT file
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Error extracting text from TXT: {e}")
            return None

    @staticmethod
    def extract_text(file_path: str, content_type: str) -> Optional[str]:
        """
        Extract text from file based on content type
        """
        if content_type == 'application/pdf':
            return TextExtractor.extract_text_from_pdf(file_path)
        elif content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return TextExtractor.extract_text_from_docx(file_path)
        elif content_type in ['text/plain', 'text/markdown']:
            return TextExtractor.extract_text_from_txt(file_path)
        else:
            print(f"Unsupported content type: {content_type}")
            return None

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks
        """
        if not text:
            return []

        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # If this is not the last chunk, try to break at a sentence boundary
            if end < len(text):
                # Look for sentence endings
                for i in range(end, max(start, end - 100), -1):
                    if text[i] in '.!?':
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break

        return chunks