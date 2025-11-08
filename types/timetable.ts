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
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "R07［3I］プログラミング基礎",
      teacher: "情報システムコース 田中",
    },
    2: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "R07［3I］プログラミング基礎",
      teacher: "情報システムコース 田中",
    },
    3: {
      id: "550e8400-e29b-41d4-a716-4422533440000",
      name: "R07［3I］プログラミング基礎",
      teacher: "情報システムコース 田中",
    },
    4: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "R07［3I］プログラミング基礎",
      teacher: "情報システムコース 田中",
    },
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
