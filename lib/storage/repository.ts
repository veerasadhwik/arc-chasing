import { Arc, Habit, HabitLog, Profile, Achievement, UserAchievement, Group, XPEvent, HabitType } from "@/types/database";
import { SEED_PROFILE, SEED_ARC, SEED_HABITS, generatePastLogs, SEED_ACHIEVEMENTS, SEED_FRIENDS, SEED_GROUPS } from "./mockData";
import { getTodayDateString, isHabitCompleted } from "@/lib/utils";

const STORAGE_KEYS = {
  PROFILE: "winter_arc_profile",
  ARC: "winter_arc_current",
  HABITS: "winter_arc_habits",
  LOGS: "winter_arc_logs",
  XP: "winter_arc_total_xp",
  XP_EVENTS: "winter_arc_xp_events",
  USER_ACHIEVEMENTS: "winter_arc_user_achievements",
  FRIENDS: "winter_arc_friends",
  GROUPS: "winter_arc_groups",
  INITIALIZED: "winter_arc_seeded_v1",
};

export class StorageRepository {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  public static initialize(): void {
    if (!this.isBrowser()) return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.resetToDefaults();
    }
  }

  public static resetToDefaults(): void {
    if (!this.isBrowser()) return;

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
    localStorage.setItem(STORAGE_KEYS.ARC, JSON.stringify(SEED_ARC));
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(SEED_HABITS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(generatePastLogs()));
    localStorage.setItem(STORAGE_KEYS.XP, "840");

    const defaultEvents: XPEvent[] = [
      { id: "xp-1", user_id: SEED_PROFILE.id, event_type: "habit_completed", xp_amount: 140, created_at: new Date().toISOString() },
      { id: "xp-2", user_id: SEED_PROFILE.id, event_type: "streak_7", xp_amount: 100, created_at: new Date().toISOString() },
      { id: "xp-3", user_id: SEED_PROFILE.id, event_type: "perfect_day", xp_amount: 600, created_at: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.XP_EVENTS, JSON.stringify(defaultEvents));

    const defaultUserAchievements: UserAchievement[] = [
      { user_id: SEED_PROFILE.id, achievement_id: "ach-1", unlocked_at: new Date(Date.now() - 13 * 86400000).toISOString() },
      { user_id: SEED_PROFILE.id, achievement_id: "ach-2", unlocked_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { user_id: SEED_PROFILE.id, achievement_id: "ach-3", unlocked_at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { user_id: SEED_PROFILE.id, achievement_id: "ach-7", unlocked_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(defaultUserAchievements));
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(SEED_FRIENDS));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(SEED_GROUPS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
  }

  // Profile
  public static getProfile(): Profile {
    if (!this.isBrowser()) return SEED_PROFILE;
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : SEED_PROFILE;
  }

  public static updateProfile(updates: Partial<Profile>): Profile {
    const current = this.getProfile();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    }
    return updated;
  }

  // Arc
  public static getArc(): Arc {
    if (!this.isBrowser()) return SEED_ARC;
    const data = localStorage.getItem(STORAGE_KEYS.ARC);
    return data ? JSON.parse(data) : SEED_ARC;
  }

  public static saveArc(arc: Arc): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ARC, JSON.stringify(arc));
  }

  // Habits
  public static getHabits(): Habit[] {
    if (!this.isBrowser()) return SEED_HABITS;
    const data = localStorage.getItem(STORAGE_KEYS.HABITS);
    return data ? JSON.parse(data) : SEED_HABITS;
  }

  public static saveHabits(habits: Habit[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  public static addOrUpdateHabit(habitData: Partial<Habit> & { name: string; habit_type: HabitType }): Habit {
    const habits = this.getHabits();
    const arc = this.getArc();
    let habit: Habit;

    if (habitData.id) {
      const idx = habits.findIndex((h) => h.id === habitData.id);
      habit = {
        ...habits[idx],
        ...habitData,
        updated_at: new Date().toISOString(),
      };
      if (idx !== -1) {
        habits[idx] = habit;
      } else {
        habits.push(habit);
      }
    } else {
      habit = {
        id: `habit-${Date.now()}`,
        arc_id: arc.id,
        name: habitData.name,
        description: habitData.description || null,
        icon: habitData.icon || "❄️",
        habit_type: habitData.habit_type,
        target_value: habitData.target_value ?? null,
        target_unit: habitData.target_unit ?? null,
        frequency: habitData.frequency || "daily",
        reminder_enabled: !!habitData.reminder_enabled,
        reminder_time: habitData.reminder_time || null,
        sort_order: habits.length + 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      habits.push(habit);
    }

    this.saveHabits(habits);
    return habit;
  }

  public static deleteHabit(habitId: string): void {
    const habits = this.getHabits().filter((h) => h.id !== habitId);
    this.saveHabits(habits);
  }

  // Habit Logs
  public static getHabitLogs(): HabitLog[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  }

  public static saveHabitLogs(logs: HabitLog[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  /**
   * Primary mutation: logs habit value and completion status, calculates XP event
   */
  public static logHabit(
    habitId: string,
    logDate: string,
    completed: boolean,
    value: number | null = null,
    notes: string | null = null
  ): { log: HabitLog; xpAwarded: number; isPerfectDay: boolean } {
    const logs = this.getHabitLogs();
    const profile = this.getProfile();
    const habits = this.getHabits();
    const targetHabit = habits.find((h) => h.id === habitId);

    const existingIdx = logs.findIndex((l) => l.habit_id === habitId && l.log_date === logDate);
    const wasCompleted = existingIdx !== -1 ? logs[existingIdx].completed : false;

    let log: HabitLog;
    if (existingIdx !== -1) {
      log = {
        ...logs[existingIdx],
        completed,
        value: value !== null ? value : logs[existingIdx].value,
        notes: notes !== null ? notes : logs[existingIdx].notes,
        completed_at: completed ? (logs[existingIdx].completed_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      };
      logs[existingIdx] = log;
    } else {
      log = {
        id: `log-${Date.now()}-${habitId.slice(-4)}`,
        habit_id: habitId,
        user_id: profile.id,
        log_date: logDate,
        value,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      logs.push(log);
    }

    this.saveHabitLogs(logs);

    let xpAwarded = 0;
    let isPerfectDay = false;

    // Check if new completion
    if (!wasCompleted && completed) {
      xpAwarded += 10;
      this.addXP(10, "habit_completed", log.id);

      // Check if this makes today a Perfect Day
      const activeHabits = habits.filter((h) => h.is_active);
      const dayLogs = logs.filter((l) => l.log_date === logDate);
      const allDone = activeHabits.length > 0 && activeHabits.every((h) => {
        const l = dayLogs.find((dl) => dl.habit_id === h.id);
        return isHabitCompleted(h, l);
      });

      if (allDone) {
        isPerfectDay = true;
        xpAwarded += 100;
        this.addXP(100, "perfect_day", log.id);
        this.unlockAchievement("perfect_day");
      }

      this.unlockAchievement("first_step");
    }

    return { log, xpAwarded, isPerfectDay };
  }

  // XP & Levels
  public static getTotalXP(): number {
    if (!this.isBrowser()) return 840;
    const xp = localStorage.getItem(STORAGE_KEYS.XP);
    return xp ? parseInt(xp, 10) : 840;
  }

  public static getXPEvents(): XPEvent[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.XP_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  public static addXP(amount: number, eventType: XPEvent["event_type"], referenceId?: string): void {
    if (!this.isBrowser()) return;
    const current = this.getTotalXP();
    const updated = current + amount;
    localStorage.setItem(STORAGE_KEYS.XP, updated.toString());

    const events = this.getXPEvents();
    events.unshift({
      id: `xp-event-${Date.now()}`,
      user_id: this.getProfile().id,
      event_type: eventType,
      xp_amount: amount,
      reference_id: referenceId,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.XP_EVENTS, JSON.stringify(events.slice(0, 50)));
  }

  // Achievements
  public static getAchievements(): Achievement[] {
    return SEED_ACHIEVEMENTS;
  }

  public static getUserAchievements(): UserAchievement[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  }

  public static unlockAchievement(code: string): boolean {
    if (!this.isBrowser()) return false;
    const ach = SEED_ACHIEVEMENTS.find((a) => a.code === code);
    if (!ach) return false;

    const userAchs = this.getUserAchievements();
    const alreadyUnlocked = userAchs.some((ua) => ua.achievement_id === ach.id);
    if (alreadyUnlocked) return false;

    userAchs.push({
      user_id: this.getProfile().id,
      achievement_id: ach.id,
      unlocked_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(userAchs));

    if (ach.xp_reward > 0) {
      this.addXP(ach.xp_reward, "achievement", ach.id);
    }
    return true;
  }

  // Social: Friends
  public static getFriends(): Profile[] {
    if (!this.isBrowser()) return SEED_FRIENDS;
    const data = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    return data ? JSON.parse(data) : SEED_FRIENDS;
  }

  public static addFriend(username: string): { success: boolean; message: string; friend?: Profile } {
    const friends = this.getFriends();
    if (friends.some((f) => f.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: "Already in your friends list." };
    }

    const newFriend: Profile = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase().replace(/\s+/g, "_"),
      display_name: username,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: "Committed to the Arc.",
      language: "en",
      timezone: "Asia/Kolkata",
      privacy: "friends",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    friends.push(newFriend);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    }
    return { success: true, message: `Added ${username} as accountability partner!`, friend: newFriend };
  }

  public static removeFriend(friendId: string): void {
    const friends = this.getFriends().filter((f) => f.id !== friendId);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    }
  }

  // Groups
  public static getGroups(): Group[] {
    if (!this.isBrowser()) return SEED_GROUPS;
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return data ? JSON.parse(data) : SEED_GROUPS;
  }

  public static createGroup(name: string, description: string): Group {
    const groups = this.getGroups();
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      owner_id: this.getProfile().id,
      name,
      description,
      invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      privacy: "private",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members_count: 1,
      avg_completion: 100,
      group_streak: 1,
    };
    groups.push(newGroup);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    }
    return newGroup;
  }

  public static joinGroup(inviteCode: string): { success: boolean; message: string; group?: Group } {
    const groups = this.getGroups();
    const cleanCode = inviteCode.trim().toUpperCase();
    const target = groups.find((g) => g.invite_code.toUpperCase() === cleanCode);

    if (!target) {
      // Create a virtual squad for this valid code
      const joined: Group = {
        id: `group-code-${cleanCode}`,
        owner_id: "external-user",
        name: `Squad ${cleanCode}`,
        description: "Shared 90-day challenge squad.",
        invite_code: cleanCode,
        privacy: "private",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members_count: 5,
        avg_completion: 76,
        group_streak: 6,
      };
      groups.push(joined);
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      }
      return { success: true, message: `Successfully joined ${joined.name}!`, group: joined };
    }

    return { success: true, message: `You are already part of ${target.name}!`, group: target };
  }
}
