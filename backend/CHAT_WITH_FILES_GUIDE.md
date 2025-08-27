# NeuroSpace: Chat with Specific Files - Complete Guide

## 🎯 Overview
The NeuroSpace system allows users to chat with specific files by converting documents into searchable vector embeddings and then retrieving relevant context based on user questions. Here's exactly how it works.

## 📋 Complete Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FILE UPLOAD   │ -> │ FILE PROCESSING │ -> │   VECTOR STORE  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         v                       v                       v
   [S3 Storage]            [Text Extraction]       [Pinecone DB]
                          [Text Chunking]         [Embeddings]
                          [Embedding Gen]         [Metadata]

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER QUERY    │ -> │ SEARCH & MATCH  │ -> │   AI RESPONSE   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         v                       v                       v
   [Question Text]          [Vector Search]         [Contextualized]
   [File Selection]         [Similarity Match]      [Answer + Refs]
                           [Context Assembly]
```

## 🔄 Step-by-Step Process

### Phase 1: File Upload & Processing

#### 1. **File Upload to S3**
```javascript
// User uploads file through frontend
POST /files/upload
{
  "file": <binary_data>,
  "user_id": "user_123"
}
```

#### 2. **File Processing Pipeline**
```python
POST /process
{
  "file_key": "uploads/user_123/document.pdf",
  "file_name": "document.pdf", 
  "user_id": "user_123",
  "content_type": "application/pdf"
}
```

**What happens during processing:**

1. **Download from S3**
   ```python
   local_file_path = await s3_service.download_file(request.file_key)
   ```

2. **Text Extraction**
   ```python
   text = TextExtractor.extract_text(local_file_path, request.content_type)
   # Supports: PDF, DOCX, TXT, and more
   ```

3. **Text Chunking**
   ```python
   chunks = TextExtractor.chunk_text(text)
   # Breaks text into ~500-1000 character chunks with overlap
   ```

4. **Embedding Generation**
   ```python
   embeddings = await nim_service.generate_embeddings_batch(chunks)
   # Uses NVIDIA nv-embedqa-e5-v5 model (1024 dimensions)
   ```

5. **Vector Storage in Pinecone**
   ```python
   valid_embeddings = []
   for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
       if embedding:
           valid_embeddings.append({
               'id': f"{request.file_key}_chunk_{i}",
               'embedding': embedding,
               'metadata': {
                   'file_key': request.file_key,
                   'file_name': request.file_name,
                   'user_id': request.user_id,
                   'chunk_index': i,
                   'text': chunk_preview,  # First 500 chars
                   'content_type': request.content_type
               }
           })
   
   success = pinecone_service.upsert_vectors(valid_embeddings)
   ```

6. **Database Record Update**
   ```python
   # Update file status in Supabase
   await supabase_service.update_file_status(
       file_id, 
       'processed', 
       len(valid_embeddings),
       actual_file_size
   )
   ```

### Phase 2: Chat Query & Retrieval

#### 1. **User Asks Question**
```javascript
POST /ask
{
  "user_id": "user_123",
  "question": "What are the main findings in the research?",
  "top_k": 5,
  "selected_files": ["research_paper.pdf", "methodology.docx"]  // Optional
}
```

#### 2. **Query Processing Pipeline**

**Step 1: Question Embedding**
```python
# Convert user question to vector
embedding = await nim_service.generate_embedding(payload.question.strip())
# Returns 1024-dimensional vector
```

**Step 2: Vector Search with Filters**
```python
# Build search filters
filter_dict = { "user_id": { "$eq": payload.user_id } }

# Add file filtering if specific files selected
if payload.selected_files:
    filter_dict["file_name"] = { "$in": payload.selected_files }

# Search for similar chunks
matches = pinecone_service.search_similar(
    embedding, 
    top_k=payload.top_k, 
    filter_dict=filter_dict
)
```

**Step 3: Context Assembly**
```python
context_parts = []
references = []

for match in matches:
    metadata = match.get('metadata', {})
    text = metadata.get('text', '')
    file_name = metadata.get('file_name', 'document')
    
    # Add to context with source attribution
    context_parts.append(f"[Source: {file_name}]\n{text}")
    
    # Track references for user
    references.append({
        "file_name": file_name,
        "score": match.get('score'),
        "chunk_index": metadata.get('chunk_index'),
        "file_key": metadata.get('file_key')
    })

context = "\n\n".join(context_parts)
```

**Step 4: AI Answer Generation**
```python
# Generate contextualized answer
answer = await nim_service.generate_answer(payload.question, context)

# The prompt internally looks like:
system_prompt = """
You are a helpful assistant that answers based strictly on the provided CONTEXT.
If the answer isn't contained in the context, say you don't have enough information.
Cite relevant filenames if provided in the context metadata.
"""

