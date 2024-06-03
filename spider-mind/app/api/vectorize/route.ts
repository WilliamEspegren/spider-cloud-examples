import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pinecone = new Pinecone();
const indexName = 'spider-mind';

async function initializePinecone() {
    // List existing indexes
    const existingIndexes = await pinecone.listIndexes();
    console.log('Existing indexes:', existingIndexes);

    // Check if the index exists
    const indexExists = existingIndexes.indexes?.some(index => index.name === indexName);

    if (!indexExists) {
        // Create the index if it does not exist
        console.log(`Index ${indexName} does not exist. Creating it.`);
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536,
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                },
            },
            waitUntilReady: true,
        });
    } else {
        console.log(`Index ${indexName} already exists.`);
    }

    return pinecone.index(indexName);
}

// Initialize Pinecone index once at startup
let pineconeIndexPromise = initializePinecone();

// Define the POST method handler
export async function POST(request: Request) {
    try {
        const { content, sessionId } = await request.json();
        if (!content || !sessionId) {
            throw new Error('Content and sessionId are required');
        }

        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: content,
        });

        // Wait for Pinecone index to be initialized
        const index = await pineconeIndexPromise;

        // Upsert the embedding into the Pinecone index within the specified session (namespace)
        await index.namespace(sessionId).upsert([
            {
                id: new Date().getTime().toString(), 
                values: embedding,
                metadata: { content } // Store the original content as metadata
            }
        ]);

        // Send a JSON response
        return NextResponse.json({ message: 'Vectorization successful', embedding: embedding });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Define the GET method handler to query the vectors in the current session
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const sessionId = searchParams.get('sessionId');

        if (!query || !sessionId) {
            // Send a JSON response
            return NextResponse.json({ error: 'Session ID and query are required' }, { status: 400 });
        }

        // Generate embedding for the query
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: query,
        });

        // Wait for Pinecone index to be initialized
        const index = await pineconeIndexPromise;

        // Query the index within the specified session (namespace)
        const queryResult = await index.namespace(sessionId).query({
            topK: 5,
            vector: embedding,
            includeMetadata: true
        });
        console.log('Query results:', queryResult.matches);

        // Send a JSON response
        return NextResponse.json({ message: 'Query successful', queryData: queryResult.matches });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
