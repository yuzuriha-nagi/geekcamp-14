"use client";
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
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TimeTable() {
  const timetable = dummyTimetable;
  const periods = [1, 2, 3, 4, 5, 6];
  const days = [
    { label: "月曜日", value: 1 },
    { label: "火曜日", value: 2 },
    { label: "水曜日", value: 3 },
    { label: "木曜日", value: 4 },
    { label: "金曜日", value: 5 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <main style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Table
          sx={{ border: "1px solid #e0e0e0", width: "1000px", margin: "2rem" }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: "1px solid #e0e0e0",
                  backgroundColor: "#f5f5f5",
                  width: "80px",
                  height: "20px",
                  padding: "8px",
                }}
              ></TableCell>
              {days.map((day, index) => (
                <TableCell
                  key={day.value}
                  align="center"
                  sx={{
                    borderRight:
                      index < days.length - 1 ? "1px solid #e0e0e0" : "none",
                    backgroundColor: "#f5f5f5",
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
                    backgroundColor: "fafafa",
                    width: "100px",
                    height: "100px",
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
      </main>
      <Footer />
    </div>
  );
}

function lessonLink(lesson: Lesson | null) {
  if (!lesson) return "";
  return (
    <>
      <Link target="_blank" rel="noopener noreferrer" fontSize={17}>
        »{lesson.name}
      </Link>
      <br />
      <Typography
        fontSize={14}
        color="text.secondary"
        sx={{ paddingLeft: "16px" }}
      >
        担当: {lesson.teacher}
      </Typography>
    </>
  );
}
