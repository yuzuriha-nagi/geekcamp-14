import { Metadata } from "next";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AssignmentForNotification = {
  id: string;
  lesson_id: string;
  name: string;
  lessons: {
    name: string;
  } | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  status: string;
  created_at: string;
  assignment_id: string | null;
  assignments: AssignmentForNotification | null;
};

export const metadata: Metadata = {
  title: "通知 | WebCampus",
  description: "最新の課題や運営からの通知を確認できます。",
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

const statusColors: Record<string, string> = {
  unread: "#ffedd5",
  read: "#f4f4f5",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const canSendNotifications =
    roleData?.role === "teacher" || roleData?.role === "admin";

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      type,
      title,
      body,
      status,
      created_at,
      assignment_id,
      assignments:assignment_id (
        id,
        lesson_id,
        name,
        lessons (
          name
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      <header
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.75rem",
              color: "#a1a1aa",
              marginBottom: "0.4rem",
            }}
          >
            Notifications
          </p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 600, margin: 0 }}>
            通知センター
          </h1>
          <p style={{ color: "#71717a", marginTop: "0.4rem" }}>
            最新の課題情報や運営からのお知らせをここで確認できます。
          </p>
        </div>
        {canSendNotifications && (
          <NextLink
            href="/notifications/manage"
            style={{
              border: "1px solid #18181b",
              borderRadius: "999px",
              padding: "0.5rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#18181b",
              textDecoration: "none",
            }}
          >
            通知を送信
          </NextLink>
        )}
      </header>

      {error && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "1rem",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            marginBottom: "1rem",
          }}
        >
          通知の取得に失敗しました。時間をおいて再度お試しください。
        </div>
      )}

      {!notifications?.length && !error ? (
        <div
          style={{
            padding: "2.5rem",
            borderRadius: "1.5rem",
            border: "1px dashed #d4d4d8",
            textAlign: "center",
            color: "#71717a",
          }}
        >
          現在表示できる通知はありません。新しい通知が届くとここに表示されます。
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {notifications?.map((notification: NotificationRow) => (
            <li
              key={notification.id}
              style={{
                border: "1px solid #e4e4e7",
                borderRadius: "1.5rem",
                padding: "1.25rem 1.5rem",
                backgroundColor:
                  statusColors[notification.status] ?? "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: "0.65rem",
                      color: "#71717a",
                    }}
                  >
                    {notification.type}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#a1a1aa",
                    }}
                  >
                    {notification.status === "unread"
                      ? "未読"
                      : "既読"}
                  </span>
                </div>
                <time
                  style={{
                    fontSize: "0.8rem",
                    color: "#a1a1aa",
                  }}
                >
                  {formatDate(notification.created_at)}
                </time>
              </div>
              <h2
                style={{
                  margin: "0.5rem 0 0.2rem",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {notification.title}
              </h2>
              {notification.body && (
                <p
                  style={{
                    margin: 0,
                    color: "#52525b",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {notification.body}
                </p>
              )}
              {notification.assignments && (
                <NextLink
                  href={`/course/${notification.assignments.lesson_id}/assignment/${notification.assignments.id}`}
                  style={{
                    display: "inline-flex",
                    marginTop: "0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#2563eb",
                  }}
                >
                  » {notification.assignments.lessons?.name ?? "授業"} /{" "}
                  {notification.assignments.name} を開く
                </NextLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
