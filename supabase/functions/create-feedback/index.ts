// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const payload = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const {
      teacher_id,
      observer_id = null,
      observation_date,
      status = 'draft',
      lesson_subject = null,
      lesson_topic = null,
      class_year = null,
      strengths = null,
      areas_for_development = null,
      action_points = null,
      overall_rating = null,
      is_confidential = false,
      planning_preparation = {},
      teaching_delivery = {},
      student_engagement = {},
      classroom_management = {},
      assessment_feedback = {}
    } = payload || {};

    if (!teacher_id) {
      return new Response(JSON.stringify({ error: 'teacher_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const dateIso = observation_date ? new Date(observation_date).toISOString() : new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert([{
        teacher_id,
        observer_id,
        observation_date: dateIso,
        status,
        lesson_subject,
        lesson_topic,
        class_year,
        strengths,
        areas_for_development,
        action_points,
        overall_rating,
        is_confidential,
        planning_preparation,
        teaching_delivery,
        student_engagement,
        classroom_management,
        assessment_feedback
      }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message || 'insert failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ feedback: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});


