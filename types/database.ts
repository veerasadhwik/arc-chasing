export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LanguageCode = 'en' | 'te' | 'hi';
export type PrivacySetting = 'private' | 'friends' | 'public';
export type HabitType = 'boolean' | 'number' | 'duration' | 'time' | 'percentage';
export type ArcStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: LanguageCode;
  timezone: string;
  privacy: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface ArcTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  default_duration_days: number;
  is_public: boolean;
  created_at: string;
}

export interface Arc {
  id: string;
  user_id: string;
  template_id?: string | null;
  name: string;
  description?: string | null;
  duration_days: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: ArcStatus;
  privacy: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  arc_id: string;
  name: string;
  description?: string | null;
  icon: string;
  habit_type: HabitType;
  target_value: number | null;
  target_unit: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  reminder_enabled: boolean;
  reminder_time: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  value: number | null;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  arc_id: string;
  summary_date: string;
  total_habits: number;
  completed_habits: number;
  completion_percentage: number;
  perfect_day: boolean;
  created_at: string;
}

export interface UserXP {
  user_id: string;
  total_xp: number;
  level: number;
  updated_at: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  event_type: 'habit_completed' | 'perfect_day' | 'streak_7' | 'streak_30' | 'arc_completed' | 'achievement';
  xp_amount: number;
  reference_id?: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Friendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  friend_profile?: Profile;
}

export interface Group {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  privacy: 'private' | 'public';
  created_at: string;
  updated_at: string;
  members_count?: number;
  avg_completion?: number;
  group_streak?: number;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface UserSettings {
  user_id: string;
  theme: ThemeMode;
  week_starts_on: number;
  updated_at: string;
}

export interface NotificationSettings {
  user_id: string;
  habit_reminders: boolean;
  streak_warnings: boolean;
  achievements: boolean;
  friend_requests: boolean;
  group_notifications: boolean;
  updated_at: string;
}
