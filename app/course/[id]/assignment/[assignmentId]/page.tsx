import { createClient } from "@/lib/supabase/server";
import { Assignment } from "@/types/assignment";
import { Lesson } from "@/types/lesson";
import { Submission } from "@/types/submission";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
} from "@mui/material";
import { notFound } from "next/navigation";
import SubmitAssignmentForm from "./SubmitAssignmentForm";

type Props = {
  params: Promise<{ id: string; assignmentId: string }>;
};

export default async function AssignmentDetailPage({ params }: Props) {
  const { id: lessonId, assignmentId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Get user role
  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const userRole = roleData?.role;
  const isTeacherOrAdmin = userRole === "teacher" || userRole === "admin";

  // Fetch lesson data
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single<Lesson>();

  if (lessonError || !lesson) {
    notFound();
  }

  // Fetch assignment data
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .single<Assignment>();

  if (assignmentError || !assignment) {
    notFound();
  }

  // Check if user has submitted
  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .eq("assignment_id", assignmentId)
    .maybeSingle<Submission>();

  // If teacher/admin, fetch all submissions
  let allSubmissions: Submission[] = [];
  if (isTeacherOrAdmin) {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    allSubmissions = (data || []) as Submission[];
  }

  const now = new Date();
  const deadline = new Date(assignment.deadline);
  const isOverdue = deadline < now;

  return (
    <Box sx={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Box sx={{ marginBottom: "1rem" }}>
        <Link href={`/course/${lessonId}`} underline="hover" sx={{ fontSize: "14px" }}>
          ← {lesson.name}に戻る
        </Link>
      </Box>

      {/* Assignment Information */}
      <Paper sx={{ padding: "2rem", marginBottom: "2rem" }}>
        <Typography variant="h4" sx={{ marginBottom: "1rem", fontWeight: "bold" }}>
          {assignment.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", marginBottom: "0.5rem" }}>
          授業: {lesson.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isOverdue ? "error.main" : "text.primary",
            fontWeight: isOverdue ? "bold" : "normal",
            marginBottom: "1rem",
          }}
        >
          締切:{" "}
          {new Date(assignment.deadline).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isOverdue && " (期限切れ)"}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={assignment.content_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          課題資料を開く
        </Button>
      </Paper>

      {/* Student View: Submission Form */}
      {!isTeacherOrAdmin && (
        <Paper sx={{ padding: "2rem", marginBottom: "2rem" }}>
          <Typography variant="h5" sx={{ marginBottom: "1.5rem", fontWeight: "bold" }}>
            課題提出
          </Typography>

          {submission ? (
            <Box>
              <Typography sx={{ marginBottom: "1rem", color: "success.main", fontWeight: "bold" }}>
                ✓ 提出済み
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "0.5rem" }}>
                ファイル名: {submission.file_name}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "0.5rem" }}>
                提出日時:{" "}
                {new Date(submission.submitted_at).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "1.5rem" }}>
                ファイルサイズ: {(submission.file_size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "1rem", color: "text.secondary" }}>
                再提出する場合は、以下のフォームから新しいファイルをアップロードしてください。
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ marginBottom: "1rem", color: "error.main" }}>
              未提出
            </Typography>
          )}

          <SubmitAssignmentForm
            assignmentId={assignmentId}
            userId={user.id}
            hasSubmission={!!submission}
          />
        </Paper>
      )}

      {/* Teacher/Admin View: Submissions List */}
      {isTeacherOrAdmin && (
        <Paper sx={{ padding: "2rem" }}>
          <Typography variant="h5" sx={{ marginBottom: "1.5rem", fontWeight: "bold" }}>
            提出状況 ({allSubmissions.length}件)
          </Typography>

          {allSubmissions.length === 0 ? (
            <Typography sx={{ color: "text.secondary", textAlign: "center", padding: "2rem" }}>
              まだ提出がありません
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "25%" }}>学生ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "30%" }}>ファイル名</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>提出日時</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>サイズ</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell sx={{ fontSize: "14px" }}>{sub.user_id.substring(0, 8)}...</TableCell>
                    <TableCell sx={{ fontSize: "14px" }}>{sub.file_name}</TableCell>
                    <TableCell sx={{ fontSize: "14px" }}>
                      {new Date(sub.submitted_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px" }}>
                      {(sub.file_size / 1024 / 1024).toFixed(2)} MB
                    </TableCell>
                    <TableCell>
                      <Link
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ fontSize: "14px" }}
                      >
                        ダウンロード
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}
    </Box>
  );
}
