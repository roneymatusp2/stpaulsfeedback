import React, { useRef, useState } from 'react'
import { adminAiService, type AdminAIMessage } from '@/lib/adminAiService'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'

const AdminAIChat: React.FC = () => {
  const [messages, setMessages] = useState<AdminAIMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const userMsg: AdminAIMessage = { id: String(Date.now()), role: 'user', content: text, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setBusy(true)
    try {
      const reply = await adminAiService.process(text)
      const aiMsg: AdminAIMessage = { id: userMsg.id + '-r', role: 'assistant', content: reply, ts: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: userMsg.id + '-e', role: 'assistant', ts: new Date(), content: `Sorry, I could not complete that: ${err?.message || 'unknown error'}.` }])
    } finally {
      setBusy(false)
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`max-w-3xl ${m.role === 'user' ? 'ml-auto text-right' : ''}`}>
            <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border text-card-foreground'}`}>{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3 flex gap-2 bg-background/60">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type a command…"
        />
        <Button onClick={send} disabled={busy} className="px-3">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default AdminAIChat


