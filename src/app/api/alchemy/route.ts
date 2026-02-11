
import { NextResponse } from 'next/server';

interface StoredIdea {
    id: string;
    content: string;
    summary: string;
    category: string;
    created_at: string;
    vertical?: string;
    core_tech?: string;
    target_audience?: string;
    business_model?: string;
    pain_point?: string;
    temporal_marker?: string;
}

let ideaStore: StoredIdea[] = [];

interface SynergyCandidate {
    id: string;
    vertical: string;
    core_tech: string;
    target_audience: string;
    business_model: string;
    pain_point: string;
    temporal_marker: string;
    content: string;
    summary: string;
}

interface SynergyResult {
    status: 'synergy_found' | 'no_synergy';
    components?: [string, string];
    logic_chain?: string;
    hypothesis?: string;
    confidence_score?: number;
    tags?: string[];
    reason?: string;
    recommendation?: string;
}

const ADJACENT_VERTICALS: Record<string, string[]> = {
    'HealthTech': ['PetTech', 'FitnessTech', 'EdTech', 'Wellness'],
    'PetTech': ['HealthTech', 'FitnessTech', 'E-commerce'],
    'EdTech': ['HealthTech', 'MarTech', 'HRTech'],
    'FinTech': ['PropTech', 'InsurTech', 'MarTech'],
    'PropTech': ['FinTech', 'Marketplace'],
    'MarTech': ['EdTech', 'FinTech', 'HRTech'],
    'AI-infrastructure': ['MarTech', 'DevTools', 'Productivity'],
    'DevTools': ['AI-infrastructure', 'Productivity'],
    'Productivity': ['HRTech', 'DevTools', 'AI-infrastructure'],
    'HRTech': ['MarTech', 'Productivity', 'EdTech'],
    'E-commerce': ['PetTech', 'PropTech', 'MarTech'],
    'FitnessTech': ['HealthTech', 'PetTech', 'Wellness'],
    'Wellness': ['HealthTech', 'FitnessTech', 'EdTech'],
    'Marketplace': ['E-commerce', 'PropTech'],
    'FoodTech': ['E-commerce', 'HealthTech', 'Marketplace']
};

const COMPATIBLE_MODELS: Record<string, string[]> = {
    'SaaS': ['API', 'Integration', 'Freemium'],
    'Marketplace': ['Commission', 'Subscription', 'SaaS'],
    'API': ['SaaS', 'Enterprise', 'Subscription'],
    'Subscription': ['SaaS', 'Marketplace', 'Freemium'],
    'Freemium': ['SaaS', 'Subscription'],
    'Commission': ['Marketplace'],
    'Enterprise': ['API', 'Custom']
};

const TRENDING_2026 = ['agents', 'multimodality', 'edge_AI', 'no-code', 'automation'];

