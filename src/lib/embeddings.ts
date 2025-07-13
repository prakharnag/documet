import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Check for required environment variables
if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is required');
}

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the index with integrated embeddings
const indexName = process.env.PINECONE_INDEX_NAME || 'documents';
const index = pc.index(indexName);

export class EmbeddingService {
  /**
   * Generate embeddings for a single text using integrated model
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      // With integrated embeddings, we don't need to generate embeddings separately
      // The index will handle this automatically when we upsert with text
      throw new Error('Use storeEmbeddingsWithText instead for integrated embeddings');
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for multiple texts using integrated model
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // With integrated embeddings, we don't need to generate embeddings separately
      throw new Error('Use storeEmbeddingsWithText instead for integrated embeddings');
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Store embeddings with text for OpenAI embedding model
   */
  static async storeEmbeddingsWithText(
    chunks: Array<{ id: string; text: string; metadata: any }>,
    namespace?: string
  ): Promise<{ success: boolean; vectorsStored?: number; error?: string }> {
    try {
      // 1. Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // 2. Generate embeddings for each chunk's text
      const texts = chunks.map(chunk => chunk.text);
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });
      const embeddings = embeddingResponse.data.map((item: any) => item.embedding);

      // 3. Create Pinecone vector objects
      const vectors = chunks.map((chunk, i) => ({
        id: chunk.id,
        values: embeddings[i], // float[]
        metadata: {
          chunk_text: chunk.text,
          filename: chunk.metadata.filename || '',
          user_id: chunk.metadata.user_id || '',
          chunk_id: chunk.metadata.chunk_id || '',
          ...chunk.metadata,
        },
      }));

      // 4. Upsert to Pinecone
      if (namespace) {
        await index.namespace(namespace).upsert(vectors);
      } else {
        await index.upsert(vectors);
      }

      return {
        success: true,
        vectorsStored: vectors.length,
      };
    } catch (error) {
      console.error('Error storing embeddings with text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Search similar documents using text query
   */
  static async searchSimilarDocuments(
    query: string,
    topK: number = 10, // Increased from 5 to 10 for better retrieval
    namespace?: string
  ): Promise<{
    success: boolean;
    results?: any[];
    error?: string;
  }> {
    try {
      // 1. Generate embedding for the query
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: [query],
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // 2. Use the embedding in the Pinecone query
      const searchResponse = namespace
        ? await index.namespace(namespace).query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
          })
        : await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
          });

      // Format results
      const results = searchResponse.matches.map((match: any) => ({
        id: match.id,
        score: match.score || 0,
        metadata: {
          text: match.metadata?.chunk_text || '',
          filename: match.metadata?.filename || '',
          user_id: match.metadata?.user_id || '',
          chunk_id: match.metadata?.chunk_id || '',
          ...match.metadata,
        },
      }));

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error searching similar documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get vector IDs for a specific document
   */
  static async getVectorIdsByDocument(
    documentId: string,
    namespace?: string
  ): Promise<{
    success: boolean;
    vectorIds?: string[];
    error?: string;
  }> {
    try {
      // Use a dummy vector of the correct dimension (1536 for OpenAI embeddings)
      const dummyVector = Array(1536).fill(0);
      const searchResponse = namespace
        ? await index.namespace(namespace).query({
            vector: dummyVector,
            topK: 10000,
            includeMetadata: true,
            filter: {
              document_id: { $eq: documentId }
            }
          })
        : await index.query({
            vector: dummyVector,
            topK: 10000,
            includeMetadata: true,
            filter: {
              document_id: { $eq: documentId }
            }
          });

      const vectorIds = searchResponse.matches.map((match: any) => match.id);

      return {
        success: true,
        vectorIds,
      };
    } catch (error) {
      console.error('Error getting vector IDs by document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete vectors by document ID
   */
  static async deleteVectorsByDocument(
    documentId: string,
    namespace?: string
  ): Promise<{
    success: boolean;
    vectorsDeleted?: number;
    error?: string;
  }> {
    try {
      // First get the vector IDs for this document
      const vectorIdsResult = await this.getVectorIdsByDocument(documentId, namespace);
      
      if (!vectorIdsResult.success || !vectorIdsResult.vectorIds) {
        return {
          success: false,
          error: vectorIdsResult.error || 'Failed to get vector IDs',
        };
      }

      if (vectorIdsResult.vectorIds.length === 0) {
        return {
          success: true,
          vectorsDeleted: 0,
        };
      }

      // Delete the vectors
      const deleteResult = await this.deleteVectors(vectorIdsResult.vectorIds, namespace);
      
      if (!deleteResult.success) {
        return {
          success: false,
          error: deleteResult.error || 'Failed to delete vectors',
        };
      }

      return {
        success: true,
        vectorsDeleted: vectorIdsResult.vectorIds.length,
      };
    } catch (error) {
      console.error('Error deleting vectors by document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete vectors by IDs
   */
  static async deleteVectors(
    ids: string[],
    namespace?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (namespace) {
        await index.namespace(namespace).deleteMany(ids);
      } else {
        await index.deleteMany(ids);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting vectors:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get index statistics
   */
  static async getIndexStats(namespace?: string): Promise<{
    success: boolean;
    stats?: any;
    error?: string;
  }> {
    try {
      const stats = namespace
        ? await index.namespace(namespace).describeIndexStats()
        : await index.describeIndexStats();

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error('Error getting index stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default EmbeddingService;