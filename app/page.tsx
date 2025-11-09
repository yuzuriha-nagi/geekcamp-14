"use client";

import { useEffect, useMemo, useState } from "react";
import { dummyTimetable, Lesson } from "@/types/timetable";
import {
  Box,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import AssignmentList, {
  AssignmentWithLesson,
} from "@/components/AssignmentList";
import { createClient } from "@/lib/supabase/client";

type AssignmentRow = {
  id: string;
  lesson_id: string;
  name: string;
  content_url: string;
  deadline: string;
  created_at: string;
  lessons: { name: string | null } | { name: string | null }[] | null;
};

type AssignmentBookmark = {
  assignments: {
    id: string;
    lesson_id: string;
    name: string;
    lessons: { name: string | null } | null;
  } | null;
};

type AssignmentBookmarkRow = {
  assignments: {
    id: string;
    lesson_id: string;
    name: string;
    lessons: { name: string | null } | { name: string | null }[] | null;
  } | null;
};

type MaterialBookmark = {
  materials: {
    id: string;
    name: string;
    content_url: string;
  } | null;
};

type MaterialBookmarkRow = {
  materials: {
    id: string;
    name: string;
    content_url: string;
  } | { id: string; name: string; content_url: string }[] | null;
};

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
  const [bookmarkedAssignments, setBookmarkedAssignments] = useState<
    AssignmentBookmark[]
  >([]);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<
    MaterialBookmark[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "submitted" | "overdue"
  >("all");
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    const weekday = today === 0 ? 7 : today;
    return weekday >= 1 && weekday <= 5 ? weekday : 1;
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAssignments([]);
        setBookmarkedAssignments([]);
        setBookmarkedMaterials([]);
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
        `
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
        submissions?.map((s) => s.assignment_id) ?? []
      );

      const assignmentsWithLesson: AssignmentWithLesson[] = (
        (data ?? []) as AssignmentRow[]
      ).map((item) => {
        const lessonsField = Array.isArray(item.lessons)
          ? item.lessons[0] ?? null
          : item.lessons ?? null;
        return {
          id: item.id,
          lesson_id: item.lesson_id,
          lesson_name: lessonsField?.name ?? "不明な授業",
          name: item.name,
          content_url: item.content_url,
          deadline: item.deadline,
          created_at: item.created_at,
          submitted: submittedAssignmentIds.has(item.id),
        };
      });
      setAssignments(assignmentsWithLesson);

      const [{ data: assignmentBookmarkRows }, { data: materialBookmarkRows }] =
        await Promise.all([
          supabase
            .from("assignment_bookmarks")
            .select(
              `
            assignments (
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
            .limit(10),
          supabase
            .from("material_bookmarks")
            .select(
              `
            materials (
              id,
              name,
              content_url
            )
          `,
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      const rawAssignmentBookmarks =
        (assignmentBookmarkRows ?? []) as unknown as AssignmentBookmarkRow[];
      const normalizedAssignmentBookmarks: AssignmentBookmark[] =
        rawAssignmentBookmarks.map((bookmark) => {
          const data = bookmark.assignments;
          if (!data) {
            return { assignments: null };
          }
          const lessonField = Array.isArray(data.lessons)
            ? data.lessons[0] ?? null
            : data.lessons ?? null;
          return {
            assignments: {
              id: data.id,
              lesson_id: data.lesson_id,
              name: data.name,
              lessons: lessonField,
            },
          };
        });

      const rawMaterialBookmarks =
        (materialBookmarkRows ?? []) as unknown as MaterialBookmarkRow[];
      const normalizedMaterialBookmarks: MaterialBookmark[] =
        rawMaterialBookmarks.map((bookmark) => {
          const data = bookmark.materials;
          if (!data) {
            return { materials: null };
          }
          const material =
            Array.isArray(data) && data.length > 0
              ? data[0]
              : Array.isArray(data)
                ? null
                : data;
          return {
            materials: material,
          };
        });

      setBookmarkedAssignments(normalizedAssignmentBookmarks);
      setBookmarkedMaterials(normalizedMaterialBookmarks);
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

  const selectedDayLabel =
    days.find((day) => day.value === selectedDay)?.label ?? "";
  const handleDayChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: number | null,
  ) => {
    if (value !== null) {
      setSelectedDay(value);
    }
  };
  const dayLessons = timetable[selectedDay] ?? {};

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: { xs: "1.5rem", md: "2rem" },
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e4e4e7",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: "1rem",
        }}
      >
        <TextField
          fullWidth
          label="課題を検索"
          placeholder="キーワードで絞り込み"
          size="small"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: "200px" } }}>
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
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e4e4e7",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {selectedDayLabel}の時間割
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={selectedDay}
            onChange={handleDayChange}
            sx={{ flexWrap: "wrap" }}
          >
            {days.map((day) => (
              <ToggleButton key={day.value} value={day.value}>
                {day.label.slice(0, 1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "90px",
                  backgroundColor: "#eaf4fc",
                  fontWeight: "bold",
                }}
              >
                コマ
              </TableCell>
              <TableCell sx={{ backgroundColor: "#eaf4fc", fontWeight: "bold" }}>
                授業
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map((period) => {
              const lesson =
                (dayLessons as Record<number, Lesson | null | undefined>)[period] ??
                null;
              return (
                <TableRow key={period}>
                  <TableCell
                    sx={{
                      width: "90px",
                      textAlign: "center",
                      borderRight: "1px solid #e4e4e7",
                    }}
                  >
                    {period}限
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: lesson ? "transparent" : "#f4f4f5" }}
                  >
                    {lessonLink(lesson)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: "1.5rem",
        }}
      >
        <AssignmentList assignments={filteredAssignments} />
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e4e4e7",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", marginBottom: "12px" }}
          >
            ブックマークした資料・課題
          </Typography>
          {!bookmarkedAssignments.length && !bookmarkedMaterials.length ? (
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              まだブックマークがありません。授業ページの★から追加できます。
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {bookmarkedAssignments.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "text.secondary", mb: 0.5 }}
                  >
                    課題
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                    }}
                  >
                    {bookmarkedAssignments.map((bookmark) => {
                      const assignment = bookmark.assignments;
                      if (!assignment) return null;
                      return (
                        <Box component="li" key={assignment.id}>
                          <Link
                            href={`/course/${assignment.lesson_id}/assignment/${assignment.id}`}
                            sx={{ fontSize: "0.95rem" }}
                          >
                            » {assignment.lessons?.name ?? "授業"} / {assignment.name}
                          </Link>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
              {bookmarkedMaterials.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "text.secondary", mb: 0.5 }}
                  >
                    資料
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                    }}
                  >
                    {bookmarkedMaterials.map((bookmark) => {
                      const material = bookmark.materials;
                      if (!material) return null;
                      return (
                        <Box component="li" key={material.id}>
                          <Link
                            href={material.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontSize: "0.95rem" }}
                          >
                            » {material.name}
                          </Link>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
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
