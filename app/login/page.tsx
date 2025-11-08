import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン | WebCampass",
  description: "WebCampass",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
            WebCampass
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
            ログイン
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            学籍番号（または登録済みメールアドレス）とパスワードを入力してください。
          </p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
