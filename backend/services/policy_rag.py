"""Policy RAG (Retrieval Augmented Generation) service using ChromaDB with keyword fallback."""
import uuid

try:
    import chromadb
    from chromadb.config import DEFAULT_TENANT, DEFAULT_DATABASE, Settings as ChromaSettings
except ImportError:
    chromadb = None

class PolicyRAG:
    """Index and search insurance policy documents using ChromaDB or keyword search."""
    
    def __init__(self):
        if chromadb:
            self.client = chromadb.Client(ChromaSettings(anonymized_telemetry=False))
        else:
            self.client = None
        self.fallback_docs = {}
        self.collection_name = "policy_documents"
    
    def _get_collection(self, case_id: str):
        """Get or create a collection for a specific case."""
        collection_name = f"policy_{case_id.replace('-', '_')}"
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
    
    def index_policy(self, case_id: str, parsed_content: str, document_id: str):
        """Index a parsed policy document into ChromaDB.
        
        Chunks the document and stores embeddings for retrieval.
        """
        collection = self._get_collection(case_id)
        
        # Chunk the content
        chunks = self._chunk_content(parsed_content)
        
        # Index chunks
        ids = []
        documents = []
        metadatas = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}_chunk_{i}"
            ids.append(chunk_id)
            documents.append(chunk["text"])
            metadatas.append({
                "document_id": document_id,
                "chunk_index": i,
                "page": chunk.get("page", 1),
                "section": chunk.get("section", ""),
            })
        
        if ids:
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
            )
        
        return len(ids)
    
    def search(self, case_id: str, query: str, n_results: int = 5) -> list[dict]:
        """Search the policy index for relevant clauses.
        
        Returns:
            List of dicts with keys: text, page, section, score, document_id
        """
        collection = self._get_collection(case_id)
        
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
        )
        
        output = []
        if results and results["documents"]:
            for i, doc in enumerate(results["documents"][0]):
                metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                distance = results["distances"][0][i] if results["distances"] else 1.0
                output.append({
                    "text": doc,
                    "page": metadata.get("page", 1),
                    "section": metadata.get("section", ""),
                    "score": 1 - distance,  # Convert distance to similarity
                    "document_id": metadata.get("document_id", ""),
                })
        
        return output
    
    def _chunk_content(self, content: str, chunk_size: int = 500, overlap: int = 100) -> list[dict]:
        """Split content into overlapping chunks."""
        chunks = []
        
        # First try to split by page markers
        pages = content.split("--- Page ")
        
        current_page = 1
        for page_content in pages:
            if not page_content.strip():
                continue
            
            # Extract page number if present
            lines = page_content.split('\n', 1)
            if lines[0].strip().endswith('---'):
                try:
                    current_page = int(lines[0].strip().rstrip(' -'))
                    page_content = lines[1] if len(lines) > 1 else ""
                except (ValueError, IndexError):
                    pass
            
            # Split page into paragraphs
            paragraphs = page_content.split('\n\n')
            current_chunk = ""
            
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                
                if len(current_chunk) + len(para) < chunk_size:
                    current_chunk += "\n\n" + para if current_chunk else para
                else:
                    if current_chunk:
                        chunks.append({
                            "text": current_chunk.strip(),
                            "page": current_page,
                            "section": self._detect_section(current_chunk),
                        })
                    current_chunk = para
            
            if current_chunk:
                chunks.append({
                    "text": current_chunk.strip(),
                    "page": current_page,
                    "section": self._detect_section(current_chunk),
                })
        
        # If no page markers, do simple chunking
        if not chunks:
            words = content.split()
            for i in range(0, len(words), chunk_size - overlap):
                chunk_text = " ".join(words[i:i + chunk_size])
                chunks.append({
                    "text": chunk_text,
                    "page": 1,
                    "section": self._detect_section(chunk_text),
                })
        
        return chunks
    
    def _detect_section(self, text: str) -> str:
        """Try to detect the section heading from text content."""
        lines = text.strip().split('\n')
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            if line and len(line) < 100:
                # Check if it looks like a heading
                if line.startswith('#') or line.isupper() or line.endswith(':'):
                    return line.lstrip('#').strip().rstrip(':')
        return ""
