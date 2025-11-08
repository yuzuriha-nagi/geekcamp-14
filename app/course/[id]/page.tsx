import { createClient } from "@/lib/supabase/server";
import { Lesson } from "@/types/lesson";
import { Material } from "@/types/material";
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

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

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
  const { data: materials, error: materialsError } = await supabase
    .from("materials")
    .select("*")
    .eq("lesson_id", id)
    .order("created_at", { ascending: false });

  const materialsList = (materials || []) as Material[];

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
