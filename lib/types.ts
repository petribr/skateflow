export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type SessionType = "casual" | "training" | "class";
export type ReportTarget = "user" | "session" | "comment";
export type ReportReason = "spam" | "harassment" | "inappropriate" | "other";

export type Profile = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  skill_level: SkillLevel;
  city: string | null;
  instagram: string | null;
};

export type Session = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location_name: string;
  lat: number;
  lng: number;
  starts_at: string;
  type: SessionType;
  max_participants: number | null;
  recurring_weekly: boolean;
  created_at: string;
};

export type SessionWithMeta = Session & {
  creator: Pick<Profile, "id" | "name" | "username" | "avatar_url">;
  attendee_count: number;
  is_attending: boolean;
};

export type Comment = {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: Pick<Profile, "name" | "username" | "avatar_url">;
};
