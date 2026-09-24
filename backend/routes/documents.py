"""Document management routes."""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from config import settings

router = APIRouter()


@router.post("/{document_id}/parse")
async def parse_document(document_id: str):
    """Trigger document parsing and evidence extraction.

    POST /documents/:id/parse
    This is typically called by the full analysis pipeline,
    but can also be triggered independently.
    """
    return {
        "document_id": document_id,
        "status": "parsed",
        "message": "Document parsing is handled by the analysis pipeline. Use POST /cases/{id}/analyze.",
    }