export async function POST() {
    try {
        const ideas = ideaStore;

        const structuredIdeas = ideas.filter(i => i.vertical && i.core_tech && i.target_audience && i.business_model && i.pain_point);
        
        if (structuredIdeas.length < 2) {
            return NextResponse.json({
                status: 'no_synergy',
                reason: 'insufficient_structured_data',
                recommendation: `Нужно минимум 2 идеи со структурированными полями. Сейчас: ${structuredIdeas.length}`,
                ideas_count: structuredIdeas.length
            }, { status: 400 });
        }

        let bestSynergy: SynergyResult | null = null;
        let bestScore = 0;

        for (let i = 0; i < structuredIdeas.length; i++) {
            for (let j = i + 1; j < structuredIdeas.length; j++) {
                const synergy = checkSynergy(structuredIdeas[i], structuredIdeas[j]);
                
                if (synergy.status === 'synergy_found' && synergy.confidence_score && synergy.confidence_score > bestScore) {
                    bestScore = synergy.confidence_score;
                    bestSynergy = synergy;
                }
            }
        }

        if (!bestSynergy) {
            return NextResponse.json({
                status: 'no_synergy',
                reason: 'no_valid_synergy',
                recommendation: 'Идеи валидны, но не образуют синергии.',
                candidates_checked: structuredIdeas.length
            }, { status: 400 });
        }

        return NextResponse.json(bestSynergy);

    } catch (error: any) {
        console.error('ALCHEMY ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function checkSynergy(a: StoredIdea, b: StoredIdea): SynergyResult {
    const ideaA: SynergyCandidate = {
        id: a.id || '',
        vertical: a.vertical || '',
        core_tech: a.core_tech || '',
        target_audience: a.target_audience || '',
        business_model: a.business_model || '',
        pain_point: a.pain_point || '',
        temporal_marker: a.temporal_marker || '',
        content: a.content,
        summary: a.summary
    };

    const ideaB: SynergyCandidate = {
        id: b.id || '',
        vertical: b.vertical || '',
        core_tech: b.core_tech || '',
        target_audience: b.target_audience || '',
        business_model: b.business_model || '',
        pain_point: b.pain_point || '',
        temporal_marker: b.temporal_marker || '',
        content: b.content,
        summary: b.summary
    };

    if (!ideaA.vertical || !ideaB.vertical) {
        return { status: 'no_synergy', reason: 'incomplete_data' };
    }

    const verticalsCompatible = 
        ideaA.vertical === ideaB.vertical ||
        (ADJACENT_VERTICALS[ideaA.vertical]?.includes(ideaB.vertical));

    if (!verticalsCompatible) {
        return { status: 'no_synergy', reason: 'verticals_incompatible' };
    }

    const techSynergy = calculateTechSynergy(ideaA.core_tech, ideaB.core_tech);
    const audienceOverlap = 
        ideaA.target_audience === ideaB.target_audience ||
        (ideaA.target_audience.includes('B2B') && ideaB.target_audience.includes('B2B'));
    
    const modelsCompatible = 
        ideaA.business_model === ideaB.business_model ||
        (COMPATIBLE_MODELS[ideaA.business_model]?.includes(ideaB.business_model));
    
    const painPointsRelated = arePainPointsRelated(ideaA.pain_point, ideaB.pain_point);

    if (hasAbsurdPattern(ideaA, ideaB)) {
        return { status: 'no_synergy', reason: 'absurd_pattern' };
    }

    let score = 0;
    const tags: string[] = [];

    if (techSynergy >= 3) { score += 3; tags.push('high_tech_synergy'); }
    else if (techSynergy >= 1) { score += 1; }

    if (audienceOverlap) { score += 2; tags.push('shared_audience'); }

    if (modelsCompatible) { score += 2; tags.push('compatible_models'); }

    const aTrending = isTrending(ideaA.temporal_marker);
    const bTrending = isTrending(ideaB.temporal_marker);
    if (aTrending && bTrending) { score += 3; tags.push('relevant_2026'); }
    else if (aTrending || bTrending) { score += 1; }

    if (isLowCodeFriendly(ideaA.core_tech) && isLowCodeFriendly(ideaB.core_tech)) {
        score += 1;
        tags.push('low_code_friendly');
    }

    if (isHealthAware(ideaA.vertical) || isHealthAware(ideaB.vertical)) {
        score += 1;
        tags.push('health_aware');
    }

    if (score < 12) {
        return { status: 'no_synergy', reason: 'score_below_threshold' };
    }

    const logicChain = `${ideaA.vertical} (${ideaA.core_tech}) + ${ideaB.vertical} (${ideaB.core_tech}) = ${ideaA.pain_point} + ${ideaB.pain_point}`;
    const hypothesis = `${ideaA.vertical} платформа с ${ideaA.core_tech} для сегмента ${ideaA.target_audience}`;

    return {
        status: 'synergy_found',
        components: [ideaA.id, ideaB.id],
        logic_chain: logicChain,
        hypothesis: hypothesis,
        confidence_score: Math.min(score * 7, 100),
        tags: tags
    };
}

function calculateTechSynergy(techA: string, techB: string): number {
    const a = techA.toLowerCase();
    const b = techB.toLowerCase();
    
    if ((a.includes('llm') && (b.includes('vision') || b.includes('image'))) ||
        (b.includes('llm') && (a.includes('vision') || a.includes('image')))) return 3;
    
    if ((a.includes('api') && b.includes('saas')) || (b.includes('api') && a.includes('saas'))) return 2;
    
    if (a.includes('iot') && (b.includes('cloud') || b.includes('data'))) return 2;
    
    if ((a.includes('rag') && b.includes('llm')) || (b.includes('rag') && a.includes('llm'))) return 3;
    
    if ((a.includes('autom') && b.includes('api')) || (b.includes('autom') && a.includes('api'))) return 2;
    
    if (a === b) return 1;
    
    return 0;
}

function arePainPointsRelated(painA: string, painB: string): boolean {
    const relatedPairs = [
        ['efficiency', 'time_saving'],
        ['cost_reduction', 'efficiency'],
        ['accessibility', 'time_saving'],
        ['security', 'quality']
    ];
    
    return relatedPairs.some(([a, b]) => 
        (painA === a && painB === b) || (painA === b && painB === a)
    );
}

function hasAbsurdPattern(a: SynergyCandidate, b: SynergyCandidate): boolean {
    const verticalA = a.vertical.toLowerCase();
    const techA = a.core_tech.toLowerCase();
    
    if ((verticalA.includes('hardware') || verticalA.includes('physical')) && 
        !techA.includes('iot') &&
        b.core_tech.toLowerCase().includes('software') &&
        !b.core_tech.toLowerCase().includes('iot')) {
        return true;
    }
    
    if ((a.pain_point === 'privacy' || a.pain_point === 'security') && 
        b.business_model.toLowerCase().includes('harvesting')) {
        return true;
    }
    
    return false;
}

function isTrending(marker: string): boolean {
    return TRENDING_2026.some(t => marker?.toLowerCase().includes(t));
}

function isLowCodeFriendly(tech: string): boolean {
    const t = tech.toLowerCase();
    return t.includes('api') || t.includes('automation') || t.includes('saas');
}

function isHealthAware(vertical: string): boolean {
    const v = vertical.toLowerCase();
    return v.includes('health') || v.includes('wellness') || v.includes('fitness') || v.includes('pet');
}
