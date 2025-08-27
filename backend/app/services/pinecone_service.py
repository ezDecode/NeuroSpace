import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Optional, Dict, Any
import uuid

class PineconeService:
    def __init__(self):
        self.api_key = os.getenv('PINECONE_API_KEY')
        self.environment = os.getenv('PINECONE_ENVIRONMENT')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'neurospace-embeddings')
        
        # Initialize Pinecone with new API
        self.pc = Pinecone(api_key=self.api_key)
        
        # Get or create index
        self.index = self._get_or_create_index()

    def _get_or_create_index(self):
        """
        Get existing index or create a new one
        """
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            if self.index_name in [idx['name'] for idx in existing_indexes]:
                return self.pc.Index(self.index_name)
            else:
                # Create new index with ServerlessSpec
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1024,  # Adjust based on your embedding model
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region=self.environment or 'us-east-1'
                    )
                )
                return self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Error initializing Pinecone index: {e}")
            return None

    async def upsert_vectors(self, vectors: List[Dict[str, Any]]) -> bool:
        """
        Upsert vectors to Pinecone index
        """
        try:
            if not self.index:
                print("Pinecone index not initialized")
                return False

            # Prepare vectors for upsert
            upsert_data = []
            for vector_data in vectors:
                upsert_data.append({
                    'id': vector_data.get('id', str(uuid.uuid4())),
                    'values': vector_data['embedding'],
                    'metadata': vector_data.get('metadata', {})
                })

            # Upsert in batches
            batch_size = 100
            for i in range(0, len(upsert_data), batch_size):
                batch = upsert_data[i:i + batch_size]
                self.index.upsert(vectors=batch)

            return True

        except Exception as e:
            print(f"Error upserting vectors to Pinecone: {e}")
            return False

    async def search_similar(self, query_embedding: List[float], top_k: int = 5, filter_dict: Optional[Dict] = None) -> List[Dict]:
        """
        Search for similar vectors
        """
        try:
            if not self.index:
                print("Pinecone index not initialized")
                return []

            # Perform search
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )

            # Format results
            formatted_results = []
            for match in results.matches:
                formatted_results.append({
                    'id': match.id,
                    'score': match.score,
                    'metadata': match.metadata
                })

            return formatted_results

        except Exception as e:
            print(f"Error searching Pinecone: {e}")
            return []

    async def delete_vectors(self, vector_ids: List[str]) -> bool:
        """
        Delete vectors by IDs
        """
        try:
            if not self.index:
                print("Pinecone index not initialized")
                return False

            self.index.delete(ids=vector_ids)
            return True

        except Exception as e:
            print(f"Error deleting vectors from Pinecone: {e}")
            return False

    async def get_index_stats(self) -> Optional[Dict]:
        """
        Get index statistics
        """
        try:
            if not self.index:
                print("Pinecone index not initialized")
                return None

            stats = self.index.describe_index_stats()
            return stats

        except Exception as e:
            print(f"Error getting Pinecone stats: {e}")
            return None

    async def test_connection(self) -> bool:
        """
        Test connection to Pinecone
        """
        try:
            stats = await self.get_index_stats()
            return stats is not None
        except Exception as e:
            print(f"Pinecone connection test failed: {e}")
            return False