// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mode, messages, audio_base64, model = 'gpt-4o-mini', api_key }: any = await req.json()

    const openaiKey = api_key || Deno.env.get('OPENAI_CREATE')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }

    if (mode === 'transcribe') {
      if (!audio_base64) {
        return new Response(JSON.stringify({ error: 'audio_base64 required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }
      const comma = audio_base64.indexOf(',')
      const base64 = comma >= 0 ? audio_base64.slice(comma + 1) : audio_base64
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', new File([blob], 'audio.webm', { type: 'audio/webm' }))
      form.append('model', 'gpt-4o-mini-transcribe')
      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}` },
        body: form
      })
      if (!resp.ok) {
        const txt = await resp.text()
        return new Response(JSON.stringify({ error: txt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
      }
      const data = await resp.json()
      return new Response(JSON.stringify({ text: data.text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // default: chat
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0.2 })
    })
    if (!r.ok) {
      const txt = await r.text()
      return new Response(JSON.stringify({ error: txt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
    const data = await r.json()
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})


