import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the index
const indexName = process.env.PINECONE_INDEX_NAME || 'documents';
const index = pc.index(indexName);

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    filename: string;
    user_id: string;
    chunk_id: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    filename: string;
    user_id: string;
    chunk_id: string;
    [key: string]: any;
  };
}

export class PineconeService {
  /**
   * Store embeddings for document chunks
   */
  static async storeEmbeddings(
    chunks: DocumentChunk[],
    embeddings: number[][],
    namespace?: string
  ): Promise<{ success: boolean; vectorsStored?: number; error?: string }> {
    try {
      if (chunks.length !== embeddings.length) {
        throw new Error('Chunks and embeddings arrays must have the same length');
      }

      // Prepare vectors for Pinecone
      const vectors = chunks.map((chunk, i) => ({
        id: chunk.id,
        values: embeddings[i],
        metadata: {
          text: chunk.text,
          ...chunk.metadata,
        },
      }));

      // Upsert to Pinecone
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
      console.error('Error storing embeddings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Search for similar documents
   */
  static async searchSimilar(
    queryEmbedding: number[],
    topK: number = 5,
    namespace?: string
  ): Promise<{ success: boolean; results?: SearchResult[]; error?: string }> {
    try {
      // Search in Pinecone
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
      const results: SearchResult[] = searchResponse.matches.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: {
          text: String(match.metadata?.text || ''),
          filename: String(match.metadata?.filename || ''),
          user_id: String(match.metadata?.user_id || ''),
          chunk_id: String(match.metadata?.chunk_id || ''),
          ...match.metadata,
        },
      }));

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error searching embeddings:', error);
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

export default PineconeService; 