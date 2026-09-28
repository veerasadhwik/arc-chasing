import { Habit, HabitLog, HabitType } from './database';

export type { Habit, HabitLog, HabitType };

export interface HabitWithTodayLog extends Habit {
  todayLog?: HabitLog;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  completedDays: number;
  missedDays: number;
}

export interface HabitFormValues {
  name: string;
  description?: string;
  icon: string;
  habit_type: HabitType;
  target_value?: number;
  target_unit?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
}

export const DEFAULT_WINTER_ARC_HABITS: Omit<Habit, 'id' | 'arc_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: '🌅 Wake Up at 5:00 AM',
    description: 'Rise early with purpose before the world awakens.',
    icon: '🌅',
    habit_type: 'time',
    target_value: 5.0, // 05:00 AM
    target_unit: 'AM',
    frequency: 'daily',
    reminder_enabled: true,
    reminder_time: '04:55:00',
    sort_order: 1,
    is_active: true,
  },
  {
    name: '📵 Mindful Eating',
    description: 'Zero phone/social media screens during meals.',
    icon: '📵',
    habit_type: 'boolean',
    target_value: null,
    target_unit: null,
    frequency: 'daily',
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 2,
    is_active: true,
  },
  {
    name: '🚶 10K Steps',
    description: 'Daily outdoor walk and step count discipline.',
    icon: '🚶',
    habit_type: 'number',
    target_value: 10000,
    target_unit: 'steps',
    frequency: 'daily',
    reminder_enabled: true,
    reminder_time: '18:00:00',
    sort_order: 3,
    is_active: true,
  },
  {
    name: '📖 Reading Discipline',
    description: 'Read high-impact non-fiction/philosophy before sleeping.',
    icon: '📖',
    habit_type: 'duration',
    target_value: 30,
    target_unit: 'minutes',
    frequency: 'daily',
    reminder_enabled: true,
    reminder_time: '21:30:00',
    sort_order: 4,
    is_active: true,
  },
  {
    name: '🌙 Sleep Before 11:00 PM',
    description: 'Protect recovery and circadian rhythm every single night.',
    icon: '🌙',
    habit_type: 'time',
    target_value: 23.0, // 11:00 PM
    target_unit: 'PM',
    frequency: 'daily',
    reminder_enabled: true,
    reminder_time: '22:30:00',
    sort_order: 5,
    is_active: true,
  },
  {
    name: '🎯 Deep Skill Practice',
    description: 'Uninterrupted deep work on primary skill or craft.',
    icon: '🎯',
    habit_type: 'duration',
    target_value: 60,
    target_unit: 'minutes',
    frequency: 'daily',
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 6,
    is_active: true,
  },
  {
    name: '🍔 Clean Eating',
    description: 'No junk food, ultra-processed sugars, or sodas.',
    icon: '🍔',
    habit_type: 'boolean',
    target_value: null,
    target_unit: null,
    frequency: 'daily',
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 7,
    is_active: true,
  },
  {
    name: '🚿 Cold Water Discipline',
    description: 'Cold shower to build mental resilience and alertness.',
    icon: '🚿',
    habit_type: 'boolean',
    target_value: null,
    target_unit: null,
    frequency: 'daily',
    reminder_enabled: false,
    reminder_time: null,
    sort_order: 8,
    is_active: true,
  },
];