user_prompt = f"""
CONTEXT:
{context}

QUESTION: {payload.question}
"""
```

#### 3. **Response Structure**
```json
{
  "answer": "Based on the research findings, the main discoveries include...",
  "references": [
    {
      "file_name": "research_paper.pdf",
      "score": 0.89,
      "chunk_index": 12,
      "file_key": "uploads/user_123/research_paper.pdf"
    },
    {
      "file_name": "methodology.docx", 
      "score": 0.76,
      "chunk_index": 5,
      "file_key": "uploads/user_123/methodology.docx"
    }
  ]
}
```

## 🎯 How File Selection Works

### Without File Selection (Default)
```python
# Searches ALL user's files
filter_dict = { "user_id": { "$eq": "user_123" } }
```

### With Specific File Selection
```python
# Only searches selected files
filter_dict = { 
    "user_id": { "$eq": "user_123" },
    "file_name": { "$in": ["document1.pdf", "document2.docx"] }
}
```

### Vector Search Process
1. **Similarity Calculation**: Pinecone computes cosine similarity between query embedding and stored chunk embeddings
2. **Filtering**: Only chunks matching user_id and optionally file_name filters are considered
3. **Ranking**: Results sorted by similarity score (0-1, higher = more similar)
4. **Top-K Selection**: Returns the most relevant chunks up to the specified limit

## 🗃️ Database Schema

### Files Table (Supabase)
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    content_type TEXT DEFAULT '',
    status TEXT DEFAULT 'uploaded',
    chunks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    INDEX(user_id, file_name)
);
```

### Vector Store (Pinecone)
```python
{
    "id": "uploads/user_123/document.pdf_chunk_15",
    "values": [0.1, -0.3, 0.7, ...],  # 1024-dimensional embedding
    "metadata": {
        "file_key": "uploads/user_123/document.pdf",
        "file_name": "document.pdf", 
        "user_id": "user_123",
        "chunk_index": 15,
        "text": "This section discusses the methodology...",
        "content_type": "application/pdf"
    }
}
```

## 🔍 Query Examples

### Example 1: General Question Across All Files
```json
{
  "user_id": "user_123",
  "question": "What is the main conclusion?",
  "top_k": 5,
  "selected_files": []
}
```
**Result**: Searches all user's uploaded files for relevant content.

### Example 2: Specific File Question  
```json
{
  "user_id": "user_123", 
  "question": "What methodology was used in the study?",
  "top_k": 3,
  "selected_files": ["research_methodology.pdf"]
}
```
**Result**: Only searches within "research_methodology.pdf" for relevant chunks.

### Example 3: Multi-File Comparison
```json
{
  "user_id": "user_123",
  "question": "Compare the findings between studies",
  "top_k": 10,
  "selected_files": ["study1.pdf", "study2.pdf", "study3.pdf"]
}
```
**Result**: Searches across three specific files to find comparative information.

## ⚡ Performance Characteristics

### Search Speed
- **Embedding Generation**: ~100-300ms per query
- **Vector Search**: ~10-50ms for 1M+ vectors
- **Answer Generation**: ~1-3 seconds depending on context length
- **Total Response Time**: Usually 2-5 seconds

### Accuracy Factors
1. **Chunk Quality**: Better text extraction = better search results
2. **Chunk Size**: 500-1000 characters optimal for most content
3. **Overlap**: 50-100 character overlap prevents context loss
4. **Query Specificity**: More specific questions get better matches
5. **File Selection**: Narrowing to relevant files improves precision

## 🛠️ Advanced Features

### Streaming Responses
```javascript
POST /ask_stream
// Returns server-sent events for real-time response
```

### Debug Endpoints
```javascript
POST /debug/embedding  // Test embedding generation
POST /debug/search     // Test vector search directly
GET /health           // Check system status
```

### Error Handling
- **File Processing Failures**: Graceful degradation, partial results
- **Embedding Failures**: Automatic retries with exponential backoff
- **Search Failures**: Fallback to direct LLM without context

## 🔒 Security Features

### Access Control
- All queries scoped to authenticated user's files only
- File selection validated against user's actual files
- No cross-user data leakage possible

### Data Privacy
- Text chunks stored with user isolation
- Embeddings contain no readable text
- All operations logged for audit

## 🎉 Summary

The chat with specific files feature works by:

1. **Converting documents** → searchable vector embeddings
2. **Storing chunks** → in Pinecone with rich metadata  
3. **Processing queries** → through similarity search
4. **Assembling context** → from most relevant chunks
5. **Generating answers** → using AI with retrieved context
6. **Providing references** → so users know the sources

This creates a powerful RAG (Retrieval-Augmented Generation) system that lets users have natural conversations with their documents while maintaining full traceability to sources.