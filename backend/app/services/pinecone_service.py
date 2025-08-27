import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Optional, Dict, Any
import uuid
import logging
import re

logger = logging.getLogger(__name__)

class PineconeService:
    def __init__(self, embedding_dimension: int = 1024):
        # Validate required environment variables
        self.api_key = os.getenv('PINECONE_API_KEY')
        self.environment = os.getenv('PINECONE_ENVIRONMENT')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'neurospace-embeddings')
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY environment variable is required")
        if not self.environment:
            raise ValueError("PINECONE_ENVIRONMENT environment variable is required")
        # Validate environment/region: must be serverless region like 'us-east-1'
        region_pattern = re.compile(r"^[a-z]{2}-[a-z]+-\d$")
        if not region_pattern.match(self.environment):
            raise ValueError(
                f"PINECONE_ENVIRONMENT must be a valid serverless region (e.g., 'us-east-1'). Found: {self.environment}"
            )
        
        self.embedding_dimension = embedding_dimension
        logger.info(
            f"Initializing Pinecone service with region={self.environment}, index={self.index_name}, dimension={embedding_dimension}"
        )
        
        # Initialize Pinecone with new API
        try:
            self.pc = Pinecone(api_key=self.api_key)
            logger.info("Pinecone client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {e}")
            raise ValueError(f"Failed to initialize Pinecone client: {e}")
        
        # Get or create index
        self.index = self._get_or_create_index()

    def _get_or_create_index(self):
        """
        Get existing index or create a new one with proper error handling
        """
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            logger.info(f"Found {len(existing_indexes)} existing indexes")
            
            for idx in existing_indexes:
                # Support both object and dict responses from SDK
                idx_name = None
                try:
                    idx_name = getattr(idx, 'name', None)
                except Exception:
                    idx_name = None
                if not idx_name and isinstance(idx, dict):
                    idx_name = idx.get('name') or idx.get('index', {}).get('name')
                
                if idx_name == self.index_name:
                    logger.info(f"Using existing index: {self.index_name}")
                    index = self.pc.Index(self.index_name)
                    
                    # Validate dimension compatibility
                    try:
                        stats = index.describe_index_stats()
                        # stats is a dict in v5
                        index_dimension = None
                        if isinstance(stats, dict):
                            index_dimension = stats.get('dimension')
                        if index_dimension and index_dimension != self.embedding_dimension:
                            msg = (
                                f"Index dimension mismatch: expected {self.embedding_dimension}, found {index_dimension}. "
                                f"Guidance: Recreate the index '{self.index_name}' with dimension {self.embedding_dimension} "
                                f"(Pinecone serverless region '{self.environment}'), or change the embedding model to output {index_dimension}-dim vectors."
                            )
                            logger.error(msg)
                            raise ValueError(msg)
                    except Exception as e:
                        logger.warning(f"Could not validate index dimension: {e}")
                    
                    # Perform a lightweight readiness query to ensure index is queryable
                    try:
                        dummy_embedding = [0.0] * self.embedding_dimension
                        _ = index.query(vector=dummy_embedding, top_k=1, include_metadata=False)
                        logger.info(f"Index {self.index_name} readiness confirmed via no-op query")
                    except Exception as e:
                        logger.warning(f"Index {self.index_name} not ready for queries yet: {e}")
                    return index
            
            # Create new index if it doesn't exist
            logger.info(f"Creating new index: {self.index_name} with dimension {self.embedding_dimension} in region {self.environment}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.embedding_dimension,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region=self.environment
                )
            )
            
            # Wait for index to be ready
            import time
            max_wait = 60  # seconds
            waited = 0
            while waited < max_wait:
                try:
                    index = self.pc.Index(self.index_name)
                    stats = index.describe_index_stats()
                    if isinstance(stats, dict):
                        logger.info(f"Index {self.index_name} is ready with keys: {list(stats.keys())}")
                    else:
                        logger.info(f"Index {self.index_name} is ready")
                    break
                except Exception:
                    time.sleep(2)
                    waited += 2
            else:
                raise Exception(f"Index creation timed out after {max_wait} seconds")

            # Final readiness check with a no-op query (allows a short grace period)
            readiness_wait = 0
            readiness_max = 30
            while readiness_wait < readiness_max:
                try:
                    dummy_embedding = [0.0] * self.embedding_dimension
                    _ = index.query(vector=dummy_embedding, top_k=1, include_metadata=False)
                    logger.info(f"Index {self.index_name} readiness confirmed via no-op query")
                    break
                except Exception:
                    time.sleep(2)
                    readiness_wait += 2
            return index
            
        except Exception as e:
            logger.error(f"Error initializing Pinecone index: {e}")
            raise ValueError(f"Failed to initialize Pinecone index: {e}")

    def upsert_vectors(self, vectors: List[Dict[str, Any]], batch_size: int = 100) -> Dict[str, Any]:
        """
        Upsert vectors to Pinecone index with configurable batch size and detailed result summary
        Returns: { total, accepted, skipped, errors: [str] }
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return {"total": len(vectors or []), "accepted": 0, "skipped": len(vectors or []), "errors": ["Index not initialized"]}

            if not vectors:
                logger.warning("No vectors provided for upsert")
                return {"total": 0, "accepted": 0, "skipped": 0, "errors": []}

            # Validate vectors and prepare for upsert
            upsert_data = []
            validation_skipped = 0
            errors: List[str] = []
            for i, vector_data in enumerate(vectors):
                try:
                    if 'embedding' not in vector_data:
                        logger.error(f"Vector {i} missing 'embedding' field")
                        validation_skipped += 1
                        errors.append(f"vector[{i}]: missing 'embedding'")
                        continue
                    
                    embedding = vector_data['embedding']
                    if not isinstance(embedding, list) or len(embedding) != self.embedding_dimension:
                        logger.error(f"Vector {i} has invalid embedding dimension: expected {self.embedding_dimension}, got {len(embedding) if isinstance(embedding, list) else type(embedding)}")
                        validation_skipped += 1
                        errors.append(f"vector[{i}]: invalid embedding dimension")
                        continue
                    
                    metadata = vector_data.get('metadata', {}) or {}
                    # Enforce required metadata keys used in filters
                    missing_metadata = [k for k in ["user_id", "file_key"] if k not in metadata]
                    if missing_metadata:
                        logger.error(f"Vector {i} missing required metadata keys: {missing_metadata}. Skipping upsert.")
                        validation_skipped += 1
                        errors.append(f"vector[{i}]: missing metadata {missing_metadata}")
                        continue

                    upsert_data.append({
                        'id': vector_data.get('id', str(uuid.uuid4())),
                        'values': embedding,
                        'metadata': metadata
                    })
                except Exception as e:
                    logger.error(f"Error processing vector {i}: {e}")
                    validation_skipped += 1
                    errors.append(f"vector[{i}]: exception during preparation: {str(e)[:120]}")
                    continue

            if not upsert_data:
                logger.error("No valid vectors to upsert after validation")
                return {"total": len(vectors), "accepted": 0, "skipped": len(vectors), "errors": errors or ["No valid vectors after validation"]}

            logger.info(f"Upserting {len(upsert_data)} vectors in batches of {batch_size}")

            # Upsert in batches with error handling
            accepted = 0
            for i in range(0, len(upsert_data), batch_size):
                batch = upsert_data[i:i + batch_size]
                try:
                    response = self.index.upsert(vectors=batch)
                    # Pinecone v5 returns dict-like with upserted_count possibly
                    upserted_count = None
                    try:
                        if isinstance(response, dict):
                            upserted_count = response.get('upserted_count') or response.get('count')
                    except Exception:
                        upserted_count = None
                    accepted += upserted_count if isinstance(upserted_count, int) else len(batch)
                    logger.debug(f"Successfully upserted batch {i//batch_size + 1}")
                except Exception as e:
                    logger.error(f"Failed to upsert batch {i//batch_size + 1}: {e}")
                    errors.append(f"batch[{i//batch_size + 1}]: upsert failed: {str(e)[:200]}")

            total = len(vectors)
            skipped = (total - accepted)
            # Ensure skipped accounts for validation skips at minimum
            if skipped < validation_skipped:
                skipped = validation_skipped

            if errors:
                logger.warning(f"Upsert completed with errors. accepted={accepted}, skipped={skipped}, total={total}")
            else:
                logger.info(f"Upsert completed successfully. accepted={accepted}, total={total}")

            return {"total": total, "accepted": accepted, "skipped": skipped, "errors": errors}

        except Exception as e:
            logger.error(f"Error upserting vectors to Pinecone: {e}")
            return {"total": len(vectors or []), "accepted": 0, "skipped": len(vectors or []), "errors": [str(e)]}

    def search_similar(self, query_embedding: List[float], top_k: int = 5, filter_dict: Optional[Dict] = None) -> List[Dict]:
        """
        Search for similar vectors with comprehensive validation and error handling
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return []

            # Validate query embedding
            if not query_embedding or not isinstance(query_embedding, list):
                logger.error("Invalid query embedding: must be a non-empty list")
                return []
            
            if len(query_embedding) != self.embedding_dimension:
                logger.error(f"Query embedding dimension mismatch: expected {self.embedding_dimension}, got {len(query_embedding)}")
                return []

            # Validate top_k parameter
            if not isinstance(top_k, int) or top_k <= 0:
                logger.warning(f"Invalid top_k value: {top_k}, using default of 5")
                top_k = 5
            elif top_k > 10000:  # Pinecone limit
                logger.warning(f"top_k value {top_k} exceeds Pinecone limit, capping at 10000")
                top_k = 10000

            # Validate and clean filter dictionary
            validated_filter = self._validate_filter(filter_dict)
            
            logger.debug(f"Searching with top_k={top_k}, filter={validated_filter}")

            # Perform search
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=validated_filter
            )

            # Format results
            formatted_results = []
            for match in results.matches:
                formatted_results.append({
                    'id': match.id,
                    'score': match.score,
                    'metadata': match.metadata or {}
                })

            logger.info(f"Search returned {len(formatted_results)} results")
            return formatted_results

        except Exception as e:
            logger.error(f"Error searching Pinecone: {e}")
            return []

    def _validate_filter(self, filter_dict: Optional[Dict]) -> Optional[Dict]:
        """
        Validate and clean filter dictionary for Pinecone compatibility
        """
        if not filter_dict:
            return None
            
        try:
            validated_filter = {}
            
            for key, value in filter_dict.items():
                if not isinstance(key, str):
                    logger.warning(f"Skipping non-string filter key: {key}")
                    continue
                    
                # Handle various filter value types
                if isinstance(value, dict):
                    # Validate operator structure (e.g., {"$eq": "value"} or {"$in": ["val1", "val2"]})
                    validated_operators = {}
                    for op, op_value in value.items():
                        if op in ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$in", "$nin"]:
                            if op in ["$in", "$nin"] and isinstance(op_value, list):
                                # Ensure list values are not empty
                                if op_value:
                                    validated_operators[op] = op_value
                                else:
                                    logger.warning(f"Empty list for operator {op}, skipping")
                            elif op not in ["$in", "$nin"]:
                                validated_operators[op] = op_value
                            else:
                                logger.warning(f"Invalid value type for operator {op}: expected list, got {type(op_value)}")
                        else:
                            logger.warning(f"Unsupported filter operator: {op}")
                    
                    if validated_operators:
                        validated_filter[key] = validated_operators
                else:
                    # Simple equality filter
                    validated_filter[key] = {"$eq": value}
            
            return validated_filter if validated_filter else None
            
        except Exception as e:
            logger.error(f"Error validating filter: {e}")
            return None

    def delete_vectors(self, vector_ids: List[str]) -> bool:
        """
        Delete vectors by IDs with validation
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return False

            if not vector_ids:
                logger.warning("No vector IDs provided for deletion")
                return True

            # Validate vector IDs
            valid_ids = [vid for vid in vector_ids if isinstance(vid, str) and vid.strip()]
            if len(valid_ids) != len(vector_ids):
                logger.warning(f"Filtered out {len(vector_ids) - len(valid_ids)} invalid vector IDs")

            if not valid_ids:
                logger.error("No valid vector IDs to delete")
                return False

            logger.info(f"Deleting {len(valid_ids)} vectors")
            self.index.delete(ids=valid_ids)
            return True

        except Exception as e:
            logger.error(f"Error deleting vectors from Pinecone: {e}")
            return False

    def get_index_stats(self) -> Optional[Dict]:
        """
        Get index statistics
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return None

            stats = self.index.describe_index_stats()
            logger.debug(f"Index stats retrieved: {stats}")
            return stats if isinstance(stats, dict) else None

        except Exception as e:
            logger.error(f"Error getting Pinecone stats: {e}")
            return None

    def test_connection(self) -> bool:
        """
        Test connection to Pinecone
        """
        try:
            # Test basic connectivity
            stats = self.get_index_stats()
            if stats is None:
                return False
            
            # Test a simple query if possible
            try:
                # Use a dummy embedding for connection test
                dummy_embedding = [0.0] * self.embedding_dimension
                _ = self.index.query(
                    vector=dummy_embedding,
                    top_k=1,
                    include_metadata=False
                )
                logger.info("Pinecone connection test successful")
                return True
            except Exception as e:
                logger.warning(f"Basic stats available but query test failed: {e}")
                return True  # Stats available means connection is working
                
        except Exception as e:
            logger.error(f"Pinecone connection test failed: {e}")
            return False

    def get_embedding_dimension(self) -> int:
        """
        Get the configured embedding dimension
        """
        return self.embedding_dimension

    def health_check(self) -> Dict[str, Any]:
        """
        Comprehensive health check for Pinecone service
        """
        health_status = {
            "service": "pinecone",
            "status": "unknown",
            "details": {},
            "timestamp": None
        }
        
        try:
            import time
            health_status["timestamp"] = time.time()
            
            # Check if index is initialized
            if not self.index:
                health_status["status"] = "error"
                health_status["details"]["error"] = "Index not initialized"
                return health_status
            
            # Get index stats
            stats = self.get_index_stats()
            if stats:
                health_status["details"]["index_stats"] = {
                    "total_vector_count": stats.get('total_vector_count') or stats.get('vector_count') or 0,
                    "dimension": stats.get('dimension')
                }
            
            # Test connection
            connection_ok = self.test_connection()
            health_status["details"]["connection"] = connection_ok
            
            if connection_ok:
                health_status["status"] = "healthy"
            else:
                health_status["status"] = "degraded"
                health_status["details"]["error"] = "Connection test failed"
                
        except Exception as e:
            health_status["status"] = "error"
            health_status["details"]["error"] = str(e)
            logger.error(f"Pinecone health check failed: {e}")
        
        return health_status