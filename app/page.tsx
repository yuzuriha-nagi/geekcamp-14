"use client";

import { useEffect, useMemo, useState } from "react";
import { dummyTimetable, Lesson } from "@/types/timetable";
import {
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import AssignmentList, {
  AssignmentWithLesson,
} from "@/components/AssignmentList";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const timetable = dummyTimetable;
  const periods = [1, 2, 3, 4, 5, 6];
  const days = [
    { label: "月曜日", value: 1 },
    { label: "火曜日", value: 2 },
    { label: "水曜日", value: 3 },
    { label: "木曜日", value: 4 },
    { label: "金曜日", value: 5 },
  ];

  const [assignments, setAssignments] = useState<AssignmentWithLesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "submitted" | "overdue"
  >("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAssignments([]);
        return;
      }

      const { data, error } = await supabase
        .from("assignments")
        .select(
          `
          id,
          lesson_id,
          name,
          content_url,
          deadline,
          created_at,
          lessons (
            name
          )
        `,
        )
        .order("deadline", { ascending: true });

      if (error || !data) {
        setAssignments([]);
        return;
      }

      const { data: submissions } = await supabase
        .from("submissions")
        .select("assignment_id")
        .eq("user_id", user.id);

      const submittedAssignmentIds = new Set(
        submissions?.map((s) => s.assignment_id) ?? [],
      );

      const assignmentsWithLesson: AssignmentWithLesson[] = data.map(
        (item: any) => ({
          id: item.id,
          lesson_id: item.lesson_id,
          lesson_name: item.lessons?.name ?? "不明な授業",
          name: item.name,
          content_url: item.content_url,
          deadline: item.deadline,
          created_at: item.created_at,
          submitted: submittedAssignmentIds.has(item.id),
        }),
      );

      setAssignments(assignmentsWithLesson);
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const now = new Date();

    return assignments.filter((assignment) => {
      const matchesSearch =
        normalizedTerm === "" ||
        assignment.name.toLowerCase().includes(normalizedTerm) ||
        assignment.lesson_name.toLowerCase().includes(normalizedTerm);

      const deadline = new Date(assignment.deadline);
      const isOverdue = deadline < now;
      let matchesStatus = true;

      switch (statusFilter) {
        case "pending":
          matchesStatus = !assignment.submitted && !isOverdue;
          break;
        case "submitted":
          matchesStatus = !!assignment.submitted;
          break;
        case "overdue":
          matchesStatus = !assignment.submitted && isOverdue;
          break;
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, statusFilter]);

  const handleFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value as
      | "all"
      | "pending"
      | "submitted"
      | "overdue";
    setStatusFilter(value);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        padding: "2rem",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "380px",
          }}
        >
          <TextField
            label="課題を検索"
            placeholder="キーワードで絞り込み"
            size="small"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <FormControl size="small">
            <InputLabel id="assignment-status-filter-label">状態</InputLabel>
            <Select
              labelId="assignment-status-filter-label"
              value={statusFilter}
              label="状態"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="pending">未提出（期限内）</MenuItem>
              <MenuItem value="overdue">未提出（期限切れ）</MenuItem>
              <MenuItem value="submitted">提出済</MenuItem>
            </Select>
          </FormControl>
        </div>
        <AssignmentList assignments={filteredAssignments} />
      </div>
      <Table sx={{ border: "1px solid #e0e0e0", width: "700px" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                borderRight: "1px solid #e0e0e0",
                backgroundColor: "#eaf4fc",
                width: "80px",
                height: "20px",
                padding: "8px",
              }}
            />
            {days.map((day, index) => (
              <TableCell
                key={day.value}
                align="center"
                sx={{
                  borderRight:
                    index < days.length - 1 ? "1px solid #e0e0e0" : "none",
                  backgroundColor: "#eaf4fc",
                  width: "800px",
                  height: "20px",
                  padding: "8px",
                }}
              >
                {day.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period}>
              <TableCell
                sx={{
                  borderRight: "1px solid #e0e0e0",
                  backgroundColor: "#eaf4fc",
                  width: "200px",
                  height: "10px",
                  padding: "0px",
                  textAlign: "center",
                }}
              >
                {period}限
              </TableCell>
              {days.map((day, index) => {
                const lesson = timetable[day.value]?.[period];
                return (
                  <TableCell
                    key={day.value}
                    sx={{
                      borderRight:
                        index < days.length - 1
                          ? "1px solid #e0e0e0"
                          : "none",
                      backgroundColor: lesson ? "transparent" : "#f0f0f0",
                      textAlign: "left",
                      verticalAlign: "top",
                      padding: "8px",
                    }}
                  >
                    {lessonLink(lesson)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function lessonLink(lesson: Lesson | null) {
  if (!lesson) return "";
  return (
    <>
      <Link href={`/course/${lesson.id}`} fontSize={16}>
        » {lesson.name}
      </Link>
      <br />
      <Typography
        fontSize={14}
        color="text.secondary"
        sx={{ paddingLeft: "20px" }}
      >
        担当: {lesson.teacher}
      </Typography>
    </>
  );
}
