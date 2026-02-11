
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

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        
        if (!perplexityKey) {
            return NextResponse.json({ error: 'PERPLEXITY_API_KEY не настроен' }, { status: 500 });
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${perplexityKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: `Ты — Разведчик MindForge. Находишь практичные идеи микробизнеса.

ФОРМАТ для КАЖДОЙ идеи (3 штуки):

**НАЗВАНИЕ ПРОЕКТА** (крупно, без скобок)
**Смысл:** Что это и как работает (2-3 предложения)
**Проблема:** Конкретная боль рынка (жирным)
**Возможность:** Почему стоит заняться этим сейчас

Верни 3 такие идеи. На русском.`
                    },
                    {
                        role: 'user',
                        content: query || "Найди 3 свежих микро-стартапа за 48 часов с бюджетом до $100,000"
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`Perplexity API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const firstLine = content.split('\n').find(l => l.trim().length > 3 && !l.toLowerCase().includes('смысл') && !l.toLowerCase().includes('проблема') && !l.toLowerCase().includes('возможность')) || content.split('\n')[0];
        
        const newIdea: StoredIdea = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            content: content,
            summary: firstLine.replace(/^\*\*|\*\*$/g, '').trim(),
            category: 'SCOUT',
            source_query: query || 'Strategic Pulse',
            created_at: new Date().toISOString()
        };

        ideaStore.unshift(newIdea);

        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                await supabase.from('strategic_ideas').insert([{
                    content: content,
                    summary: newIdea.summary,
                    category: 'SCOUT',
                    source_query: query || 'Strategic Pulse'
                }]);
            }
        } catch (e) {
            console.log('Supabase save skipped');
        }

        return NextResponse.json({ result: content });
    } catch (error: any) {
        console.error('SCOUT ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
