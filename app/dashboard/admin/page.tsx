import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "管理者コンソール | WebCampass",
  description: "学生・教職員機能を横断的に管理するビュー",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
