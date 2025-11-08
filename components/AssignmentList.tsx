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
import { Assignment } from "@/types/assignment";

type Props = {
  assignments: Assignment[];
};

export default function AssignmentList({ assignments }: Props) {
  const calculateCountdown = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) return "期限切れ";
    if (days > 0) return `残り${days}日`;
    return `残り${hours}時間`;
  };

  return (
    <Box
      sx={{
        width: "350px",
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
            <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
              授業名
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
              期限
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: "30%", textAlign: "center" }}
            >
              提出
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <Link
                  href={"/course/" + assignment.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {assignment.lessonName}
                </Link>
              </TableCell>
              <TableCell sx={{ fontSize: "12px" }}>
                {calculateCountdown(assignment.deadline)}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontSize: "12px" }}>
                {assignment.submitted ? "提出済み" : "未提出"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
