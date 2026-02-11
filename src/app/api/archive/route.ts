
import { NextResponse } from 'next/server';

interface StoredIdea {
    id: string;
    content: string;
    summary: string;
    category: string;
    source_query: string;
    created_at: string;
}

let ideaStore: StoredIdea[] = [];

export async function GET() {
    return NextResponse.json({ ideas: ideaStore });
}

export async function POST(req: Request) {
    try {
        const { content, source = 'manual' } = await req.json();
        
        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const summary = content.split('\n')[0].replace(/^\*\*|\*\*$/g, '').trim();
        
        const newIdea: StoredIdea = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            content,
            summary: summary.slice(0, 100) + (summary.length > 100 ? '...' : ''),
            category: 'USER',
            source_query: source,
            created_at: new Date().toISOString()
        };

        ideaStore.unshift(newIdea);

        return NextResponse.json({ idea: newIdea });
    } catch (error: any) {
        console.error('ARCHIVE POST ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
