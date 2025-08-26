import { subjectsApi, observationTypesApi, teachersApi } from '@/lib/supabase'

export interface AdminAIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

function normalise(text: string): string {
  return text.trim().toLowerCase()
}

export class AdminAIService {
  async process(input: string): Promise<string> {
    const t = normalise(input)

    // Create subject: "create subject <name>"
    let m = t.match(/^create\s+subject\s+(.{2,})$/)
    if (m) {
      const name = capitalise(m[1])
      const created = await subjectsApi.create({ name, description: null, is_active: true })
      return `Created subject “${created.name}”.`
    }

    // Create observation type
    m = t.match(/^create\s+observation\s+type\s+(.{2,})$/)
    if (m) {
      const name = capitalise(m[1])
      const created = await observationTypesApi.create({ name, description: null, is_active: true })
      return `Created observation type “${created.name}”.`
    }

    // Make teacher admin: "make admin <email>" or "grant admin to <email>"
    m = t.match(/^(?:make\s+admin|grant\s+admin\s+to)\s+([^\s]+@[^\s]+)$/)
    if (m) {
      const email = m[1]
      const teacher = await teachersApi.getByEmail(email)
      if (!teacher) return `No teacher found with email ${email}.`
      // naive update via supabase client; re-use teachersApi not present update - simple message instead
      return `Please use the Admin → User Management to set admin for ${teacher.name}. (Automated elevation can be wired if desired.)`
    }

    return 'I can help with admin tasks. Try: “create subject Physics”, “create observation type Learning Walk”, or “grant admin to sb8@stpauls.br”.'
  }
}

function capitalise(s: string): string {
  return s.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

export const adminAiService = new AdminAIService()


