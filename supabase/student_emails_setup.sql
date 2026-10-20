-- ==============================================================================
-- PRISM Hub: student_emails Table Schema & Migration
-- สร้างตารางจับคู่ระหว่าง Google Email ของนักเรียน กับ student_id (UUID) จากระบบ PEM
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_emails (
  email text PRIMARY KEY,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- เพิ่ม Index เพื่อให้ค้นหาด้วย student_id ได้รวดเร็ว
CREATE INDEX IF NOT EXISTS idx_student_emails_student_id ON public.student_emails(student_id);

-- เปิด RLS (Row Level Security) เพื่อความปลอดภัย
ALTER TABLE public.student_emails ENABLE ROW LEVEL SECURITY;

-- นโยบาย: ไม่อนุญาตให้ Anonymous / Public อ่านหรือเขียนโดยตรง (Service Role เท่านั้นที่เข้าถึงได้)
CREATE POLICY "Service role full access on student_emails"
  ON public.student_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ตัวอย่างคำสั่ง INSERT ข้อมูลจับคู่อีเมลจาก PEM:
-- INSERT INTO public.student_emails (email, student_id)
-- VALUES
--   ('52001.somchai@student.nssc.ac.th', '11111111-2222-3333-4444-555555555555'),
--   ('52002.somying@student.nssc.ac.th', '66666666-7777-8888-9999-000000000000')
-- ON CONFLICT (email) DO UPDATE SET student_id = EXCLUDED.student_id;
