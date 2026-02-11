
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from "framer-motion"
import { ChevronLeft, Calendar, Tag, ArrowRight } from "lucide-react"
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Idea {
    id: string
    content: string
    summary: string
    category: string
    source_query: string
    created_at: string
}

function stripMarkdown(text: string): string {
    return text
        .replace(/##\s*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`/g, '')
        .trim()
}

function formatMarkdown(text: string): string {
    return text
        .replace(/##\s*/g, '\n\n### ')
        .replace(/\*\*(.*?)\*\*/g, '$1')
}

export default function IdeaPage() {
    const params = useParams()
    const [idea, setIdea] = useState<Idea | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const res = await fetch('/api/archive')
                const data = await res.json()
                const found = (data.ideas || []).find((i: Idea) => i.id === params.id)
                if (found) setIdea(found)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) fetchIdea()
    }, [params.id])

    if (isLoading) {
        return (
            <div className="min-h-screen premium-gradient flex items-center justify-center">
                <div className="size-8 border-2 border-sapphire/20 border-t-sapphire rounded-full animate-spin" />
            </div>
        )
    }

    if (!idea) {
        return (
            <div className="min-h-screen premium-gradient p-12 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-white text-xl font-bold mb-4">Идея не найдена</h1>
                    <Link href="/archive" className="text-sapphire hover:underline">
                        Вернуться в архив
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen premium-gradient p-6 sm:p-12 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sapphire/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/archive" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Назад в Архив</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism p-8 sm:p-12 rounded-[32px]"
                >
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-sapphire/10 border border-sapphire/20 rounded-full">
                            <Tag className="size-3.5 text-sapphire" />
                            <span className="text-xs text-sapphire uppercase font-black tracking-widest">{idea.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/30">
                            <Calendar className="size-3.5" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {new Date(idea.created_at).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8">
                        {stripMarkdown(idea.summary)}
                    </h1>

                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatMarkdown(idea.content)}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="text-white/30 text-sm">
                            Источник: {idea.source_query}
                        </div>
                        <Link 
                            href="/archive"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-sapphire/20 hover:bg-sapphire text-sapphire hover:text-white rounded-xl font-bold transition-all"
                        >
                            Все идеи
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
