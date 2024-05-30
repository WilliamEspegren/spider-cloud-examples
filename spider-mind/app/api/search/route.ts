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
            fetch_page_content: false
        }

        const search_results = await spider.search(search_query, params)
        console.log(search_results)
        // Handle the search query, perform operations, etc.

        // Send a JSON response
        return NextResponse.json({ message: 'Search successful', search_results: search_results });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
