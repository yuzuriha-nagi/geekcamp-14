"use client";

import { useState } from "react";
import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  assignmentId: string;
  userId: string;
  hasSubmission: boolean;
};

export default function SubmitAssignmentForm({
  assignmentId,
  userId,
  hasSubmission,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const validatePDF = (file: File): { isValid: boolean; error?: string } => {
    // ファイルタイプチェック
    if (file.type !== "application/pdf") {
      return {
        isValid: false,
        error: "PDFファイルのみアップロード可能です",
      };
    }

    // ファイルサイズチェック（50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "ファイルサイズは50MB以下にしてください",
      };
    }

    // ファイル名チェック
    const fileName = file.name;
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(fileName)) {
      return {
        isValid: false,
        error: "ファイル名に使用できない文字が含まれています",
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePDF(file);
    if (!validation.isValid) {
      setError(validation.error!);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("ファイルを選択してください");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      // ファイル名をサニタイズ（日本語・特殊文字を除去）
      const sanitizeFileName = (name: string): string => {
        const ext = name.substring(name.lastIndexOf('.'));
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        // 英数字、ハイフン、アンダースコアのみ許可
        const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        return sanitized + ext;
      };

      // ファイルパスを生成
      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFileName(selectedFile.name);
      const filePath = `${userId}/${assignmentId}/${timestamp}-${sanitizedFileName}`;

      // Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from("assignment-submissions")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`アップロードエラー: ${uploadError.message}`);
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("assignment-submissions").getPublicUrl(filePath);

      // submissionsテーブルに記録（上書き提出）
      const { error: dbError } = await supabase.from("submissions").upsert(
        {
          user_id: userId,
          assignment_id: assignmentId,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
        },
        {
          onConflict: "user_id,assignment_id",
        }
      );

      if (dbError) {
        throw new Error(`データベースエラー: ${dbError.message}`);
      }

      setSuccess(true);
      setSelectedFile(null);

      // ページをリロードして提出状況を更新
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "提出に失敗しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "1rem" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="file-input"
          disabled={uploading}
        />
        <label htmlFor="file-input">
          <Button
            component="span"
            variant="outlined"
            disabled={uploading}
            sx={{ marginRight: "1rem" }}
          >
            ファイルを選択
          </Button>
        </label>
        {selectedFile && (
          <Typography component="span" sx={{ fontSize: "14px" }}>
            選択中: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!selectedFile || uploading}
        sx={{ marginBottom: "1rem" }}
      >
        {uploading ? (
          <>
            <CircularProgress size={20} sx={{ marginRight: "0.5rem" }} />
            アップロード中...
          </>
        ) : hasSubmission ? (
          "再提出する"
        ) : (
          "提出する"
        )}
      </Button>

      {error && (
        <Alert severity="error" sx={{ marginTop: "1rem" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginTop: "1rem" }}>
          課題を提出しました！
        </Alert>
      )}

      <Typography variant="caption" sx={{ display: "block", marginTop: "1rem", color: "text.secondary" }}>
        ※ 対応形式: PDF / 最大サイズ: 50MB
      </Typography>
    </Box>
  );
}
