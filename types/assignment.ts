export type Assignment = {
  id: number;
  lessonName: string;
  deadline: Date;
  submitted: boolean;
};

export const dummyAssignments: Assignment[] = [
  {
    id: 155,
    lessonName: "プログラミング基礎",
    deadline: new Date("2025-11-08T18:34:00"),
    submitted: false,
  },
];
