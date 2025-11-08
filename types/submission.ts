export type Submission = {
  id: string;
  user_id: string;
  assignment_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  submitted_at: string;
  updated_at: string;
};

export type SubmissionInsert = Omit<
  Submission,
  'id' | 'submitted_at' | 'updated_at'
>;

export type SubmissionWithUser = Submission & {
  user_email?: string;
};
