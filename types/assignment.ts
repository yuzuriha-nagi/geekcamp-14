export type Assignment = {
  id: number;
  lessonName: string;
  deadline: Date;
  submitted: boolean;
};

export const dummyAssignments: Assignment[] = [
  {
    id: 1,
    lessonName: "プログラミング基礎",
    deadline: new Date("2025-11-08T12:34:00"),
    submitted: false,
  },
];
