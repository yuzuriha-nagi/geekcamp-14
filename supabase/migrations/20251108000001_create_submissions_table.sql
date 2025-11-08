-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 上書き提出のためのユニーク制約
  UNIQUE(user_id, assignment_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- RLS有効化
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- ポリシー: 学生は自分の提出のみ閲覧可能
CREATE POLICY "Students can view own submissions"
ON submissions FOR SELECT
USING (auth.uid() = user_id);

-- ポリシー: 学生は自分の提出を作成可能
CREATE POLICY "Students can create own submissions"
ON submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ポリシー: 学生は自分の提出を更新可能（上書き提出）
CREATE POLICY "Students can update own submissions"
ON submissions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ポリシー: 教員と管理者は全ての提出を閲覧可能
CREATE POLICY "Teachers and admins can view all submissions"
ON submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roles
    WHERE roles.user_id = auth.uid()
    AND roles.role IN ('teacher', 'admin')
  )
);

-- コメント
COMMENT ON TABLE submissions IS '課題提出テーブル';
COMMENT ON COLUMN submissions.id IS '提出ID';
COMMENT ON COLUMN submissions.user_id IS 'ユーザーID';
COMMENT ON COLUMN submissions.assignment_id IS '課題ID（外部キー）';
COMMENT ON COLUMN submissions.file_url IS 'ファイルURL';
COMMENT ON COLUMN submissions.file_name IS 'ファイル名';
COMMENT ON COLUMN submissions.file_size IS 'ファイルサイズ（バイト）';
COMMENT ON COLUMN submissions.submitted_at IS '提出日時';
COMMENT ON COLUMN submissions.updated_at IS '更新日時';
