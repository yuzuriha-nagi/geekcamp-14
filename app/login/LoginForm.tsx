"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

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
      setStatus({ type: "error", message: error.message });
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

    let destination = "/";
    if (roleData.role === "teacher") {
      destination = "/dashboard/teacher";
    } else if (roleData.role === "admin") {
      destination = "/dashboard/admin";
    } else if (roleData.role === "student") {
      destination = "/";
    } else {
      destination = "/dashboard";
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
