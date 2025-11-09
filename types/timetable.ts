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
  },
  2: {
    4: {
      id: "94c1eaa7-e94b-4aa9-aa96-18f086cd0355",
      name: "R07［3I］電気回路",
      teacher: "情報システムコース 田中",
    },
  },
  3: {
    3: {
      id: "d055254a-d60e-434d-9757-087fc5eb47a0",
      name: "R07［3I］英語",
      teacher: "情報システムコース 田中",
    },
  },
  4: {
    3: {
      id: "5bc8787a-7740-4151-b3c7-68ebeabfeb65",
      name: "R07［3I］工学基礎実験",
      teacher: "情報システムコース 田中",
    },
    4: {
      id: "5bc8787a-7740-4151-b3c7-68ebeabfeb65",
      name: "R07［3I］工学基礎実験",
      teacher: "情報システムコース 田中",
    },
  },
  5: {
    1: {
      id: "fd19a904-304d-4acd-ae2c-0ab666960377",
      name: "R07［3I］現代文",
      teacher: "情報システムコース 田中",
    },
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
