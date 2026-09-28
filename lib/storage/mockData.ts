import { Arc, Habit, HabitLog, Profile, Achievement, Group, Friendship } from "@/types/database";
import { addDays, formatDate, getTodayDateString } from "@/lib/utils";

export const SEED_PROFILE: Profile = {
  id: "user-veera-001",
  username: "veera",
  display_name: "Veera",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bio: "Discipline over motivation. Building my 90-day Winter Arc.",
  language: "en",
  timezone: "Asia/Kolkata",
  privacy: "friends",
  created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Start date 14 days ago so today is Day 15
export const SEED_START_DATE = formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
export const SEED_END_DATE = addDays(SEED_START_DATE, 90);

export const SEED_ARC: Arc = {
  id: "arc-winter-2026",
  user_id: SEED_PROFILE.id,
  template_id: "template-winter-arc",
  name: "Winter Arc 2026",
  description: "90 Days of cold discipline, morning focus, and physical mastery.",
  duration_days: 90,
  start_date: SEED_START_DATE,
  end_date: SEED_END_DATE,
  status: "active",
  privacy: "friends",
  created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const SEED_HABITS: Habit[] = [
  {
    id: "habit-1",
    arc_id: SEED_ARC.id,
    name: "Wake Up at 5:00 AM",
    description: "Rise early with purpose before dawn.",
    icon: "🌅",
    habit_type: "time",
    target_value: 5.0,
    target_unit: "AM",
    frequency: "daily",
    reminder_enabled: true,
    reminder_time: "04:55:00",
    sort_order: 1,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-2",
    arc_id: SEED_ARC.id,
    name: "Mindful Eating (No Phones)",
    description: "No social media or videos while eating meals.",
    icon: "📵",
    habit_type: "boolean",
    target_value: null,
    target_unit: null,
    frequency: "daily",
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 2,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-3",
    arc_id: SEED_ARC.id,
    name: "10,000 Steps",
    description: "Daily outdoor walk & physical movement.",
    icon: "🚶",
    habit_type: "number",
    target_value: 10000,
    target_unit: "steps",
    frequency: "daily",
    reminder_enabled: true,
    reminder_time: "18:00:00",
    sort_order: 3,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-4",
    arc_id: SEED_ARC.id,
    name: "Deep Skill / Coding",
    description: "60 minutes of uninterrupted craft mastery.",
    icon: "🎯",
    habit_type: "duration",
    target_value: 60,
    target_unit: "min",
    frequency: "daily",
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 4,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-5",
    arc_id: SEED_ARC.id,
    name: "Clean Eating (No Junk)",
    description: "Whole food diet. Zero junk food, soda, or fast foods.",
    icon: "🍔",
    habit_type: "boolean",
    target_value: null,
    target_unit: null,
    frequency: "daily",
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 5,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-6",
    arc_id: SEED_ARC.id,
    name: "Cold Water Discipline",
    description: "Cold shower for mental toughness and dopamine reset.",
    icon: "🚿",
    habit_type: "boolean",
    target_value: null,
    target_unit: null,
    frequency: "daily",
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 6,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-7",
    arc_id: SEED_ARC.id,
    name: "Book Reading",
    description: "Read philosophy, psychology, or high-value literature.",
    icon: "📖",
    habit_type: "duration",
    target_value: 30,
    target_unit: "min",
    frequency: "daily",
    reminder_enabled: true,
    reminder_time: "21:30:00",
    sort_order: 7,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
  {
    id: "habit-8",
    arc_id: SEED_ARC.id,
    name: "Sleep Before 11:00 PM",
    description: "Prioritize circadian rhythm and full muscle recovery.",
    icon: "🌙",
    habit_type: "time",
    target_value: 23.0,
    target_unit: "PM",
    frequency: "daily",
    reminder_enabled: true,
    reminder_time: "22:30:00",
    sort_order: 8,
    is_active: true,
    created_at: SEED_ARC.created_at,
    updated_at: SEED_ARC.created_at,
  },
];

// Generate past logs for days 1 to 14
export function generatePastLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = getTodayDateString();

  for (let i = 0; i < 14; i++) {
    const logDate = addDays(SEED_START_DATE, i);
    // Alternate days with high completion and occasional missed habit
    SEED_HABITS.forEach((habit, hIdx) => {
      // Habit completion pattern
      let completed = true;
      let val: number | null = null;

      // Make Day 5 have 1 missed habit (Clean Eating) to show realistic streak and calendar
      if (i === 4 && habit.id === "habit-5") {
        completed = false;
      }
      // Make Day 10 reading incomplete
      if (i === 9 && habit.id === "habit-7") {
        completed = false;
        val = 15;
      }

      if (habit.habit_type === "number") {
        val = completed ? 10450 + (i * 200) % 1500 : 6200;
      } else if (habit.habit_type === "duration") {
        val = completed ? (habit.target_value ?? 60) : 25;
      }

      logs.push({
        id: `log-${i}-${habit.id}`,
        habit_id: habit.id,
        user_id: SEED_PROFILE.id,
        log_date: logDate,
        value: val,
        completed,
        completed_at: completed ? new Date(logDate + "T20:00:00").toISOString() : null,
        notes: null,
        created_at: new Date(logDate + "T06:00:00").toISOString(),
        updated_at: new Date(logDate + "T20:00:00").toISOString(),
      });
    });
  }

  // Add today's partial completion (Day 15)
  // Complete 5 out of 8 habits today so user can interact and complete remaining!
  logs.push({
    id: `log-today-habit-1`,
    habit_id: "habit-1",
    user_id: SEED_PROFILE.id,
    log_date: today,
    value: null,
    completed: true,
    completed_at: new Date().toISOString(),
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  logs.push({
    id: `log-today-habit-2`,
    habit_id: "habit-2",
    user_id: SEED_PROFILE.id,
    log_date: today,
    value: null,
    completed: true,
    completed_at: new Date().toISOString(),
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  logs.push({
    id: `log-today-habit-3`,
    habit_id: "habit-3",
    user_id: SEED_PROFILE.id,
    log_date: today,
    value: 7842,
    completed: false, // 7,842 / 10,000 steps - user can increment to complete!
    completed_at: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  logs.push({
    id: `log-today-habit-4`,
    habit_id: "habit-4",
    user_id: SEED_PROFILE.id,
    log_date: today,
    value: 45, // 45 / 60 min coding
    completed: false,
    completed_at: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  logs.push({
    id: `log-today-habit-6`,
    habit_id: "habit-6",
    user_id: SEED_PROFILE.id,
    log_date: today,
    value: null,
    completed: true,
    completed_at: new Date().toISOString(),
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return logs;
}

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    code: "first_step",
    name: "First Step",
    description: "Complete your very first habit in your Arc.",
    icon: "🌱",
    requirement_type: "habits_completed",
    requirement_value: 1,
    xp_reward: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-2",
    code: "seven_days",
    name: "7 Days of Fire",
    description: "Maintain an unbroken streak for 7 consecutive days.",
    icon: "🔥",
    requirement_type: "streak_days",
    requirement_value: 7,
    xp_reward: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-3",
    code: "perfect_day",
    name: "Perfect Day",
    description: "Complete 100% of your daily habits in a single day.",
    icon: "💯",
    requirement_type: "perfect_days",
    requirement_value: 1,
    xp_reward: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-4",
    code: "thirty_days",
    name: "30-Day Milestone",
    description: "Complete 30 days of consistent discipline.",
    icon: "🗓️",
    requirement_type: "streak_days",
    requirement_value: 30,
    xp_reward: 500,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-5",
    code: "sixty_days",
    name: "60-Day Ascent",
    description: "Cross two continuous months of committed evolution.",
    icon: "🏔️",
    requirement_type: "streak_days",
    requirement_value: 60,
    xp_reward: 1000,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-6",
    code: "winter_legend",
    name: "Winter Legend",
    description: "Successfully conquer the complete 90-day Arc.",
    icon: "👑",
    requirement_type: "arc_completed",
    requirement_value: 90,
    xp_reward: 2000,
    created_at: new Date().toISOString(),
  },
  {
    id: "ach-7",
    code: "consistency",
    name: "Iron Consistency",
    description: "Complete habits at least 30 times total.",
    icon: "⚡",
    requirement_type: "habits_completed",
    requirement_value: 30,
    xp_reward: 250,
    created_at: new Date().toISOString(),
  },
];

export const SEED_FRIENDS: Profile[] = [
  {
    id: "user-arjun-002",
    username: "arjun_k",
    display_name: "Arjun K.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Day 24 / 90. No excuses, only execution.",
    language: "en",
    timezone: "Asia/Kolkata",
    privacy: "friends",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-sneha-003",
    username: "sneha_r",
    display_name: "Sneha Reddy",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Fitness Arc + Study Arc balance.",
    language: "te",
    timezone: "Asia/Kolkata",
    privacy: "friends",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-rohit-004",
    username: "rohit_sharma",
    display_name: "Rohit",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Digital Detox Arc — Reclaiming dopamine.",
    language: "hi",
    timezone: "Asia/Kolkata",
    privacy: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_GROUPS: Group[] = [
  {
    id: "group-cse-2026",
    owner_id: SEED_PROFILE.id,
    name: "CSE Winter Arc 2026",
    description: "Squad of dedicated engineers locked in for 90 days.",
    invite_code: "CSEARC90",
    privacy: "private",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members_count: 8,
    avg_completion: 82,
    group_streak: 14,
  },
  {
    id: "group-early-birds",
    owner_id: "user-arjun-002",
    name: "5 AM Club & Discipline",
    description: "Wake up early, move, build, conquer.",
    invite_code: "EARLY5AM",
    privacy: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members_count: 19,
    avg_completion: 78,
    group_streak: 9,
  },
];
