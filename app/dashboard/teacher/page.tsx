import Link from "next/link";

export const metadata = {
  title: "教員ダッシュボード | WebClass Clone",
  description: "WebClass風の教員向け管理ページ",
};

const classes = [
  {
    code: "INF501",
    title: "AI 応用演習",
    students: 42,
    submissions: "課題4: 36/42 提出済み",
    nextEvent: "口頭試問 12/09",
  },
  {
    code: "INF403",
    title: "ヒューマンインタフェース論",
    students: 58,
    submissions: "小テスト2: 52/58 評価済み",
    nextEvent: "課題2 公開予定 12/05",
  },
];

const gradingQueue = [
  {
    course: "AI 応用演習",
    task: "課題4（画像分類）",
    pending: 6,
    due: "評価期限 12/07",
  },
  {
    course: "ソフトウェア工学",
    task: "グループレビュー",
    pending: 12,
    due: "評価期限 12/10",
  },
];

const notices = [
  {
    date: "2024/12/01",
    title: "冬学期の教材アップロード締切",
    detail: "12/08 までに全クラスの教材データを登録してください。",
  },
  {
    date: "2024/11/28",
    title: "システムアップデート",
    detail: "12/02 2:00-4:00 の間、教材アップロード機能が停止します。",
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
              WebClass
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              教員ダッシュボード
            </h1>
            <p className="text-sm text-zinc-500">
              クラス管理、課題配信、採点作業をまとめて確認できます。
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
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                担当クラス
              </h2>
              <button className="text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline">
                クラス管理
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {classes.map((item) => (
                <article
                  key={item.code}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
                      {item.code}
                    </span>
                    <p className="text-sm font-medium text-zinc-500">
                      受講者 {item.students} 名
                    </p>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.submissions}</p>
                  <p className="text-xs text-zinc-500">{item.nextEvent}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                採点キュー
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                Grading
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {gradingQueue.map((queue) => (
                <article
                  key={queue.task}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4"
                >
                  <p className="text-xs font-medium text-zinc-500">
                    {queue.course}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {queue.task}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                    <span>未評価 {queue.pending} 件</span>
                    <span>{queue.due}</span>
                  </div>
                </article>
              ))}
            </div>
            <button className="mt-5 w-full rounded-2xl border border-dashed border-zinc-200 py-3 text-sm font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-900">
              採点画面へ移動
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                お知らせ / 校務連絡
              </h2>
              <button className="text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline">
                全件表示
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {notices.map((notice) => (
                <article
                  key={notice.title}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {notice.date}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                    {notice.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{notice.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                クイックアクション
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                Actions
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  課題を公開
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  新しい課題やテストを作成し、公開スケジュールを設定します。
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  出席レポート
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  出席率や学習ログを CSV としてエクスポートできます。
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Support Desk
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  helpdesk@example.ac.jp / 内線 1234
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
