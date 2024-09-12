// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => {
        console.error('Error fetching messages:', err)
        setError('Failed to load messages')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, newMessage])
        setNewMessage('')
        setError(null)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleClearScreen = async () => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to clear screen')
      }

      const data = await res.json()
      if (data.success && data.action === 'clear') {
        setMessages([])
        setError(null)
      } else {
        throw new Error('Failed to clear screen')
      }
    } catch (err) {
      console.error('Error clearing screen:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded text-black"
          placeholder="Type a message..."
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send Message
        </button>
      </form>
      <button
        onClick={handleClearScreen}
        className="mb-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Screen
      </button>
      <div>
        <h2 className="text-xl font-semibold mb-2">Previous Messages:</h2>
        <ul className="space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="bg-slate-500 p-2 rounded shadow">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
