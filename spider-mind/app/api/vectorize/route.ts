import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

// Define the POST method handler
export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: content,
        });

        // Send a JSON response
        return NextResponse.json({ message: 'Vectorization successful', embedding: embedding });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
