import 'dotenv/config';
import { EmbeddingService } from './embeddings';

async function testPineconeIntegration() {
  console.log('🧪 Testing Pinecone Integration...\n');

  // Check environment variables
  const requiredEnvVars = ['PINECONE_API_KEY', 'PINECONE_INDEX_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease set these variables in your .env.local file:');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('   Index name:', process.env.PINECONE_INDEX_NAME);
  console.log('   API key:', process.env.PINECONE_API_KEY?.substring(0, 8) + '...');

  try {
    // Test 1: Store embeddings
    console.log('\n1. Testing embedding storage...');
    const testChunks = [
      {
        id: 'test_chunk_1',
        text: 'This is a test document about artificial intelligence and machine learning.',
        metadata: {
          filename: 'test.pdf',
          user_id: 'test_user',
          chunk_id: 'test_chunk_1',
          document_id: 'test_doc_1',
          chunk_index: 0,
          total_chunks: 2,
        }
      },
      {
        id: 'test_chunk_2',
        text: 'Machine learning algorithms can process large amounts of data to find patterns and make predictions.',
        metadata: {
          filename: 'test.pdf',
          user_id: 'test_user',
          chunk_id: 'test_chunk_2',
          document_id: 'test_doc_1',
          chunk_index: 1,
          total_chunks: 2,
        }
      }
    ];

    const storeResult = await EmbeddingService.storeEmbeddingsWithText(testChunks, 'test_namespace');
    
    if (storeResult.success) {
      console.log('✅ Successfully stored embeddings:', storeResult.vectorsStored, 'vectors');
    } else {
      console.log('❌ Failed to store embeddings:', storeResult.error);
      return;
    }

    // Test 2: Search embeddings
    console.log('\n2. Testing search functionality...');
    const searchResult = await EmbeddingService.searchSimilarDocuments(
      'What is machine learning?',
      3,
      'test_namespace'
    );

    if (searchResult.success && searchResult.results) {
      console.log('✅ Search successful! Found', searchResult.results.length, 'results:');
      searchResult.results.forEach((result, index) => {
        console.log(`   ${index + 1}. Score: ${result.score.toFixed(3)}, Text: "${result.metadata.text.substring(0, 50)}..."`);
      });
    } else {
      console.log('❌ Search failed:', searchResult.error);
    }

    // Test 3: Get index stats
    console.log('\n3. Testing index statistics...');
    const statsResult = await EmbeddingService.getIndexStats('test_namespace');
    
    if (statsResult.success) {
      console.log('✅ Index stats retrieved successfully');
      console.log('   Total vectors:', statsResult.stats?.totalVectorCount || 'N/A');
    } else {
      console.log('❌ Failed to get index stats:', statsResult.error);
    }

    // Test 4: Get vector IDs by document
    console.log('\n4. Testing vector ID retrieval...');
    const vectorIdsResult = await EmbeddingService.getVectorIdsByDocument('test_doc_1', 'test_namespace');
    
    if (vectorIdsResult.success && vectorIdsResult.vectorIds) {
      console.log('✅ Found', vectorIdsResult.vectorIds.length, 'vectors for document test_doc_1');
    } else {
      console.log('❌ Failed to get vector IDs:', vectorIdsResult.error);
    }

    // Test 5: Clean up - delete test vectors
    console.log('\n5. Cleaning up test data...');
    const deleteResult = await EmbeddingService.deleteVectorsByDocument('test_doc_1', 'test_namespace');
    
    if (deleteResult.success) {
      console.log('✅ Successfully deleted', deleteResult.vectorsDeleted, 'test vectors');
    } else {
      console.log('❌ Failed to delete test vectors:', deleteResult.error);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPineconeIntegration();
}

export { testPineconeIntegration }; 