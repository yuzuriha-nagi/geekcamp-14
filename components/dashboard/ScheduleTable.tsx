"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type ScheduleEntry = {
  id: string;
  day_of_week: string;
  period: number;
  title: string;
};

const dayColumns = [
  { value: "mon", label: "月" },
  { value: "tue", label: "火" },
  { value: "wed", label: "水" },
  { value: "thu", label: "木" },
  { value: "fri", label: "金" },
  { value: "sat", label: "土" },
  { value: "sun", label: "日" },
];

const defaultPeriods = [1, 2, 3, 4, 5];

export default function ScheduleTable() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          setError("スケジュールを取得するにはログインが必要です。");
          setEntries([]);
          return;
        }

        const { data, error } = await supabase
          .from("schedules")
          .select("id, day_of_week, period, title")
          .eq("user_id", userData.user.id)
          .order("period", { ascending: true });

        if (error) {
          setError("スケジュールの取得に失敗しました。");
          setEntries([]);
          return;
        }

        setEntries(data ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const periodRange = useMemo(() => {
    const maxPeriod = entries.reduce(
      (max, entry) => Math.max(max, entry.period),
      0,
    );
    if (maxPeriod === 0) {
      return defaultPeriods;
    }
    return Array.from({ length: maxPeriod }, (_, index) => index + 1);
  }, [entries]);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    entries.forEach((entry) => {
      map.set(`${entry.day_of_week}-${entry.period}`, entry);
    });
    return map;
  }, [entries]);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">時間割</h2>
          <p className="text-sm text-zinc-500">
            月曜から日曜まで、登録済みのコマのみ表示します。
          </p>
        </div>
        <Link
          href="/dashboard/schedule"
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
        >
          時間割を管理
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-zinc-900">
          <thead>
            <tr>
              <th className="w-16 border-b border-zinc-200 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                限
              </th>
              {dayColumns.map((day) => (
                <th
                  key={day.value}
                  className="border-b border-zinc-200 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodRange.map((period) => (
              <tr key={period}>
                <td className="border-b border-zinc-100 py-4 text-sm font-semibold text-zinc-500">
                  {period} 限
                </td>
                {dayColumns.map((day) => {
                  const entry = scheduleMap.get(`${day.value}-${period}`);
                  return (
                    <td
                      key={day.value}
                      className="border-b border-zinc-100 px-3 py-4 align-top"
                    >
                      {entry ? (
                        <span className="text-xs font-semibold text-zinc-900">
                          {entry.title}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <p className="mt-4 text-xs text-zinc-400">読み込み中です...</p>
        )}
        {error && (
          <p className="mt-4 text-xs text-red-500">
            {error}（時間割管理ページで設定できます）
          </p>
        )}
        {!loading && !error && entries.length === 0 && (
          <p className="mt-4 text-xs text-zinc-400">
            時間割が登録されていません。「時間割を管理」から追加してください。
          </p>
        )}
      </div>
    </section>
  );
}
