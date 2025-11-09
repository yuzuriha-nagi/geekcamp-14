"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Role = "student" | "teacher" | "admin";
type TargetMode = "role" | "user";

type AssignmentQueryRow = {
  id: string;
  name: string;
  lesson_id: string;
  lessons: { name: string } | { name: string }[] | null;
};

type AssignmentOption = {
  id: string;
  name: string;
  lesson_id: string;
  lesson_name: string;
};

const typeOptions = [
  { value: "info", label: "一般" },
  { value: "course", label: "授業・課題" },
  { value: "system", label: "システム" },
  { value: "emergency", label: "緊急" },
];

export default function ManageNotificationsPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("info");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetMode, setTargetMode] = useState<TargetMode>("role");
  const [targetRole, setTargetRole] = useState<Role>("student");
  const [targetUserId, setTargetUserId] = useState("");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [assignmentLoadError, setAssignmentLoadError] = useState<string | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  async function fetchAssignments(
    supabaseClient = getSupabaseBrowserClient(),
  ) {
    setIsLoadingAssignments(true);
    setAssignmentLoadError(null);
    const { data, error } = await supabaseClient
      .from("assignments")
      .select(
        `
        id,
        name,
        lesson_id,
        lessons (
          name
        )
      `,
      )
      .order("deadline", { ascending: true });

    if (error) {
      setAssignments([]);
      setAssignmentLoadError(
        "課題一覧の取得に失敗しました。再読み込みしてください。",
      );
    } else {
      const rawData = ((data ?? []) as AssignmentQueryRow[]).map((item) => {
        const lessonsField = Array.isArray(item.lessons)
          ? item.lessons[0] ?? null
          : item.lessons ?? null;
        return {
          id: item.id,
          name: item.name,
          lesson_id: item.lesson_id,
          lesson_name: lessonsField?.name ?? "不明な授業",
        };
      });
      const mapped: AssignmentOption[] = rawData;
      setAssignments(mapped);
    }
    setIsLoadingAssignments(false);
  }

  useEffect(() => {
    const bootstrap = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setError("ログイン情報を確認できません。再読み込みしてください。");
        setIsAuthorized(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (
        roleError ||
        !roleData?.role ||
        (roleData.role !== "teacher" && roleData.role !== "admin")
      ) {
        setError("通知の送信は教員または管理者のみが利用できます。");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);

      await fetchAssignments(supabase);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    setPreviewCount(null);
  }, [targetMode, targetRole, targetUserId]);

  const fetchRecipientIds = async (): Promise<string[]> => {
    const supabase = getSupabaseBrowserClient();

    if (targetMode === "role") {
      const { data, error: fetchError } = await supabase
        .from("roles")
        .select("user_id")
        .eq("role", targetRole);

      if (fetchError) {
        throw new Error("対象ユーザー一覧の取得に失敗しました。");
      }

      const ids = data?.map((item) => item.user_id) ?? [];
      if (ids.length === 0) {
        throw new Error("指定したロールに所属するユーザーが見つかりません。");
      }

      setPreviewCount(ids.length);
      return ids;
    }

    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      throw new Error("ユーザーIDを入力してください。");
    }
    setPreviewCount(1);
    return [trimmedId];
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!title.trim() || !body.trim()) {
      setError("タイトルと本文を入力してください。");
      return;
    }

    if (type === "course" && !selectedAssignmentId) {
      setError("「授業・課題」カテゴリでは紐付ける課題を必ず選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const recipientIds = await fetchRecipientIds();
      const supabase = getSupabaseBrowserClient();

      const payload = recipientIds.map((userId) => ({
        user_id: userId,
        type,
        title: title.trim(),
        body: body.trim(),
        status: "unread",
        assignment_id: selectedAssignmentId || null,
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(payload);

      if (insertError) {
        throw new Error("通知の送信に失敗しました。");
      }

      setStatus(`${recipientIds.length}件の通知を送信しました。`);
      setTitle("");
      setBody("");
      setSelectedAssignmentId("");
      if (targetMode === "user") {
        setTargetUserId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "通知の送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
            <h1 className="text-2xl font-semibold text-zinc-900">
              通知の送信
            </h1>
            <Link
              href="/notifications"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600"
          >
            通知一覧へ
          </Link>
        </div>
      </header>
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-red-700">
            {error ?? "このページにアクセスする権限がありません。"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              Notifications
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              通知を送信
            </h1>
            <p className="text-sm text-zinc-500">
              教員・管理者として学生や教職員へ通知を配信できます。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/notifications"
              className="rounded-full border border-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
            >
              通知一覧へ
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {status && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {status}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "24px",
            border: "1px solid #e4e4e7",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="notification-type-label">カテゴリ</InputLabel>
            <Select
              labelId="notification-type-label"
              value={type}
              label="カテゴリ"
              onChange={(event) => setType(event.target.value)}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="タイトル"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="本文"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
          />

          <Box
            sx={{
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              課題リンク（任意）
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="assignment-select-label">紐付ける課題</InputLabel>
              <Select
                labelId="assignment-select-label"
                value={selectedAssignmentId}
                label="紐付ける課題"
                onChange={(event) => setSelectedAssignmentId(event.target.value)}
                disabled={isLoadingAssignments || assignments.length === 0}
              >
                <MenuItem value="">紐付けなし</MenuItem>
                {assignments.map((assignment) => (
                  <MenuItem key={assignment.id} value={assignment.id}>
                    {assignment.lesson_name} / {assignment.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {assignmentLoadError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ display: "block", mt: 1 }}
              >
                {assignmentLoadError}
              </Typography>
            )}
            {type === "course" && (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, color: "text.secondary" }}
              >
                ※ 授業・課題カテゴリの通知では必ず紐付ける課題を選択してください。
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              送信先
            </Typography>
            <RadioGroup
              row
              value={targetMode}
              onChange={(event) =>
                setTargetMode(event.target.value as TargetMode)
              }
            >
              <FormControlLabel
                value="role"
                control={<Radio />}
                label="ロールを指定"
              />
              <FormControlLabel
                value="user"
                control={<Radio />}
                label="ユーザーIDを指定"
              />
            </RadioGroup>

            {targetMode === "role" ? (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="target-role-label">対象ロール</InputLabel>
                <Select
                  labelId="target-role-label"
                  value={targetRole}
                  label="対象ロール"
                  onChange={(event) =>
                    setTargetRole(event.target.value as Role)
                  }
                >
                  <MenuItem value="student">学生</MenuItem>
                  <MenuItem value="teacher">教員</MenuItem>
                  <MenuItem value="admin">管理者</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="ユーザーID (UUID)"
                value={targetUserId}
                onChange={(event) => setTargetUserId(event.target.value)}
                sx={{ mt: 2 }}
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            )}

            {previewCount !== null && (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, color: "text.secondary" }}
              >
                推定送信対象: {previewCount} 件
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            sx={{ alignSelf: "flex-start", minWidth: "180px" }}
          >
            {isSubmitting ? "送信中..." : "通知を送信"}
          </Button>

          <Typography variant="caption" color="text.secondary">
            ・送信対象のロールは `roles` テーブルの所属に基づきます。
            <br />
            ・本文にはプレーンテキストのみ利用できます。必要に応じてリンク URL
            を記載してください。
            <br />・通知は既定で未読として登録され、学生・教員の通知一覧に即時反映されます。
          </Typography>
        </Box>
      </main>
    </div>
  );
}
