"use client";

import { useEffect, useState } from "react";
import { dummyTimetable, Lesson } from "@/types/timetable";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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
        })
      );

      setAssignments(assignmentsWithLesson);
    };

    fetchAssignments();
  }, []);

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
      <AssignmentList assignments={assignments} />
      <Table sx={{ border: "1px solid #e0e0e0", width: "800px" }}>
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
                        index < days.length - 1 ? "1px solid #e0e0e0" : "none",
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
