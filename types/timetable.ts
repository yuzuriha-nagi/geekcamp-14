export type Lesson = {
  id: string;
  name: string;
  teacher: string;
  created_at?: string;
};

export type Timetable = {
  [key in number]: {
    [period in number]: Lesson | null;
  };
};

export const dummyTimetable: Timetable = {
  0: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  1: {
    1: {
      id: "1",
      name: "R07［3I］電気回路AI",
      teacher: "情報システムコース 田中",
    },
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  2: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  3: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  4: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  5: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
  6: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  },
};
