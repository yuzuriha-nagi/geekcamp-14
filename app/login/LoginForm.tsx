"use client";

import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const authErrorMessages: Record<string, string> = {
  invalid_credentials:
    "ユーザーIDまたはパスワードが正しくありません。もう一度入力してください。",
  email_not_confirmed:
    "メールアドレスが確認されていません。確認メールのリンクから有効化してください。",
  user_not_found: "該当するユーザーが見つかりません。入力内容をご確認ください。",
  over_email_send_rate_limit:
    "一定回数以上の試行が行われました。数分後に再度お試しください。",
  mfa_required:
    "多要素認証が必要です。登録済みの認証方法で追加の手続きを行ってください。",
};

const translateAuthError = (code?: string, fallback?: string) => {
  if (!code) {
    return fallback ?? "ログインに失敗しました。時間をおいて再度お試しください。";
  }
  return (
    authErrorMessages[code] ??
    fallback ??
    "ログインに失敗しました。時間をおいて再度お試しください。"
  );
};

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const userId = String(formData.get("userId") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!userId || !password) {
      setStatus({
        type: "error",
        message: "ユーザーIDとパスワードを入力してください。",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle" });

    const credentials = userId.includes("@")
      ? ({ email: userId } as const)
      : ({ phone: userId } as const);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      ...credentials,
      password,
    });

    if (error) {
      const supabaseError = error as AuthError & { code?: string };
      setStatus({
        type: "error",
        message: translateAuthError(
          supabaseError.code,
          supabaseError.message,
        ),
      });
      setIsSubmitting(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setStatus({
        type: "error",
        message: "ユーザー情報の取得に失敗しました。",
      });
      setIsSubmitting(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || !roleData?.role) {
      setStatus({
        type: "error",
        message: "権限情報が見つかりません。管理者にお問い合わせください。",
      });
      setIsSubmitting(false);
      return;
    }

    const normalizedRole = roleData.role?.toLowerCase();
    let destination = "/";
    if (normalizedRole === "teacher") {
      destination = "/dashboard/teacher";
    } else if (normalizedRole === "admin") {
      destination = "/dashboard/admin";
    } else if (normalizedRole === "student" || normalizedRole === "students") {
      destination = "/";
    }

    setStatus({
      type: "success",
      message: "ログインに成功しました。",
    });
    form.reset();
    setIsSubmitting(false);
    router.push(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="userId" className="text-sm font-medium text-black">
          ユーザーID
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          placeholder="student@example.com"
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-black placeholder:text-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          autoComplete="username"
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-black">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-black placeholder:text-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          autoComplete="current-password"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
      {status.type === "error" && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}
      {status.type === "success" && (
        <p className="text-sm text-emerald-600">{status.message}</p>
      )}
    </form>
  );
}
