import { NextResponse } from 'next/server';
import { Spider } from '@spider-cloud/spider-client';
import { v4 as uuidv4 } from 'uuid';

const spider = new Spider();

// Define the POST method handler
export async function POST(request: Request) {
    try {
        const { search_query } = await request.json();
        if (!search_query) {
            return NextResponse.json({ error: 'search_query is required' }, { status: 400 });
        }

        const params = {
            limit: 1,
            return_format: 'markdown',
        };

        const search_results = await spider.search(search_query, params);
        // Handle the search query, perform operations, etc.
        const sessionId = generateSessionId(); // Generate a random sessionId
        const vectors = [];

        for (const result of search_results) {
            // Vectorize the content
            const vector = await fetch(`${process.env.BASE_URL}/api/vectorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId, content: result.content }), // Include sessionId in the body
            })
            .then((response) => response.json())
            .then((data) => ({ ...data, content: result.content }))
            .catch((error) => console.error('Error:', error));

            vectors.push(vector); // Store the vector in an array
        }

        // Query the vectors in the current session
        const query = search_query; // Use the search query as the query
        const queryResults = await fetch(`${process.env.BASE_URL}/api/vectorize?sessionId=${sessionId}&query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((response) => response.json())
        .then((data) => data.queryData)
        .catch((error) => console.error('Error:', error));

        // Send a JSON response
        return NextResponse.json({ message: 'Search successful', search_results: search_results, vectors: vectors, queryResults: queryResults });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function generateSessionId() {
    // Generate a random sessionId using a suitable algorithm
    // For example, you can use the uuid library to generate a UUID
    return uuidv4();
}
