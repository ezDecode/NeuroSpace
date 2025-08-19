"use client";

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';

export default function ChatPage() {
	const { messages, loading, error, sendMessage } = useChat();
	const [input, setInput] = useState("");

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
		<div className="flex flex-col h-full gap-4">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
				<p className="text-gray-600 mt-2">Ask questions about your knowledge base</p>
			</div>
			<div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-4">
				{messages.length === 0 && (
					<div className="text-gray-500 text-center">Start by asking a question…</div>
				)}
				{messages.map(m => (
					<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
						<div className={`max-w-xl px-4 py-2 rounded-2xl shadow ${m.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
							{m.content}
						</div>
					</div>
				))}
				{error && <div className="text-red-600 text-sm">{error}</div>}
			</div>
			<div className="flex items-center gap-2">
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder="Type your question and press Enter…"
					className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
				/>
				<Button onClick={handleSend} disabled={loading}>
					{loading ? 'Thinking…' : 'Send'}
				</Button>
			</div>
		</div>
	);
}