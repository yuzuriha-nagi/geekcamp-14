-- Create assignment-submissions storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- RLSポリシー: 学生は自分のフォルダにのみアップロード可能
CREATE POLICY "Students can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignment-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLSポリシー: 学生は自分のファイルのみ閲覧可能
CREATE POLICY "Students can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignment-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLSポリシー: 教員と管理者は全てのファイルを閲覧可能
CREATE POLICY "Teachers and admins can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignment-submissions' AND
  EXISTS (
    SELECT 1 FROM roles
    WHERE roles.user_id = auth.uid()
    AND roles.role IN ('teacher', 'admin')
  )
);

-- RLSポリシー: 学生は自分のファイルを更新可能（上書き提出）
CREATE POLICY "Students can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assignment-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'assignment-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLSポリシー: 学生は自分のファイルを削除可能
CREATE POLICY "Students can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assignment-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
