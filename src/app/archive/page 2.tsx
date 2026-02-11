
'use client'

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { ChevronLeft, Database, Search, Calendar, Tag, ArrowRight } from "lucide-react"
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Idea {
    id: string;
    content: string;
    summary: string;
    category: string;
    created_at: string;
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
        .replace(/\n- /g, '\n• ')
}

export default function ArchivePage() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                const res = await fetch('/api/archive')
                const data = await res.json()
                setIdeas(data.ideas || [])
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchArchive()
    }, [])

    return (
        <div className="min-h-screen premium-gradient p-6 sm:p-12 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sapphire/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Назад в Кузницу</span>
                </Link>

                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">АРХИВ СМЫСЛОВ</h1>
                        <p className="text-white/40 mt-2 font-medium">Ваша база интеллектуального капитала</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="text-[10px] text-sapphire uppercase font-black tracking-[0.2em] mb-1">Статус хранилища</div>
                        <div className="flex items-center gap-2 text-white/80 font-bold">
                            <Database className="size-4 text-sapphire" />
                            {ideas.length} {ideas.length === 1 ? 'идея' : ideas.length >= 2 && ideas.length <= 4 ? 'идеи' : 'идей'}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-8 border-2 border-sapphire/20 border-t-sapphire rounded-full animate-spin" />
                    </div>
                ) : ideas.length > 0 ? (
                    <div className="space-y-6">
                        {ideas.map((idea, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={idea.id}
                                className="glass-morphism p-8 rounded-[32px] group hover:border-white/10 transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-4 mb-6">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-sapphire/10 border border-sapphire/20 rounded-full">
                                                <Tag className="size-3 text-sapphire" />
                                                <span className="text-[10px] text-sapphire uppercase font-black tracking-widest">{idea.category}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/20">
                                                <Calendar className="size-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(idea.created_at).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-bold text-white mb-4 group-hover:text-sapphire transition-colors">
                                            {stripMarkdown(idea.summary)}
                                        </h2>

                                        <div className="markdown-content text-white/60 line-clamp-3 overflow-hidden mask-fade-bottom">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {formatMarkdown(idea.content)}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Link 
                                            href={`/archive/${idea.id}`}
                                            className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-sapphire group-hover:border-sapphire transition-all group-hover:scale-110 active:scale-95"
                                        >
                                            <ArrowRight className="size-5 text-white/20 group-hover:text-white transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-morphism p-20 rounded-[40px] text-center">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="size-10 text-white/10" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Архив пуст</h3>
                        <p className="text-white/40 text-sm max-w-xs mx-auto">Запустите разведку, чтобы наполнить ваше хранилище первыми идеями.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
