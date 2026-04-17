"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { SiteContent, ApproachItem } from "@/lib/content"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
}

function createSession(): ChatSession {
  return { id: crypto.randomUUID(), name: "New Chat", messages: [] }
}

const SCROLLBAR =
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  // --- AI Chat state ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => [createSession()])
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.id ?? "")
  const [input, setInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Derive active session (fall back to first if id drifts)
  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0]
  const messages = activeSession?.messages ?? []

  // --- Visual Editor state ---
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [editorLoading, setEditorLoading] = useState(true)
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      loadContent()
    } else {
      setEditorLoading(false)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --- Session helpers ---
  const updateSessionMessages = (
    id: string,
    updater: (prev: Message[]) => Message[]
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, messages: updater(s.messages) } : s))
    )
  }

  const nameSessionFromMessage = (id: string, text: string) => {
    const name = text.trim().slice(0, 22) + (text.trim().length > 22 ? "…" : "")
    setSessions((prev) =>
      prev.map((s) => (s.id === id && s.name === "New Chat" ? { ...s, name } : s))
    )
  }

  const addSession = () => {
    const s = createSession()
    setSessions((prev) => [...prev, s])
    setActiveId(s.id)
    setInput("")
  }

  const closeSession = (id: string) => {
    setSessions((prev) => {
      if (prev.length === 1) return prev // keep at least one
      const next = prev.filter((s) => s.id !== id)
      if (id === activeId) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  // --- Auth ---
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
      loadContent()
    } else {
      alert("Invalid password")
    }
  }

  // --- AI Chat ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || chatLoading) return

    const text = input.trim()
    const sessionId = activeId

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }

    updateSessionMessages(sessionId, (prev) => [...prev, userMessage])
    nameSessionFromMessage(sessionId, text)
    setInput("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      updateSessionMessages(sessionId, (prev) => [...prev, data.message])
    } catch {
      updateSessionMessages(sessionId, (prev) => [
        ...prev,
        {
          role: "system",
          content: "Error: Failed to process message",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!confirm("Publish staging changes to production?")) return

    const sessionId = activeId
    setChatLoading(true)
    try {
      const response = await fetch("/api/admin/publish", { method: "POST" })
      if (!response.ok) throw new Error("Failed to publish")
      const data = await response.json()
      updateSessionMessages(sessionId, (prev) => [
        ...prev,
        { role: "system", content: `✓ ${data.message}`, timestamp: new Date().toISOString() },
      ])
    } catch {
      updateSessionMessages(sessionId, (prev) => [
        ...prev,
        { role: "system", content: "Error: Failed to publish to production", timestamp: new Date().toISOString() },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // --- Visual Editor ---
  const loadContent = async () => {
    setEditorLoading(true)
    try {
      const response = await fetch("/api/admin/content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        setError("Failed to load content")
      }
    } catch {
      setError("Failed to load content")
    } finally {
      setEditorLoading(false)
    }
  }

  const saveField = useCallback(async (key: keyof SiteContent, value: any) => {
    setSaving((prev) => ({ ...prev, [key]: true }))
    setSaved((prev) => ({ ...prev, [key]: false }))
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      if (response.ok) {
        setSaved((prev) => ({ ...prev, [key]: true }))
        setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000)
      } else {
        setError(`Failed to save ${key}`)
      }
    } catch {
      setError(`Failed to save ${key}`)
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }, [])

  const updateField = (key: keyof SiteContent, value: any) => {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const moveApproachItem = (index: number, direction: "up" | "down") => {
    if (!content) return
    const items = [...content.approach_items]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    ;[items[index], items[targetIndex]] = [items[targetIndex], items[index]]
    updateField("approach_items", items)
  }

  const updateApproachItem = (index: number, field: keyof ApproachItem, value: string) => {
    if (!content) return
    const items = [...content.approach_items]
    items[index] = { ...items[index], [field]: value }
    updateField("approach_items", items)
  }

  const addApproachItem = () => {
    if (!content) return
    updateField("approach_items", [...content.approach_items, { label: "New Item", icon: "" }])
  }

  const removeApproachItem = (index: number) => {
    if (!content) return
    updateField("approach_items", content.approach_items.filter((_, i) => i !== index))
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    contactRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) execCommand("createLink", url)
  }

  // --- Login screen ---
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

  // --- Main layout ---
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Active VC Admin</h1>
          <div className="flex gap-3 items-center">
            <a
              href={
                typeof window !== "undefined" && window.location.hostname === "localhost"
                  ? `${window.location.origin}`
                  : process.env.NEXT_PUBLIC_STAGING_URL || "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-yellow-400 border border-yellow-400/30 rounded-lg text-sm font-medium hover:bg-yellow-400/10 transition-colors"
            >
              Preview Staging ↗
            </a>
            <button
              onClick={handlePublish}
              disabled={chatLoading}
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

      {/* Body: Editor (3/4) + Chat (1/4) */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Visual Editor (left, 3/4) ── */}
        <div className={`w-3/4 overflow-y-auto border-r border-zinc-800 ${SCROLLBAR}`}>
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-base font-semibold text-white">Visual Editor</h2>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
            </div>
          )}

          {editorLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400">Loading content...</div>
          ) : !content ? (
            <div className="flex items-center justify-center h-64 text-red-400">{error || "Failed to load content"}</div>
          ) : (
            <div className="px-6 py-6 space-y-8">
              <Section title="Hero Title" description="Main heading displayed on the homepage hero section." saving={saving.hero_title} saved={saved.hero_title} onSave={() => saveField("hero_title", content.hero_title)}>
                <input type="text" value={content.hero_title} onChange={(e) => updateField("hero_title", e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-lg" />
              </Section>

              <Section title="Hero Subtitle" description="Subtitle displayed below the main heading." saving={saving.hero_subtitle} saved={saved.hero_subtitle} onSave={() => saveField("hero_subtitle", content.hero_subtitle)}>
                <input type="text" value={content.hero_subtitle} onChange={(e) => updateField("hero_subtitle", e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600" />
              </Section>

              <Section title="About Pat" description="Personal message from Pat Matthews shown at the top of the page." saving={saving.about_pat} saved={saved.about_pat} onSave={() => saveField("about_pat", content.about_pat)}>
                <textarea value={content.about_pat} onChange={(e) => updateField("about_pat", e.target.value)} rows={6} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-y" />
              </Section>

              <Section title="About Active Capital" description="Description of Active Capital shown in the About section." saving={saving.about_active_capital} saved={saved.about_active_capital} onSave={() => saveField("about_active_capital", content.about_active_capital)}>
                <textarea value={content.about_active_capital} onChange={(e) => updateField("about_active_capital", e.target.value)} rows={6} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-y" />
              </Section>

              <Section title="Approach" description="Items displayed in the How We Invest grid. Use arrows to reorder." saving={saving.approach_items} saved={saved.approach_items} onSave={() => saveField("approach_items", content.approach_items)}>
                <div className="space-y-2">
                  {content.approach_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveApproachItem(index, "up")} disabled={index === 0} className="text-zinc-500 hover:text-white disabled:opacity-20 text-xs leading-none">▲</button>
                        <button onClick={() => moveApproachItem(index, "down")} disabled={index === content.approach_items.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-20 text-xs leading-none">▼</button>
                      </div>
                      <input type="text" value={item.label} onChange={(e) => updateApproachItem(index, "label", e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-zinc-500" />
                      <input type="text" value={item.icon} onChange={(e) => updateApproachItem(index, "icon", e.target.value)} placeholder="Icon path (e.g. /img/icons/...)" className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-zinc-500" />
                      <button onClick={() => removeApproachItem(index)} className="text-zinc-500 hover:text-red-400 px-2 py-1 text-sm">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={addApproachItem} className="mt-3 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">+ Add Item</button>
              </Section>

              <Section title="Contact Us" description="Rich text content for the Contact Us section." saving={saving.contact_html} saved={saved.contact_html} onSave={() => { const html = contactRef.current?.innerHTML || content.contact_html; updateField("contact_html", html); saveField("contact_html", html) }}>
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-t-lg">
                  <ToolbarButton label="B" onClick={() => execCommand("bold")} bold />
                  <ToolbarButton label="I" onClick={() => execCommand("italic")} italic />
                  <ToolbarButton label="U" onClick={() => execCommand("underline")} />
                  <div className="w-px bg-zinc-700 mx-1" />
                  <ToolbarButton label="H2" onClick={() => execCommand("formatBlock", "h2")} />
                  <ToolbarButton label="H3" onClick={() => execCommand("formatBlock", "h3")} />
                  <ToolbarButton label="P" onClick={() => execCommand("formatBlock", "p")} />
                  <div className="w-px bg-zinc-700 mx-1" />
                  <ToolbarButton label="Link" onClick={insertLink} />
                  <ToolbarButton label="Unlink" onClick={() => execCommand("unlink")} />
                  <div className="w-px bg-zinc-700 mx-1" />
                  <ToolbarButton label="UL" onClick={() => execCommand("insertUnorderedList")} />
                  <ToolbarButton label="OL" onClick={() => execCommand("insertOrderedList")} />
                </div>
                <div ref={contactRef} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: content.contact_html }}
                  className="w-full min-h-[150px] px-4 py-3 bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-lg text-white focus:outline-none focus:border-zinc-600 prose prose-invert max-w-none [&_a]:text-blue-400 [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1"
                />
                <div className="mt-2 text-xs text-zinc-500">Tip: Select text and use the toolbar buttons to format. Use the Link button to add hyperlinks.</div>
              </Section>
            </div>
          )}
        </div>

        {/* ── AI Chat (right, 1/4) ── */}
        <div className="w-1/4 flex flex-col">

          {/* Tab bar */}
          <div className={`flex items-center border-b border-zinc-800 bg-zinc-950 overflow-x-auto shrink-0 ${SCROLLBAR} [&::-webkit-scrollbar]:h-0`}>
            {sessions.map((session) => {
              const isActive = session.id === activeId
              return (
                <div
                  key={session.id}
                  className={`group flex items-center gap-1.5 px-3 py-2.5 text-xs cursor-pointer whitespace-nowrap border-r border-zinc-800 shrink-0 transition-colors ${
                    isActive
                      ? "bg-black text-white border-b-2 border-b-white -mb-px"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                  onClick={() => setActiveId(session.id)}
                >
                  <span className="max-w-[100px] truncate">{session.name}</span>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeSession(session.id) }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
            <button
              onClick={addSession}
              className="px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors shrink-0 text-sm leading-none"
              title="New chat"
            >
              +
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto px-3 py-4 space-y-4 ${SCROLLBAR}`}>
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl px-3 py-2 text-sm bg-zinc-900 text-white">
                  How can I help you today?
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-white text-black"
                    : message.role === "system"
                      ? "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      : "bg-zinc-900 text-white"
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-50 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 text-white rounded-2xl px-3 py-2">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-3 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to update the site..."
                disabled={chatLoading}
                className="flex-1 min-w-0 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="px-3 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function Section({
  title, description, children, saving, saved, onSave,
}: {
  title: string
  description: string
  children: React.ReactNode
  saving?: boolean
  saved?: boolean
  onSave: () => void
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        </div>
        <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 ml-4">
          {saving ? (<><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving...</>) : saved ? "Saved!" : "Save"}
        </button>
      </div>
      {children}
    </div>
  )
}

function ToolbarButton({ label, onClick, bold, italic }: { label: string; onClick: () => void; bold?: boolean; italic?: boolean }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`px-2 py-1 text-xs rounded hover:bg-zinc-700 text-zinc-300 transition-colors ${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  )
}
