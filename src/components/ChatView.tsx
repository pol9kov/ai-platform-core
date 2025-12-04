'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { getCurrentSpaceId, getCurrentSpace } from '@/lib/spaces'
import { events } from '@/lib/events'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(getCurrentSpaceId())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = events.on<{ id: string | null }>('space:selected', ({ id }) => {
      setSpaceId(id)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!spaceId) return
      try {
        const res = await fetch(`/api/chat?spaceId=${spaceId}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    if (spaceId) {
      loadMessages()
    } else {
      setMessages([])
    }
  }, [spaceId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || !spaceId || loading) return

    const userContent = input.trim()
    setInput('')
    setLoading(true)

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userContent,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const space = getCurrentSpace()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, content: userContent, plugins: space?.plugins }),
      })

      if (res.ok) {
        const { userMessage, assistantMessage } = await res.json()
        // Replace temp message with real ones
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          userMessage,
          assistantMessage,
        ])
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
        const error = await res.json()
        console.error('Chat error:', error)
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!spaceId) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Select a space to start chatting
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-8">
            Start a conversation
          </div>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
