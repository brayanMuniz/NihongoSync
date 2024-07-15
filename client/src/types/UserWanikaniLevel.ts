export type UserWanikaniLevel = {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    created_at: string;
    level: number;
    unlocked_at: string;
    started_at: string;
    passed_at: string | null;
    completed_at: string | null;
    abandoned_at: string | null;
  };
}[];

