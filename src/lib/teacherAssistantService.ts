import { supabase, feedbackApi } from '@/lib/supabase'

export type TeacherAIAction =
  | { type: 'create_observation'; teacher_name: string; subject?: string; date?: string }

export class TeacherAssistantService {
  private apiKey: string | null = null
  private async invokeTeacherHelper(body: any): Promise<any> {
    let lastError: any
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('teacher-helper', { body })
        if (error) throw error
        return data
      } catch (e: any) {
        lastError = e
        await new Promise(r => setTimeout(r, attempt * 400))
      }
    }
    throw lastError || new Error('Edge Function unavailable')
  }

  private async ensureKey() {
    if (this.apiKey) return
    // Try primary secret name
    let { data, error } = await supabase.rpc('get_secret', { secret_name: 'OPENAI_CREATE' })
    if ((!data || typeof data !== 'string' || data.trim() === '') || error) {
      // Fallback to legacy key name used elsewhere in the project
      const fallback = await supabase.rpc('get_secret', { secret_name: 'OPENAI_FEEDBACK' })
      if ((!fallback.data || typeof fallback.data !== 'string' || fallback.data.trim() === '')) {
        throw new Error('Unable to load AI credentials')
      }
      this.apiKey = fallback.data
      return
    }
    this.apiKey = data
  }

  async transcribeAudio(base64: string): Promise<string> {
    await this.ensureKey()
    try {
      const data = await this.invokeTeacherHelper({ mode: 'transcribe', audio_base64: base64, api_key: this.apiKey })
      return data.text as string
    } catch {
      // Fallback: call OpenAI directly
      const comma = base64.indexOf(',')
      const raw = comma >= 0 ? base64.slice(comma + 1) : base64
      const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', new File([blob], 'audio.webm', { type: 'audio/webm' }))
      form.append('model', 'gpt-4o-mini-transcribe')
      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey!}` },
        body: form
      })
      if (!resp.ok) throw new Error('Transcription failed')
      const j = await resp.json()
      return j.text as string
    }
  }

  async planAction(prompt: string, currentUserName?: string): Promise<TeacherAIAction | null> {
    await this.ensureKey()
    // First, try a quick local parse to handle common variants instantly
    const local = this.localParseAction(prompt, currentUserName)
    if (local) return local

    const system = `You are Mr Bishop, a helpful school assistant. Reply with JSON only.
Schema: { "type": "create_observation", "teacher_name": string, "subject"?: string, "date"?: string }
Rules: Use British English. If the request is about a self assessment, set teacher_name to "${currentUserName || ''}".`
    try {
      const data = await this.invokeTeacherHelper({
        mode: 'chat',
        api_key: this.apiKey,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
      const content = data.choices?.[0]?.message?.content || 'null'
      const parsed = JSON.parse(content)
      if (!parsed) return null
      return parsed as TeacherAIAction
    } catch {
      // Fallback: call OpenAI directly
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey!}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ]
        })
      })
      const j = await r.json()
      const content = j?.choices?.[0]?.message?.content || 'null'
      try {
        return JSON.parse(content)
      } catch {
        return null
      }
    }
  }

  async createObservation(action: Extract<TeacherAIAction, { type: 'create_observation' }>, observerId?: string) {
    // Find teacher by name (case-insensitive)
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('id, name')
      .ilike('name', `%${action.teacher_name}%`)
      .limit(1)
    if (teachersError) throw teachersError
    let teacher = teachers?.[0]
    if (!teacher) {
      // Fallback: fuzzy match in client for common variants and partials
      const all = await supabase.from('teachers').select('id, name')
      const list = all.data || []
      const target = normalizeText(action.teacher_name)
      let best = { score: 0, t: null as any }
      for (const t of list) {
        const n = normalizeText(t.name || '')
        let score = 0
        // token overlap
        const tokens = target.split(' ').filter(Boolean)
        for (const tok of tokens) if (n.includes(tok)) score += 1
        if (n === target) score += 2
        if (score > best.score) best = { score, t }
      }
      teacher = best.t || null
    }
    if (!teacher) throw new Error(`Teacher not found: ${action.teacher_name}`)

    const observationDate = action.date ? new Date(action.date).toISOString() : new Date().toISOString()
    // Use Edge Function with service role to bypass RLS safely
    const { data, error: createError } = await supabase.functions.invoke('create-feedback', {
      body: {
        teacher_id: teacher.id,
        observer_id: observerId || null,
        observation_date: observationDate,
        status: 'draft',
        lesson_subject: action.subject || null,
        is_confidential: false,
        planning_preparation: {},
        teaching_delivery: {},
        student_engagement: {},
        classroom_management: {},
        assessment_feedback: {}
      }
    })
    if (createError) {
      // Fallback to RPC SECURITY DEFINER
      const rpc = await supabase.rpc('create_feedback_draft', {
        p_teacher_id: teacher.id,
        p_observer_id: observerId || null,
        p_observation_date: observationDate,
        p_status: 'draft',
        p_lesson_subject: action.subject || null,
        p_lesson_topic: null,
        p_class_year: null,
        p_is_confidential: false
      })
      if (rpc.error) throw new Error(rpc.error.message || 'Failed to create feedback')
    }
    return { teacherName: teacher.name, date: observationDate }
  }

  private localParseAction(raw: string, currentUserName?: string): TeacherAIAction | null {
    const text = (raw || '').toLowerCase().trim()
    if (!text) return null
    const isSelf = /(self\s*assessment|selfassessment|self-assessment|my\s+assessment|for\s+me|about\s+me)/.test(text)
    const forMatch = text.match(/(?:for|of|about)\s+([a-zÀ-ÿ.'\-\s]+)/i)
    const subjectMatch = text.match(/\b(?:in|of|for)\s+([a-zA-Z][a-zA-Z\s&-]{2,})\b/)
    const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|today|tomorrow)\b/i)
    let date: string | undefined
    if (dateMatch) {
      const d = dateMatch[0].toLowerCase()
      if (d === 'today') date = new Date().toISOString()
      else if (d === 'tomorrow') date = new Date(Date.now() + 86400000).toISOString()
      else {
        const parts = d.replace(/-/g, '/').split('/')
        const [dd, mm, yyyy] = parts.length === 3 ? parts : [parts[0], parts[1], String(new Date().getFullYear())]
        const iso = new Date(Number(yyyy.length === 2 ? '20' + yyyy : yyyy), Number(mm) - 1, Number(dd)).toISOString()
        date = iso
      }
    }
    const subject = subjectMatch ? subjectMatch[1].trim() : undefined
    if (isSelf && currentUserName) {
      return { type: 'create_observation', teacher_name: currentUserName, subject, date }
    }
    if (forMatch) {
      const name = forMatch[1].replace(/[^a-zA-ZÀ-ÿ.'\-\s]/g, '').trim()
      if (name) return { type: 'create_observation', teacher_name: name, subject, date }
    }
    // Generic fallback: if it contains "create" and "observation" and we have a user name, assume self
    if (/create/.test(text) && /observation|assessment/.test(text) && currentUserName) {
      return { type: 'create_observation', teacher_name: currentUserName, subject, date }
    }
    return null
  }
}

export const teacherAssistantService = new TeacherAssistantService()

function normalizeText(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z\s.\-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}


