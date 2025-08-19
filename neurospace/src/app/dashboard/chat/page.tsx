"use client";

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

type Reference = { file_name: string; score?: number };

function TypingDots() {
	return (
		<div className="flex gap-1 items-center">
			<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
			<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
			<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
		</div>
	);
}

function ReferenceChips({ refs }: { refs: Reference[] }) {
	if (!refs?.length) return null;
	return (
		<div className="mt-2 flex flex-wrap gap-2">
			{refs.map((r, idx) => (
				<span key={`${r.file_name}-${idx}`} className="text-xs px-2 py-1 rounded-full bg-white/70 text-gray-800 border border-gray-200 backdrop-blur">
					📄 {r.file_name}
				</span>
			))}
		</div>
	);
}

export default function ChatPage() {
	const { messages, loading, error, sendMessage } = useChat();
	const [input, setInput] = useState("");
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	async function handleSend() {
		if (!input.trim()) return;
		await sendMessage(input.trim());
		setInput("");
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
			<div>
				<h1 className="text-2xl font-bold text-white">AI Chat</h1>
				<p className="text-slate-300 mt-2">Ask questions about your knowledge base</p>
			</div>
			<div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4 backdrop-blur">
				{messages.length === 0 && (
					<div className="text-slate-300 text-center">Start by asking a question…</div>
				)}
				<AnimatePresence initial={false}>
					{messages.map(m => (
						<motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div className={`max-w-xl px-4 py-3 rounded-2xl shadow-lg ${m.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white text-gray-900'}`}>
								{m.content}
								{(m as unknown as { references?: Reference[] }).references && <ReferenceChips refs={(m as unknown as { references: Reference[] }).references} />}
							</div>
						</motion.div>
					))}
				</AnimatePresence>
				{loading && (
					<div className="flex justify-start"><div className="bg-white px-4 py-3 rounded-2xl shadow"><TypingDots /></div></div>
				)}
				{error && <div className="text-red-400 text-sm">{error}</div>}
				<div ref={bottomRef} />
			</div>
			<div className="flex items-center gap-2">
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder="Type your question and press Enter…"
					className="flex-1 border border-white/10 bg-white/10 text-white placeholder:text-slate-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
				/>
				<Button onClick={handleSend} disabled={loading}>
					{loading ? 'Thinking…' : 'Send'}
				</Button>
			</div>
		</div>
	);
}