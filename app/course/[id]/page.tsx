import { createClient } from "@/lib/supabase/server";
import { Lesson } from "@/types/lesson";
import { Material } from "@/types/material";
import { Assignment } from "@/types/assignment";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
  Paper,
} from "@mui/material";
import { notFound } from "next/navigation";
import BookmarkToggle from "@/components/BookmarkToggle";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch lesson data
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single<Lesson>();

  if (lessonError || !lesson) {
    notFound();
  }

  // Fetch materials data (ordered by created_at DESC)
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("lesson_id", id)
    .order("created_at", { ascending: false });

  const materialsList = (materials || []) as Material[];

  // Fetch assignments data (ordered by deadline ASC)
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("lesson_id", id)
    .order("deadline", { ascending: true });

  const assignmentsList = (assignments || []) as Assignment[];

  let assignmentBookmarks = new Set<string>();
  let materialBookmarks = new Set<string>();

  if (user) {
    const [{ data: assignmentBookmarkRows }, { data: materialBookmarkRows }] =
      await Promise.all([
        supabase
          .from("assignment_bookmarks")
          .select("assignment_id")
          .eq("user_id", user.id),
        supabase
          .from("material_bookmarks")
          .select("material_id")
          .eq("user_id", user.id),
      ]);

    assignmentBookmarks = new Set(
      assignmentBookmarkRows?.map((row) => row.assignment_id) ?? [],
    );
    materialBookmarks = new Set(
      materialBookmarkRows?.map((row) => row.material_id) ?? [],
    );
  }

  return (
    <Box sx={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Lesson Information */}
      <Paper sx={{ padding: "2rem", marginBottom: "2rem" }}>
        <Typography
          variant="h4"
          sx={{ marginBottom: "1rem", fontWeight: "bold" }}
        >
          {lesson.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          担当: {lesson.teacher}
        </Typography>
      </Paper>

      {/* Materials List */}
      <Paper sx={{ padding: "2rem" }}>
        <Typography
          variant="h5"
          sx={{ marginBottom: "1.5rem", fontWeight: "bold" }}
        >
          授業資料一覧
        </Typography>

        {materialsList.length === 0 ? (
          <Typography
            sx={{
              color: "text.secondary",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            資料がまだ登録されていません
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "60%" }}>
                  資料名
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                  投稿日
                </TableCell>
                {user && (
                  <TableCell
                    sx={{ fontWeight: "bold", width: "60px", textAlign: "center" }}
                  >
                    ★
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {materialsList.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <Link
                      href={material.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: "16px" }}
                    >
                      {material.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px", color: "text.secondary" }}>
                    {new Date(material.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  {user && (
                    <TableCell sx={{ textAlign: "center" }}>
                      <BookmarkToggle
                        resourceType="material"
                        resourceId={material.id}
                        initialBookmarked={materialBookmarks.has(material.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Assignments List */}
      <Paper sx={{ padding: "2rem", marginTop: "2rem" }}>
        <Typography
          variant="h5"
          sx={{ marginBottom: "1.5rem", fontWeight: "bold" }}
        >
          課題一覧
        </Typography>

        {assignmentsList.length === 0 ? (
          <Typography
            sx={{
              color: "text.secondary",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            課題がまだ登録されていません
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                  課題名
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  締切
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  投稿日
                </TableCell>
                {user && (
                  <TableCell
                    sx={{ fontWeight: "bold", width: "60px", textAlign: "center" }}
                  >
                    ★
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {assignmentsList.map((assignment) => {
                const now = new Date();
                const deadline = new Date(assignment.deadline);
                const isOverdue = deadline < now;

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Link
                        href={`/course/${id}/assignment/${assignment.id}`}
                        sx={{ fontSize: "16px" }}
                      >
                        {assignment.name}
                      </Link>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        color: isOverdue ? "error.main" : "text.primary",
                        fontWeight: isOverdue ? "bold" : "normal",
                      }}
                    >
                      {new Date(assignment.deadline).toLocaleDateString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      {isOverdue && " (期限切れ)"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "text.secondary" }}>
                      {new Date(assignment.created_at).toLocaleDateString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )}
                    </TableCell>
                    {user && (
                      <TableCell sx={{ textAlign: "center" }}>
                        <BookmarkToggle
                          resourceType="assignment"
                          resourceId={assignment.id}
                          initialBookmarked={assignmentBookmarks.has(assignment.id)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
