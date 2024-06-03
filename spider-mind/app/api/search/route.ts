import { NextResponse } from 'next/server';
import { Spider } from '@spider-cloud/spider-client';

const spider = new Spider()

// Define the POST method handler
export async function POST(request: Request) {
    try {
        const { search_query } = await request.json();
        const params = {
            limit: 1,
            return_format: 'markdown',
        }

        const search_results = await spider.search(search_query, params)
        // Handle the search query, perform operations, etc.
        for (let i = 0; i < search_results.length; i++) {
            const result = search_results[i];
            // Vectorize the content
            console.log(process.env.BASE_URL)
            const vector = await fetch(`${process.env.BASE_URL}/api/vectorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: result.content }),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error:', error));
        }

        // Send a JSON response
        return NextResponse.json({ message: 'Search successful', search_results: search_results });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
