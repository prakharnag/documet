const { Pinecone } = require('@pinecone-database/pinecone');

async function createIndex() {
  // Initialize a Pinecone client with your API key
  const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY || 'pcsk_6CNxYw_Fjk9E1n3uVRDyNifryUxAp2NwqNWA71KYgmsoq84VnMJye8B4ReQWLvhw6ajuew'
  });

  const indexName = 'documents';

  try {
    console.log('Checking existing indexes...');
    const indexes = await pc.listIndexes();
    console.log('Existing indexes:', indexes);

    const indexExists = indexes.some(index => index.name === indexName);
    
    if (indexExists) {
      console.log(`Index '${indexName}' already exists!`);
      return;
    }

    console.log(`Creating index '${indexName}'...`);
    // Create a dense index with integrated embedding
    await pc.createIndexForModel({
      name: indexName,
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: 'chunk_text' },
      },
      waitUntilReady: true,
    });

    console.log(`Index '${indexName}' created successfully!`);
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

createIndex(); 