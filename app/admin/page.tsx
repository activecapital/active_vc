"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      loadConversation()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      sessionStorage.setItem("admin_authenticated", "true")
      setIsAuthenticated(true)
      loadConversation()
    } else {
      alert("Invalid password")
    }
  }

  const loadConversation = async () => {
    const response = await fetch("/api/admin/conversation")
    if (response.ok) {
      const data = await response.json()
      setMessages(data.messages || [])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim(), history: messages }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      setMessages((prev) => [...prev, data.message])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Error: Failed to process message",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!confirm("Publish staging changes to production?")) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to publish")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `✓ ${data.message}`,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Error: Failed to publish to production",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Active VC Admin</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish to Production
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_authenticated")
                setIsAuthenticated(false)
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-white text-black"
                      : message.role === "system"
                        ? "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        : "bg-zinc-900 text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-50 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 text-white rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to update the website..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
