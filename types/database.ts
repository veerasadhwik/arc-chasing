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

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythic';
export type BadgeCategory = 'streak' | 'arc' | 'performance' | 'discipline' | 'recovery' | 'secret';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  category?: BadgeCategory;
  rarity?: BadgeRarity;
  is_secret?: boolean;
  created_at: string;
}

export type Badge = Achievement;

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type FriendshipRelationState =
  | 'NOT_CONNECTED'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'FRIENDS'
  | 'BLOCKED';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
  updated_at: string;
  sender_profile?: Profile;
  receiver_profile?: Profile;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string | null;
  message: string;
  created_at: string;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'direct_message'
  | 'badge_unlocked'
  | 'level_up'
  | 'streak_milestone'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  link_url?: string;
  data?: Record<string, any>;
  created_at: string;
}

export interface Title {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  rarity: BadgeRarity;
  required_level?: number;
  required_streak?: number;
  required_achievement_code?: string;
}

export type QuestFrequency = 'daily' | 'weekly';
export type QuestActionType =
  | 'complete_habits'
  | 'perfect_day'
  | 'log_early'
  | 'send_friend_request'
  | 'cheer_group'
  | 'streak_day';

export interface Quest {
  id: string;
  title: string;
  description: string;
  frequency: QuestFrequency;
  xp_reward: number;
  target_count: number;
  action_type: QuestActionType;
}

export interface UserQuestProgress {
  user_id: string;
  quest_id: string;
  current_count: number;
  is_completed: boolean;
  is_claimed: boolean;
  period_key: string;
}

export type PlayerClassType =
  | 'Iron Monk'
  | 'Arc Vanguard'
  | 'Frost Sage'
  | 'Shadow Striker'
  | 'Titan Builder';

export interface PlayerProfileStats {
  user_id: string;
  player_class: PlayerClassType;
  equipped_title_id: string | null;
  profile_visibility: 'public' | 'friends' | 'private';
  friend_request_permission: 'everyone' | 'friends_of_friends' | 'none';
  message_permission: 'everyone' | 'friends_only' | 'none';
  blocked_user_ids: string[];
}

export interface ArcHistoryStamp {
  id: string;
  user_id: string;
  arc_id: string;
  arc_name: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  completion_rate: number;
  total_habits_completed: number;
  perfect_days: number;
  highest_streak: number;
  stamp_title: string;
  stamped_at: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details?: string;
  created_at: string;
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
