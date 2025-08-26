-- Helper RPC to create feedback drafts bypassing RLS safely
-- Requires that table public.feedback already exists in the project

CREATE OR REPLACE FUNCTION public.create_feedback_draft(
  p_teacher_id uuid,
  p_observer_id uuid,
  p_observation_date timestamptz,
  p_status text DEFAULT 'draft',
  p_lesson_subject text DEFAULT NULL,
  p_lesson_topic text DEFAULT NULL,
  p_class_year text DEFAULT NULL,
  p_is_confidential boolean DEFAULT false
)
RETURNS public.feedback
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.feedback;
BEGIN
  INSERT INTO public.feedback (
    teacher_id, observer_id, observation_date, status,
    lesson_subject, lesson_topic, class_year,
    strengths, areas_for_development, action_points, overall_rating,
    is_confidential, planning_preparation, teaching_delivery,
    student_engagement, classroom_management, assessment_feedback
  ) VALUES (
    p_teacher_id, p_observer_id, p_observation_date, COALESCE(p_status, 'draft'),
    p_lesson_subject, p_lesson_topic, p_class_year,
    NULL, NULL, NULL, NULL,
    COALESCE(p_is_confidential, false), '{}', '{}', '{}', '{}', '{}'
  )
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_feedback_draft(
  uuid, uuid, timestamptz, text, text, text, text, boolean
) TO anon, authenticated;


