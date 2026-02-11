
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Brain, Rocket, ChevronRight, Loader2, Search, Target, Database, AlertCircle, FlaskConical } from "lucide-react"
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils"

export default function Home() {
  const [isScouting, setIsScouting] = useState(false)
  const [scoutResult, setScoutResult] = useState<string | null>(null)

  const [isAlchemizing, setIsAlchemizing] = useState(false)
  const [alchemyResult, setAlchemyResult] = useState<string | null>(null)

  const [manualInput, setManualInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleScout = async () => {
    setIsScouting(true)
    setScoutResult(null)
    setAlchemyResult(null)
    setError(null)
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        body: JSON.stringify({ query: "Найди 3 самых интересных стартапа за последние 48 часов в сфере AI на русском языке." })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScoutResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsScouting(false)
    }
  }

  const handleAlchemy = async () => {
    setIsAlchemizing(true)
    setAlchemyResult(null)
    setScoutResult(null)
    setError(null)
    try {
      const res = await fetch('/api/alchemy', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAlchemyResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAlchemizing(false)
    }
  }

  const handleSaveManual = async () => {
    if (!manualInput.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: manualInput, source: 'user_manual' })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setManualInput('')
      setScoutResult(`### ✅ Идея сохранена в Кузню\n\n${manualInput}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen premium-gradient flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sapphire/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center mb-12"
      >
        <div className="size-16 glass-morphism rounded-2xl flex items-center justify-center mb-6 neon-glow">
          <Brain className="size-10 text-neon-purple" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter text-center uppercase">
          MINDFORGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sapphire to-neon-purple font-black">PREMIUM</span>
        </h1>
        <p className="mt-4 text-white/50 text-lg font-medium tracking-wide">
          Лаборатория Интеллектуальных Стратегий
        </p>
      </motion.header>

      <div className="z-10 w-full max-w-4xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleScout}
            disabled={isScouting || isAlchemizing}
            className="glass-morphism p-6 rounded-3xl group hover:border-sapphire/50 transition-all flex flex-col items-center gap-4 active:scale-95 disabled:opacity-50"
          >
            <div className="size-12 bg-sapphire/10 rounded-xl flex items-center justify-center group-hover:bg-sapphire/20">
              {isScouting ? <Loader2 className="size-6 text-sapphire animate-spin" /> : <Search className="size-6 text-sapphire" />}
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold">Запустить Разведку</h3>
              <p className="text-white/30 text-xs mt-1">Поиск сигналов в сети</p>
            </div>
          </button>

          <Link
            href="/archive"
            className="glass-morphism p-6 rounded-3xl group hover:border-sapphire/50 transition-all flex flex-col items-center gap-4 active:scale-95"
          >
            <div className="size-12 bg-sapphire/10 rounded-xl flex items-center justify-center group-hover:bg-sapphire/20">
              <Database className="size-6 text-sapphire" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold">Архив Смыслов</h3>
              <p className="text-white/30 text-xs mt-1">Ваша база идей</p>
            </div>
          </Link>

          <button
            onClick={handleAlchemy}
            disabled={isScouting || isAlchemizing}
            className="glass-morphism p-6 rounded-3xl group hover:border-neon-purple/50 transition-all flex flex-col items-center gap-4 active:scale-95 disabled:opacity-50"
          >
            <div className="size-12 bg-neon-purple/10 rounded-xl flex items-center justify-center group-hover:bg-neon-purple/20">
              {isAlchemizing ? <Loader2 className="size-6 text-neon-purple animate-spin" /> : <FlaskConical className="size-6 text-neon-purple" />}
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold">Алхимия</h3>
              <p className="text-white/30 text-xs mt-1">Гибридизация идей</p>
            </div>
          </button>
        </div>

        <div className="glass-morphism p-6 rounded-3xl space-y-4">
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Введите вашу идею или новость для архива..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-sapphire/50 min-h-[120px] transition-all"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveManual}
              disabled={isSaving || !manualInput.trim()}
              className="px-6 py-3 bg-sapphire/80 hover:bg-sapphire text-white rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
              Отправить в Кузню
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium"
          >
            <AlertCircle className="size-5 shrink-0" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {(scoutResult || alchemyResult) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "glass-morphism p-8 rounded-3xl relative overflow-hidden",
                alchemyResult ? "border-neon-purple/20 bg-neon-purple/5" : "border-sapphire/20 bg-sapphire/5"
              )}
            >
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                {alchemyResult ? <FlaskConical className="size-4 text-neon-purple" /> : <Search className="size-4 text-sapphire" />}
                <span className={cn(
                  "text-[10px] uppercase font-black tracking-widest",
                  alchemyResult ? "text-neon-purple" : "text-sapphire"
                )}>
                  {alchemyResult ? "Процесс глубокого синтеза завершен" : "Отчет разведки MindForge завершен"}
                </span>
              </div>

              <div className="markdown-content prose prose-invert max-w-none text-white/80">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {scoutResult || alchemyResult || ""}
                </ReactMarkdown>
              </div>

              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none",
                alchemyResult ? "bg-neon-purple/20" : "bg-sapphire/10"
              )} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-16 text-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-6 z-10">
        <span>© 2026 Erik03132</span>
        <div className="size-1 rounded-full bg-white/10" />
        <span>Powered by Antigravity Matrix Engine</span>
      </footer>
    </div>
  )
}
