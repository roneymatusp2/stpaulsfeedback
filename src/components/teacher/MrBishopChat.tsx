import React, { useRef, useState } from 'react'
import { teacherAssistantService } from '@/lib/teacherAssistantService'
import { Button } from '@/components/ui/button'
import { Loader2, Mic, MicOff, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type Msg = { id: string; role: 'user' | 'assistant'; text: string }

const MrBishopChat: React.FC = () => {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<BlobPart[]>([])

  const stopRecording = async () => {
    mediaRecorder.current?.stop()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      chunks.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data) }
      mr.onstop = async () => {
        setRecording(false)
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const base64 = await blobToBase64(blob)
        setBusy(true)
        try {
          const text = await teacherAssistantService.transcribeAudio(base64)
          setInput(prev => prev ? prev + ' ' + text : text)
        } catch (e: any) {
          setMessages(m => [...m, { id: Date.now() + '-e', role: 'assistant', text: `Transcription failed: ${e?.message || 'unknown error'}` }])
        } finally {
          setBusy(false)
        }
      }
      mr.start()
      setRecording(true)
    } catch (e: any) {
      setMessages(m => [...m, { id: Date.now() + '-perm', role: 'assistant', text: `Microphone error: ${e?.message || 'permissions denied'}` }])
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const id = String(Date.now())
    setMessages(prev => [...prev, { id, role: 'user', text }])
    setInput('')
    setBusy(true)
    try {
      const plan = await teacherAssistantService.planAction(text, currentUser?.name)
      if (!plan) {
        setMessages(prev => [...prev, { id: id + '-r', role: 'assistant', text: 'Sorry, I could not determine the action.' }])
      } else if (plan.type === 'create_observation') {
        const res = await teacherAssistantService.createObservation(plan, currentUser?.id)
        setMessages(prev => [...prev, { id: id + '-r', role: 'assistant', text: `Draft observation created for ${res.teacherName} on ${new Date(res.date).toLocaleDateString('en-GB')}.` }])
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { id: id + '-e', role: 'assistant', text: `Sorry, I could not complete that: ${e?.message || 'unknown error'}.` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`max-w-3xl ${m.role === 'user' ? 'ml-auto text-right' : ''}`}>
            <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border text-card-foreground'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="border-t p-3 flex gap-2 bg-background/60 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type a command… e.g. Create a lesson observation for Roney Nascimento."
        />
        <Button variant={recording ? 'destructive' : 'outline'} size="icon" onClick={recording ? stopRecording : startRecording} disabled={busy}>
          {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button onClick={send} disabled={busy} className="px-3">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default MrBishopChat

async function blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(b)
  })
}


