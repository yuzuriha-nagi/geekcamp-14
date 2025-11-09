"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type School = {
  id: string;
  name: string;
};

const adminLinks = [
  {
    title: "学生ダッシュボードを見る",
    description: "学生と同じ画面でレイアウト崩れや通知を確認します。",
    href: "/dashboard",
  },
  {
    title: "教員ダッシュボードを見る",
    description:
      "課題・採点キュー・校務連絡など教職員向け機能を確認します。",
    href: "/dashboard/teacher",
  },
  {
    title: "学校・プロフィール設定",
    description: "所属設定や共通情報の初期値を管理できます。",
    href: "/dashboard/manage",
  },
];

export default function AdminDashboardClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchools = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id, name")
      .order("name");
    if (error) {
      setError("学校一覧の取得に失敗しました。");
      setSchools([]);
    } else {
      setSchools(data ?? []);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      setStatus(null);
      setError(null);
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setError("ログイン情報を確認できません。再読み込みしてください。");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      setUserId(authData.user.id);

      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (roleError || roleData?.role !== "admin") {
        setError("管理者のみアクセスできます。");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      await fetchSchools();
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  const handleCreateSchool = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || !newSchoolName.trim()) return;
    setIsCreating(true);
    setStatus(null);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("schools").insert({
      name: newSchoolName.trim(),
      owner_user_id: userId,
    });

    if (insertError) {
      setError("学校の追加に失敗しました。");
    } else {
      setStatus(`「${newSchoolName.trim()}」を追加しました。`);
      setNewSchoolName("");
      await fetchSchools();
    }
    setIsCreating(false);
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
            <h1 className="text-2xl font-semibold text-zinc-900">
              管理者コンソール
            </h1>
            <Link
              href="/dashboard"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600"
            >
              ダッシュボードへ戻る
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-red-700">
            {error ?? "管理者権限が必要です。"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              WebCampass
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              管理者コンソール
            </h1>
            <p className="text-sm text-zinc-500">
              学生・教職員の両方の機能にアクセスし、学校データを管理できます。
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
          >
            ログアウト
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {status && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                学校マスタを追加
              </h2>
              <p className="text-sm text-zinc-500">
                新しい学校を登録すると、学生/教職員が所属設定で選択できるようになります。
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Manage
            </span>
          </div>
          <form
            onSubmit={handleCreateSchool}
            className="mt-6 flex flex-col gap-4 md:flex-row"
          >
            <label className="flex-1 text-sm text-zinc-600">
              学校名
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                placeholder="例: 霞ヶ丘大学"
                value={newSchoolName}
                onChange={(event) => setNewSchoolName(event.target.value)}
                disabled={isCreating || isLoading}
              />
            </label>
            <button
              type="submit"
              disabled={isCreating || !newSchoolName.trim()}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isCreating ? "追加中..." : "学校を追加"}
            </button>
          </form>
          {!isLoading && schools.length > 0 && (
            <div className="mt-4 text-sm text-zinc-500">
              登録済み:{" "}
              <span className="font-medium text-zinc-900">
                {schools.map((school) => school.name).join(" / ")}
              </span>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                ロール切り替え
              </h2>
              <p className="text-sm text-zinc-500">
                学生・教職員の画面を行き来し、同じ操作を再現できます。
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Navigate
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 transition hover:border-zinc-300 hover:bg-white"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  NAVIGATE
                </p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            管理者のヒント
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
            <li>
              学校を追加したら、学生や教職員に所属設定（/dashboard/manage）で学校を選んでもらってください。
            </li>
            <li>
              学生/教職員画面を行き来して、不具合再現や表示確認を迅速に行えます。
            </li>
            <li>
              管理者コンソール以外では学校を追加できないため、運用フローを周知してください。
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
