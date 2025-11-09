"use client";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
} from "@mui/material";

export type AssignmentWithLesson = {
  id: string;
  lesson_id: string;
  lesson_name: string;
  name: string;
  content_url: string;
  deadline: string;
  created_at: string;
  submitted?: boolean;
};

type Props = {
  assignments: AssignmentWithLesson[];
};

export default function AssignmentList({ assignments }: Props) {
  const calculateCountdown = (deadlineStr: string) => {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return "期限切れ";
    if (days >= 1) return `${days}日`;

    // 1日未満の場合は残り時間をHH:MM形式で表示
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Box
      sx={{
        width: "380px",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        padding: "16px",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="h6"
        sx={{ marginBottom: "16px", fontWeight: "bold" }}
      >
        課題一覧
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "50%" }}>
              課題
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
              残り時間
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: "20%", textAlign: "center" }}
            >
              状態
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
              >
                該当する課題はありません
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <Typography
                    sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5 }}
                  >
                    {assignment.lesson_name}
                  </Typography>
                  <Link
                    href={`/course/${assignment.lesson_id}/assignment/${assignment.id}`}
                    sx={{ fontSize: "14px" }}
                  >
                    {assignment.name}
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {calculateCountdown(assignment.deadline)}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: "12px" }}>
                  {assignment.submitted ? "提出済" : "未提出"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
