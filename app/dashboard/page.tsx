import Link from "next/link";

export const metadata = {
  title: "ダッシュボード | WebClass Clone",
  description: "WebClass風の学習ダッシュボード",
};

const courses = [
  {
    code: "INF301",
    title: "ソフトウェア工学",
    teacher: "高橋 教授",
    progress: 72,
    nextDeadline: "課題3 / 12.08 締切",
  },
  {
    code: "INF207",
    title: "データベース設計",
    teacher: "坂本 准教授",
    progress: 48,
    nextDeadline: "小テスト / 12.05 公開予定",
  },
  {
    code: "INF114",
    title: "UXデザイン論",
    teacher: "伊藤 准教授",
    progress: 91,
    nextDeadline: "最終レポート / 12.18 締切",
  },
];

const tasks = [
  {
    title: "AI応用演習: 課題4（画像分類）",
    due: "12/06（金） 23:59",
    status: "未提出",
  },
  {
    title: "情報倫理: 小テスト2",
    due: "12/04（水） 21:00",
    status: "受験待ち",
  },
  {
    title: "ソフトウェア工学: グループレビュー",
    due: "12/10（火） 18:00",
    status: "準備中",
  },
];

const announcements = [
  {
    date: "2024/12/01",
    title: "冬学期 ガイダンス資料を公開しました",
    body: "履修予定の学生は事前に資料を確認の上、初回授業に参加してください。",
  },
  {
    date: "2024/11/29",
    title: "キャンパスネットワークメンテナンス",
    body: "12/03 02:00-05:00 の間、WebClass へのアクセスが不安定になります。",
  },
  {
    date: "2024/11/25",
    title: "レポート提出フォーマット更新",
    body: "ZIP 形式での提出に加えて PDF の添付が必須になりました。",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              WebClass
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              ダッシュボード
            </h1>
            <p className="text-sm text-zinc-500">
              受講コースの進捗、課題、重要なお知らせをまとめて確認できます。
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
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  受講中のコース
                </h2>
                <p className="text-sm text-zinc-500">
                  最近更新された3件のコースを表示しています。
                </p>
              </div>
              <button className="text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline">
                コース一覧
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {courses.map((course) => (
                <article
                  key={course.code}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
                      {course.code}
                    </span>
                    <p className="text-sm font-medium text-zinc-900">
                      {course.teacher}
                    </p>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {course.nextDeadline}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>進捗</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-zinc-900"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                緊急タスク
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                Tasks
              </span>
            </div>
            <ul className="mt-4 space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.title}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4"
                >
                  <p className="text-xs font-medium text-zinc-500">{task.due}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {task.title}
                  </p>
                  <p className="text-xs text-zinc-500">{task.status}</p>
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-2xl border border-dashed border-zinc-200 py-3 text-sm font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-900">
              課題提出ページを開く
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                お知らせ
              </h2>
              <button className="text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline">
                全件表示
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {announcements.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {item.date}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                サポート / クイックリンク
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                Support
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  FAQ
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  ログイン・課題提出時のトラブルシューティング
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  Support Desk
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  平日 9:00-18:00 / helpdesk@example.ac.jp / 03-1234-5678
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Quick Links
                </p>
                <ul className="mt-2 space-y-1 text-sm font-medium text-zinc-900">
                  <li>・履修登録 / 成績参照</li>
                  <li>・オンライン会議ルーム</li>
                  <li>・図書館 / 資料検索システム</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
