"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type ScheduleEntry = {
  id: string;
  day_of_week: string;
  period: number;
  title: string;
};

const dayOptions = [
  { value: "mon", label: "月曜日" },
  { value: "tue", label: "火曜日" },
  { value: "wed", label: "水曜日" },
  { value: "thu", label: "木曜日" },
  { value: "fri", label: "金曜日" },
  { value: "sat", label: "土曜日" },
  { value: "sun", label: "日曜日" },
];

const periodOptions = Array.from({ length: 10 }, (_, index) => index + 1);

export default function ScheduleManagePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [formState, setFormState] = useState({
    day: "mon",
    period: 1,
    title: "",
  });
  const [status, setStatus] = useState<
    { type: "idle" | "success" | "error"; message?: string }
  >({ type: "idle" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setEntries([]);
        setStatus({
          type: "error",
          message: "ログイン状態を確認できませんでした。",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("id, day_of_week, period, title")
        .eq("user_id", userData.user.id)
        .order("period");

      if (error) {
        setStatus({
          type: "error",
          message: "時間割の取得に失敗しました。",
        });
        setEntries([]);
      } else {
        setEntries(data ?? []);
        setStatus({ type: "idle" });
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const groupedEntries = useMemo(() => {
    return dayOptions.map((day) => ({
      day: day.label,
      rows: entries
        .filter((entry) => entry.day_of_week === day.value)
        .sort((a, b) => a.period - b.period),
    }));
  }, [entries]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "idle" });

    if (!formState.title.trim()) {
      setStatus({ type: "error", message: "科目名を入力してください。" });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setStatus({ type: "error", message: "ログインが必要です。" });
      return;
    }

    const payload = {
      user_id: userData.user.id,
      day_of_week: formState.day,
      period: formState.period,
      title: formState.title.trim(),
    };

    const { error } = await supabase
      .from("schedules")
      .upsert(payload, { onConflict: "user_id,day_of_week,period" });

    if (error) {
      setStatus({
        type: "error",
        message: "登録に失敗しました。やり直してください。",
      });
      return;
    }

    const dayLabel =
      dayOptions.find((option) => option.value === formState.day)?.label ??
      formState.day;
    setStatus({
      type: "success",
      message: `${dayLabel} / ${formState.period}限を更新しました。`,
    });
    setFormState((prev) => ({ ...prev, title: "" }));

    const { data } = await supabase
      .from("schedules")
      .select("id, day_of_week, period, title")
      .eq("user_id", userData.user.id)
      .order("period");
    setEntries(data ?? []);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              WebClass
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
              時間割を管理
            </h1>
            <p className="text-sm text-zinc-500">
              曜日とコマを指定して科目名を登録すると、ダッシュボードに反映されます。
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
          >
            ダッシュボードへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            時間割を追加 / 更新
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 sm:grid-cols-3"
          >
            <label className="text-sm text-zinc-600">
              曜日
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={formState.day}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    day: event.target.value,
                  }))
                }
              >
                {dayOptions.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-600">
              何限
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={formState.period}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    period: Number(event.target.value),
                  }))
                }
              >
                {periodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period} 限
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-600 sm:col-span-1 sm:col-start-1 sm:row-start-2 sm:row-end-2">
              科目名
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={formState.title}
                placeholder="例: ソフトウェア工学"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex items-end sm:col-span-2 sm:col-start-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                登録 / 更新
              </button>
            </div>
          </form>
          {status.type === "error" && (
            <p className="mt-3 text-sm text-red-600">{status.message}</p>
          )}
          {status.type === "success" && (
            <p className="mt-3 text-sm text-emerald-600">{status.message}</p>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              登録済みの時間割
            </h2>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Overview
            </p>
          </div>
          <div className="mt-5 space-y-5">
            {loading && (
              <p className="text-sm text-zinc-500">読み込み中です...</p>
            )}
            {!loading &&
              groupedEntries.map((group) => (
                <div key={group.day}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                    {group.day}
                  </p>
                  {group.rows.length === 0 ? (
                    <p className="mt-1 text-sm text-zinc-400">登録なし</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {group.rows.map((row) => (
                        <li
                          key={row.id}
                          className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-sm"
                        >
                          {row.period} 限 / {row.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
