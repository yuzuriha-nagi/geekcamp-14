"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type School = {
  id: string;
  name: string;
};

type Profile = {
  school_id: string | null;
  term: string | null;
  grade: string | null;
  class: string | null;
};

const termOptions = [
  { value: "spring", label: "前期" },
  { value: "autumn", label: "後期" },
];

const gradeOptions = ["1", "2", "3", "4"];
const classOptions = ["A", "B", "C", "D"];

export default function ManageSchoolPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      setStatus(null);
      setError(null);
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setError("ログイン状態を確認できません。再読み込みしてください。");
        setIsLoading(false);
        return;
      }
      setUserId(authData.user.id);

      const [{ data: schoolsData, error: schoolsError }, { data: profileData }] =
        await Promise.all([
          supabase.from("schools").select("id, name").order("name"),
          supabase
            .from("user_profiles")
            .select("school_id, term, grade, class")
            .eq("user_id", authData.user.id)
            .maybeSingle(),
        ]);

      if (schoolsError) {
        setError("学校一覧の取得に失敗しました。");
      } else {
        setSchools(schoolsData ?? []);
      }

      setProfile(
        profileData ?? {
          school_id: null,
          term: null,
          grade: null,
          class: null,
        },
      );
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  const selectedTerm = useMemo(
    () => profile?.term ?? termOptions[0].value,
    [profile],
  );
  const selectedGrade = profile?.grade ?? gradeOptions[0];
  const selectedClass = profile?.class ?? classOptions[0];

  const handleCreateSchool = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    if (!newSchoolName.trim()) {
      setError("学校名を入力してください。");
      return;
    }
    setIsCreatingSchool(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("schools").insert({
      name: newSchoolName.trim(),
      owner_user_id: userId,
    });

    if (insertError) {
      setError("学校の追加に失敗しました。権限やテーブル構成を確認してください。");
    } else {
      setStatus(`「${newSchoolName.trim()}」を追加しました。`);
      setNewSchoolName("");
      const { data } = await supabase.from("schools").select("id, name").order("name");
      setSchools(data ?? []);
    }
    setIsCreatingSchool(false);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;
    if (!profile?.school_id) {
      setError("学校を選択してください。");
      return;
    }
    setIsSavingProfile(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const payload = {
      user_id: userId,
      school_id: profile.school_id,
      term: selectedTerm,
      grade: selectedGrade,
      class: selectedClass,
    };
    const { error: upsertError } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertError) {
      setError("プロフィールの保存に失敗しました。");
    } else {
      setStatus("プロフィールを更新しました。");
    }
    setIsSavingProfile(false);
  };

  const isTeacherView = status && status.includes("追加");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              WebClass
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
              学校と時間割設定
            </h1>
            <p className="text-sm text-zinc-500">
              学校の追加・所属設定、時間割パターン（学期/学年/クラス）をここで管理します。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
            >
              ダッシュボードへ
            </Link>
            <Link
              href="/dashboard/schedule"
              className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              時間割を編集
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {status && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">学校を登録</h2>
              <p className="text-sm text-zinc-500">
                教職員ユーザーが学校マスタを追加します。所属ユーザーは後で設定できます。
              </p>
            </div>
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
              />
            </label>
            <button
              type="submit"
              disabled={isCreatingSchool || !newSchoolName.trim()}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isCreatingSchool ? "追加中..." : "学校を追加"}
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
                所属と時間割パターン
              </h2>
              <p className="text-sm text-zinc-500">
                自分の学校・学期・学年・クラスを設定すると、ダッシュボードの時間割に反映されます。
              </p>
            </div>
          </div>
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm text-zinc-600">
              学校
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                value={profile?.school_id ?? ""}
                onChange={(event) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, school_id: event.target.value }
                      : {
                          school_id: event.target.value,
                          term: selectedTerm,
                          grade: selectedGrade,
                          class: selectedClass,
                        },
                  )
                }
              >
                <option value="">学校を選択</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-600">
              学期
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                value={selectedTerm}
                onChange={(event) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, term: event.target.value }
                      : {
                          school_id: null,
                          term: event.target.value,
                          grade: selectedGrade,
                          class: selectedClass,
                        },
                  )
                }
              >
                {termOptions.map((term) => (
                  <option key={term.value} value={term.value}>
                    {term.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-600">
              学年
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                value={selectedGrade}
                onChange={(event) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, grade: event.target.value }
                      : {
                          school_id: null,
                          term: selectedTerm,
                          grade: event.target.value,
                          class: selectedClass,
                        },
                  )
                }
              >
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade} 年
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-600">
              クラス
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                value={selectedClass}
                onChange={(event) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, class: event.target.value }
                      : {
                          school_id: null,
                          term: selectedTerm,
                          grade: selectedGrade,
                          class: event.target.value,
                        },
                  )
                }
              >
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className} 組
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isSavingProfile ? "保存中..." : "設定を保存"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                時間割パターンの切り替え
              </h2>
              <p className="text-sm text-zinc-500">
                上記で保存した条件がダッシュボードと時間割編集ページの初期値になります。
                他の学年・クラスの時間割を表示したい場合は、ここで条件を変えて保存してください。
              </p>
            </div>
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
            <li>
              学校全体で共有する時間割は「時間割を編集」リンクから
              <span className="font-semibold">学校 × 学期 × 学年 × クラス</span>
              ごとに登録します。
            </li>
            <li>
              学生が所属情報を更新すると、
              同じ学校・条件の時間割がダッシュボードで自動的に表示されます。
            </li>
            <li>
              教員アカウントで複数パターンを登録し、学生にはプロフィール更新を案内してください。
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
