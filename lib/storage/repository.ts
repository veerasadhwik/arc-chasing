import {
  Arc,
  Habit,
  HabitLog,
  Profile,
  Achievement,
  UserAchievement,
  Group,
  XPEvent,
  HabitType,
  LanguageCode,
  PrivacySetting,
  FriendRequest,
  FriendshipRelationState,
  DirectMessage,
  GroupMessage,
  AppNotification,
  NotificationType,
  Title,
  Quest,
  QuestActionType,
  PlayerClassType,
  PlayerProfileStats,
  ArcHistoryStamp,
  UserReport,
} from "@/types/database";
import {
  CHALLENGE_TEMPLATES,
  SEED_ACHIEVEMENTS,
  SEED_FRIENDS,
  SEED_GROUPS,
  SEED_TITLES,
  SEED_QUESTS,
} from "./mockData";
import { getTodayDateString, isHabitCompleted, getBrowserTimezone, getLevelProgress } from "@/lib/utils";

export interface StoredAccount extends Profile {
  email: string;
  passwordHash: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

const STORAGE_KEYS = {
  USERS: "winter_arc_accounts_v2",
  SESSION: "winter_arc_session_v2",
  ARCS: "winter_arc_user_arcs_v2",
  HABITS: "winter_arc_habits_v2",
  LOGS: "winter_arc_user_logs_v2",
  XP_EVENTS: "winter_arc_user_xp_events_v2",
  USER_ACHIEVEMENTS: "winter_arc_user_achievements_v2",
  ACHIEVEMENTS: "winter_arc_achievements_v2",
  FRIENDS: "winter_arc_friends_v2",
  USER_FRIENDS: "winter_arc_user_friends_v2",
  GROUPS: "winter_arc_groups_v2",
  LEGACY_SEEDED: "winter_arc_seeded_v1",
  FRIEND_REQUESTS: "arc_chaser_friend_requests_v1",
  NOTIFICATIONS: "arc_chaser_notifications_v1",
  DIRECT_MESSAGES: "arc_chaser_direct_messages_v1",
  GROUP_MESSAGES: "arc_chaser_group_messages_v1",
  USER_PROFILES_EXTRA: "arc_chaser_user_profiles_extra_v1",
  TITLES: "arc_chaser_titles_v1",
  QUESTS: "arc_chaser_quests_v1",
  USER_QUESTS: "arc_chaser_user_quests_v1",
  ARC_HISTORY: "arc_chaser_arc_history_v1",
  BLOCKED_USERS: "arc_chaser_blocked_users_v1",
  REPORTS: "arc_chaser_reports_v1",
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export class StorageRepository {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  public static initialize(): void {
    if (!this.isBrowser()) return;

    // Purge legacy mock data if present
    if (localStorage.getItem(STORAGE_KEYS.LEGACY_SEEDED)) {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_SEEDED);
      localStorage.removeItem("winter_arc_profile");
      localStorage.removeItem("winter_arc_current");
      localStorage.removeItem("winter_arc_habits");
      localStorage.removeItem("winter_arc_logs");
      localStorage.removeItem("winter_arc_total_xp");
      localStorage.removeItem("winter_arc_xp_events");
      localStorage.removeItem("winter_arc_user_achievements");
    }

    const storedAchs = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!storedAchs || JSON.parse(storedAchs).length < SEED_ACHIEVEMENTS.length) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(SEED_ACHIEVEMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TITLES)) {
      localStorage.setItem(STORAGE_KEYS.TITLES, JSON.stringify(SEED_TITLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(SEED_QUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FRIENDS)) {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(SEED_FRIENDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(SEED_GROUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARCS)) {
      localStorage.setItem(STORAGE_KEYS.ARCS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.XP_EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.XP_EVENTS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_FRIENDS)) {
      localStorage.setItem(STORAGE_KEYS.USER_FRIENDS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUP_MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.GROUP_MESSAGES, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILES_EXTRA)) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES_EXTRA, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARC_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.ARC_HISTORY, JSON.stringify({}));
    }
  }

  public static getRawMap<T>(key: string): Record<string, T> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  public static setRawMap<T>(key: string, map: Record<string, T>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(map));
  }

  // ==========================================
  // AUTHENTICATION & SESSIONS
  // ==========================================
  public static getAccounts(): StoredAccount[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  public static saveAccounts(accounts: StoredAccount[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(accounts));
  }

  public static getSession(): StoredSession | null {
    if (!this.isBrowser()) return null;
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;
    try {
      const sess: StoredSession = JSON.parse(data);
      if (Date.now() > sess.expiresAt) {
        this.clearSession();
        return null;
      }
      return sess;
    } catch {
      return null;
    }
  }

  public static saveSession(userId: string): StoredSession {
    const session: StoredSession = {
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
    return session;
  }

  public static clearSession(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  public static getSessionUser(): Profile | null {
    const session = this.getSession();
    if (!session) return null;
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.id === session.userId);
    if (!account) return null;
    const { passwordHash, ...profile } = account;
    return profile;
  }

  public static registerAccount(
    name: string,
    email: string,
    password: string,
    language: LanguageCode = "en"
  ): { success: boolean; user?: Profile; error?: string } {
    const accounts = this.getAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (name.trim().toLowerCase().replace(/\s+/g, "_") || "warrior") + "_" + Math.floor(Math.random() * 899 + 100);

    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: StoredAccount = {
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      display_name: name.trim() || "Warrior",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: "Committed to the Arc.",
      language,
      timezone: getBrowserTimezone(),
      privacy: "private",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      passwordHash: simpleHash(`${cleanEmail}:${password}:arc_salt_v1`),
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);
    this.saveSession(userId);

    const { passwordHash, email: _e, ...profile } = newAccount;
    return { success: true, user: profile };
  }

  public static authenticateAccount(
    emailOrUser: string,
    password: string
  ): { success: boolean; user?: Profile; error?: string } {
    const accounts = this.getAccounts();
    const cleanInput = emailOrUser.trim().toLowerCase();

    const account = accounts.find(
      (a) => a.email.toLowerCase() === cleanInput || a.username.toLowerCase() === cleanInput
    );

    if (!account) {
      return { success: false, error: "Those details don't match an account." };
    }

    const expectedHash = simpleHash(`${account.email.toLowerCase()}:${password}:arc_salt_v1`);
    if (account.passwordHash !== expectedHash) {
      return { success: false, error: "Those details don't match an account." };
    }

    this.saveSession(account.id);
    const { passwordHash, ...profile } = account;
    return { success: true, user: profile };
  }

  public static updateProfile(userId: string, updates: Partial<Profile>): Profile | null {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx === -1) return null;

    accounts[idx] = {
      ...accounts[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveAccounts(accounts);

    const { passwordHash, ...profile } = accounts[idx];
    return profile;
  }

  // ==========================================
  // ARCS & HABITS (USER ISOLATED)
  // ==========================================
  private static getAllArcsMap(): Record<string, Arc[]> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(STORAGE_KEYS.ARCS);
    return data ? JSON.parse(data) : {};
  }

  private static saveAllArcsMap(map: Record<string, Arc[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ARCS, JSON.stringify(map));
  }

  public static getUserArcs(userId: string): Arc[] {
    const map = this.getAllArcsMap();
    return map[userId] || [];
  }

  public static getActiveArc(userId: string): Arc | null {
    const arcs = this.getUserArcs(userId);
    return arcs.find((a) => a.status === "active") || (arcs.length > 0 ? arcs[0] : null);
  }

  public static createArc(
    userId: string,
    arcData: Omit<Arc, "id" | "user_id" | "created_at" | "updated_at">,
    habitsData: Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">[]
  ): { arc: Arc; habits: Habit[] } {
    const map = this.getAllArcsMap();
    const userArcs = map[userId] || [];

    // Mark previous active arcs as completed or archived
    const updatedUserArcs = userArcs.map((a) =>
      a.status === "active" ? { ...a, status: "archived" as const, updated_at: new Date().toISOString() } : a
    );

    const arcId = `arc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newArc: Arc = {
      id: arcId,
      user_id: userId,
      template_id: arcData.template_id || null,
      name: arcData.name,
      description: arcData.description || null,
      duration_days: arcData.duration_days,
      start_date: arcData.start_date,
      end_date: arcData.end_date,
      status: arcData.status || "active",
      privacy: arcData.privacy || "private",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    updatedUserArcs.unshift(newArc);
    map[userId] = updatedUserArcs;
    this.saveAllArcsMap(map);

    // Save Habits for this arc
    const habitsMap = this.getAllHabitsMap();
    const newHabits: Habit[] = habitsData.slice(0, 10).map((h, i) => ({
      id: `habit_${Date.now()}_${i}`,
      arc_id: arcId,
      name: h.name,
      description: h.description || null,
      icon: h.icon || "❄️",
      habit_type: h.habit_type,
      target_value: h.target_value ?? null,
      target_unit: h.target_unit ?? null,
      frequency: h.frequency || "daily",
      reminder_enabled: !!h.reminder_enabled,
      reminder_time: h.reminder_time || null,
      sort_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    habitsMap[arcId] = newHabits;
    this.saveAllHabitsMap(habitsMap);

    return { arc: newArc, habits: newHabits };
  }

  public static updateArc(userId: string, arcId: string, updates: Partial<Arc>): Arc | null {
    const map = this.getAllArcsMap();
    const userArcs = map[userId] || [];
    const idx = userArcs.findIndex((a) => a.id === arcId);
    if (idx === -1) return null;

    const updated = {
      ...userArcs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    userArcs[idx] = updated;
    map[userId] = userArcs;
    this.saveAllArcsMap(map);
    return updated;
  }

  public static deleteArc(userId: string, arcId: string): void {
    const map = this.getAllArcsMap();
    if (map[userId]) {
      map[userId] = map[userId].filter((a) => a.id !== arcId);
      this.saveAllArcsMap(map);
    }
    const habitsMap = this.getAllHabitsMap();
    delete habitsMap[arcId];
    this.saveAllHabitsMap(habitsMap);
  }

  // Habits Map
  private static getAllHabitsMap(): Record<string, Habit[]> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(STORAGE_KEYS.HABITS);
    return data ? JSON.parse(data) : {};
  }

  private static saveAllHabitsMap(map: Record<string, Habit[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(map));
  }

  public static getHabits(arcId: string): Habit[] {
    const map = this.getAllHabitsMap();
    return map[arcId] || [];
  }

  public static addOrUpdateHabit(
    arcId: string,
    habitData: Partial<Habit> & { name: string; habit_type: HabitType }
  ): Habit {
    const habitsMap = this.getAllHabitsMap();
    const habits = habitsMap[arcId] || [];
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
        id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        arc_id: arcId,
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

    habitsMap[arcId] = habits;
    this.saveAllHabitsMap(habitsMap);
    return habit;
  }

  public static deleteHabit(arcId: string, habitId: string): void {
    const habitsMap = this.getAllHabitsMap();
    if (habitsMap[arcId]) {
      habitsMap[arcId] = habitsMap[arcId].filter((h) => h.id !== habitId);
      this.saveAllHabitsMap(habitsMap);
    }
  }

  // ==========================================
  // HABIT LOGS (SOURCE OF TRUTH)
  // ==========================================
  private static getAllLogsMap(): Record<string, HabitLog[]> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : {};
  }

  private static saveAllLogsMap(map: Record<string, HabitLog[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(map));
  }

  public static getUserHabitLogs(userId: string): HabitLog[] {
    const map = this.getAllLogsMap();
    return map[userId] || [];
  }

  public static logHabit(
    userId: string,
    arcId: string,
    habitId: string,
    logDate: string,
    completed: boolean,
    value: number | null = null,
    notes: string | null = null
  ): { log: HabitLog; xpAwarded: number; isPerfectDay: boolean } {
    const logsMap = this.getAllLogsMap();
    const userLogs = logsMap[userId] || [];
    const habits = this.getHabits(arcId);

    const existingIdx = userLogs.findIndex((l) => l.habit_id === habitId && l.log_date === logDate);
    const wasCompleted = existingIdx !== -1 ? userLogs[existingIdx].completed : false;

    let log: HabitLog;
    if (existingIdx !== -1) {
      log = {
        ...userLogs[existingIdx],
        completed,
        value: value !== null ? value : userLogs[existingIdx].value,
        notes: notes !== null ? notes : userLogs[existingIdx].notes,
        completed_at: completed ? userLogs[existingIdx].completed_at || new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      userLogs[existingIdx] = log;
    } else {
      log = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        habit_id: habitId,
        user_id: userId,
        log_date: logDate,
        value,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      userLogs.push(log);
    }

    logsMap[userId] = userLogs;
    this.saveAllLogsMap(logsMap);

    let xpAwarded = 0;
    let isPerfectDay = false;

    // Award XP if state transitioned from uncompleted to completed
    if (!wasCompleted && completed) {
      xpAwarded += 10;
      this.addXP(userId, 10, "habit_completed", log.id);

      // Check if all active habits are completed today
      const activeHabits = habits.filter((h) => h.is_active);
      const dayLogs = userLogs.filter((l) => l.log_date === logDate);
      const allDone =
        activeHabits.length > 0 &&
        activeHabits.every((h) => {
          const l = dayLogs.find((dl) => dl.habit_id === h.id);
          return isHabitCompleted(h, l);
        });

      if (allDone) {
        isPerfectDay = true;
        xpAwarded += 100;
        this.addXP(userId, 100, "perfect_day", log.id);
        this.unlockAchievement(userId, "perfect_day");
        this.recordQuestAction(userId, "perfect_day", 1);
      }

      this.unlockAchievement(userId, "first_step");

      // Check total completed habits milestones
      const totalCompleted = userLogs.filter((l) => l.completed).length;
      if (totalCompleted >= 30) this.unlockAchievement(userId, "consistency");
      if (totalCompleted >= 100) this.unlockAchievement(userId, "century_habits");
      if (totalCompleted >= 300) this.unlockAchievement(userId, "unstoppable_force");

      // Check midnight discipline (00:00 - 03:59)
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 4) {
        this.unlockAchievement(userId, "midnight_discipline");
      }
      if (hour < 12) {
        this.recordQuestAction(userId, "log_early", 1);
      }

      this.recordQuestAction(userId, "complete_habits", 1);
    }

    return { log, xpAwarded, isPerfectDay };
  }

  // ==========================================
  // XP & ACHIEVEMENTS (USER ISOLATED)
  // ==========================================
  private static getAllXPEventsMap(): Record<string, XPEvent[]> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(STORAGE_KEYS.XP_EVENTS);
    return data ? JSON.parse(data) : {};
  }

  private static saveAllXPEventsMap(map: Record<string, XPEvent[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.XP_EVENTS, JSON.stringify(map));
  }

  public static getUserXPEvents(userId: string): XPEvent[] {
    const map = this.getAllXPEventsMap();
    return map[userId] || [];
  }

  public static getXPEvents(userId?: string): XPEvent[] {
    if (userId) return this.getUserXPEvents(userId);
    const session = this.getSession();
    return session ? this.getUserXPEvents(session.userId) : [];
  }

  public static getUserXP(userId: string): number {
    const events = this.getUserXPEvents(userId);
    return events.reduce((sum, e) => sum + (e.xp_amount || 0), 0);
  }

  public static addXP(
    userId: string,
    amount: number,
    eventType: XPEvent["event_type"],
    referenceId?: string
  ): void {
    const currentXp = this.getUserXP(userId);
    const currentLevel = getLevelProgress(currentXp).level;

    const map = this.getAllXPEventsMap();
    const userEvents = map[userId] || [];
    const event: XPEvent = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      event_type: eventType,
      xp_amount: amount,
      reference_id: referenceId,
      created_at: new Date().toISOString(),
    };
    userEvents.unshift(event);
    map[userId] = userEvents.slice(0, 100);
    this.saveAllXPEventsMap(map);

    const newLevel = getLevelProgress(currentXp + amount).level;
    if (newLevel > currentLevel) {
      this.createNotification(
        userId,
        "level_up",
        `Level Up! Reached Rank ${newLevel}`,
        `Congratulations! You ascended to Discipline Level ${newLevel}. Keep climbing!`,
        "/profile",
        { level: newLevel }
      );
    }
  }

  // Achievements / Badges
  public static getAchievements(): Achievement[] {
    if (!this.isBrowser()) return SEED_ACHIEVEMENTS;
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : SEED_ACHIEVEMENTS;
  }

  private static getAllUserAchievementsMap(): Record<string, UserAchievement[]> {
    if (!this.isBrowser()) return {};
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
    return data ? JSON.parse(data) : {};
  }

  private static saveAllUserAchievementsMap(map: Record<string, UserAchievement[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(map));
  }

  public static getUserAchievements(userId: string): UserAchievement[] {
    const map = this.getAllUserAchievementsMap();
    return map[userId] || [];
  }

  public static unlockAchievement(userId: string, code: string): boolean {
    const achs = this.getAchievements();
    const target = achs.find((a) => a.code === code);
    if (!target) return false;

    const map = this.getAllUserAchievementsMap();
    const userAchs = map[userId] || [];
    if (userAchs.some((ua) => ua.achievement_id === target.id)) {
      return false; // already unlocked
    }

    userAchs.push({
      user_id: userId,
      achievement_id: target.id,
      unlocked_at: new Date().toISOString(),
    });
    map[userId] = userAchs;
    this.saveAllUserAchievementsMap(map);

    if (target.xp_reward > 0) {
      this.addXP(userId, target.xp_reward, "achievement", target.id);
    }

    this.createNotification(
      userId,
      "badge_unlocked",
      `Badge Unlocked: ${target.name}!`,
      `You earned "${target.name}". +${target.xp_reward} XP awarded.`,
      "/achievements",
      { achievement_id: target.id }
    );

    return true;
  }

  // ==========================================
  // TITLES & QUESTS
  // ==========================================
  public static getTitles(): Title[] {
    if (!this.isBrowser()) return SEED_TITLES;
    const data = localStorage.getItem(STORAGE_KEYS.TITLES);
    return data ? JSON.parse(data) : SEED_TITLES;
  }

  public static getUserUnlockedTitles(userId: string): Title[] {
    const titles = this.getTitles();
    const xp = this.getUserXP(userId);
    const level = getLevelProgress(xp).level;
    const userAchs = this.getUserAchievements(userId);
    const achIds = new Set(userAchs.map((u) => u.achievement_id));
    const allAchs = this.getAchievements();
    const unlockedCodes = new Set(
      allAchs.filter((a) => achIds.has(a.id)).map((a) => a.code)
    );

    // Get highest streak from active arc if any
    const arcs = this.getUserArcs(userId);
    const activeArc = arcs.find((a) => a.status === "active") || arcs[0];
    const logs = this.getUserHabitLogs(userId);
    const habits = activeArc ? this.getHabits(activeArc.id) : [];
    const dates = Array.from(new Set(logs.filter((l) => l.completed).map((l) => l.log_date)));
    const maxStreak = Math.max(dates.length, 0);

    return titles.filter((title) => {
      if (title.id === "title-initiate") return true;
      if (title.required_level && level >= title.required_level) return true;
      if (title.required_streak && maxStreak >= title.required_streak) return true;
      if (title.required_achievement_code && unlockedCodes.has(title.required_achievement_code)) return true;
      return false;
    });
  }

  public static equipTitle(userId: string, titleId: string | null): void {
    this.updatePlayerProfileStats(userId, { equipped_title_id: titleId });
  }

  public static getQuests(): Quest[] {
    if (!this.isBrowser()) return SEED_QUESTS;
    const data = localStorage.getItem(STORAGE_KEYS.QUESTS);
    return data ? JSON.parse(data) : SEED_QUESTS;
  }

  private static getAllUserQuestsMap(): Record<string, Record<string, { current: number; completed: boolean; claimed: boolean }>> {
    return this.getRawMap(STORAGE_KEYS.USER_QUESTS);
  }

  public static getUserQuests(userId: string): Array<Quest & { current_count: number; is_completed: boolean; is_claimed: boolean }> {
    const quests = this.getQuests();
    const map = this.getAllUserQuestsMap();
    const today = getTodayDateString();
    const userMap = map[userId] || {};

    return quests.map((q) => {
      const periodKey = q.frequency === "daily" ? `${q.id}_${today}` : `${q.id}_week`;
      const record = userMap[periodKey] || { current: 0, completed: false, claimed: false };
      return {
        ...q,
        current_count: record.current,
        is_completed: record.completed || record.current >= q.target_count,
        is_claimed: record.claimed,
      };
    });
  }

  public static recordQuestAction(userId: string, actionType: QuestActionType, count: number = 1): void {
    const quests = this.getQuests();
    const matching = quests.filter((q) => q.action_type === actionType);
    if (matching.length === 0) return;

    const map = this.getAllUserQuestsMap();
    if (!map[userId]) map[userId] = {};
    const today = getTodayDateString();

    matching.forEach((q) => {
      const periodKey = q.frequency === "daily" ? `${q.id}_${today}` : `${q.id}_week`;
      const current = map[userId][periodKey] || { current: 0, completed: false, claimed: false };
      const nextCount = current.current + count;
      const isCompleted = nextCount >= q.target_count;
      map[userId][periodKey] = {
        current: nextCount,
        completed: isCompleted,
        claimed: current.claimed,
      };
    });

    this.setRawMap(STORAGE_KEYS.USER_QUESTS, map);
  }

  public static claimQuestReward(userId: string, questId: string): { success: boolean; xpAwarded: number } {
    const quests = this.getQuests();
    const target = quests.find((q) => q.id === questId);
    if (!target) return { success: false, xpAwarded: 0 };

    const map = this.getAllUserQuestsMap();
    if (!map[userId]) return { success: false, xpAwarded: 0 };
    const today = getTodayDateString();
    const periodKey = target.frequency === "daily" ? `${target.id}_${today}` : `${target.id}_week`;
    const record = map[userId][periodKey];

    if (!record || !record.completed || record.claimed) {
      return { success: false, xpAwarded: 0 };
    }

    record.claimed = true;
    map[userId][periodKey] = record;
    this.setRawMap(STORAGE_KEYS.USER_QUESTS, map);

    this.addXP(userId, target.xp_reward, "achievement", target.id);
    this.createNotification(
      userId,
      "badge_unlocked",
      `Quest Completed: ${target.title}`,
      `+${target.xp_reward} XP claimed for completing "${target.title}".`,
      "/dashboard"
    );

    return { success: true, xpAwarded: target.xp_reward };
  }

  // ==========================================
  // PLAYER PROFILE & MODERATION
  // ==========================================
  public static getPlayerProfileStats(userId: string): PlayerProfileStats {
    const map = this.getRawMap<PlayerProfileStats>(STORAGE_KEYS.USER_PROFILES_EXTRA);
    if (!map[userId]) {
      map[userId] = {
        user_id: userId,
        player_class: "Iron Monk",
        equipped_title_id: "title-initiate",
        profile_visibility: "public",
        friend_request_permission: "everyone",
        message_permission: "everyone",
        blocked_user_ids: [],
      };
      this.setRawMap(STORAGE_KEYS.USER_PROFILES_EXTRA, map);
    }
    return map[userId];
  }

  public static updatePlayerProfileStats(
    userId: string,
    updates: Partial<PlayerProfileStats>
  ): PlayerProfileStats {
    const map = this.getRawMap<PlayerProfileStats>(STORAGE_KEYS.USER_PROFILES_EXTRA);
    const existing = this.getPlayerProfileStats(userId);
    const updated: PlayerProfileStats = { ...existing, ...updates, user_id: userId };
    map[userId] = updated;
    this.setRawMap(STORAGE_KEYS.USER_PROFILES_EXTRA, map);
    return updated;
  }

  public static setPlayerClass(userId: string, playerClass: PlayerClassType): void {
    this.updatePlayerProfileStats(userId, { player_class: playerClass });
  }

  public static getProfileById(userId: string): Profile | null {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === userId);
    if (acc) {
      const { passwordHash, ...profile } = acc;
      return profile;
    }
    const seed = SEED_FRIENDS.find((s) => s.id === userId);
    if (seed) return seed;
    return null;
  }

  public static getProfileByUsername(username: string): Profile | null {
    const clean = username.trim().toLowerCase();
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.username.toLowerCase() === clean);
    if (acc) {
      const { passwordHash, ...profile } = acc;
      return profile;
    }
    const seed = SEED_FRIENDS.find((s) => s.username.toLowerCase() === clean);
    if (seed) return seed;
    return null;
  }

  public static blockUser(currentUserId: string, targetUserId: string): void {
    const stats = this.getPlayerProfileStats(currentUserId);
    const blocked = new Set(stats.blocked_user_ids || []);
    blocked.add(targetUserId);
    this.updatePlayerProfileStats(currentUserId, { blocked_user_ids: Array.from(blocked) });
    this.removeFriend(targetUserId, currentUserId);
  }

  public static unblockUser(currentUserId: string, targetUserId: string): void {
    const stats = this.getPlayerProfileStats(currentUserId);
    const blocked = (stats.blocked_user_ids || []).filter((id) => id !== targetUserId);
    this.updatePlayerProfileStats(currentUserId, { blocked_user_ids: blocked });
  }

  public static isUserBlocked(currentUserId: string, targetUserId: string): boolean {
    const myStats = this.getPlayerProfileStats(currentUserId);
    if (myStats.blocked_user_ids?.includes(targetUserId)) return true;
    const theirStats = this.getPlayerProfileStats(targetUserId);
    if (theirStats.blocked_user_ids?.includes(currentUserId)) return true;
    return false;
  }

  public static getBlockedUserIds(currentUserId: string): string[] {
    return this.getPlayerProfileStats(currentUserId).blocked_user_ids || [];
  }

  public static reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string): void {
    const reports = this.getRawMap<UserReport[]>(STORAGE_KEYS.REPORTS);
    const list = reports["all"] || [];
    list.push({
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      details,
      created_at: new Date().toISOString(),
    });
    reports["all"] = list;
    this.setRawMap(STORAGE_KEYS.REPORTS, reports);
  }

  // ==========================================
  // SOCIAL & FRIEND REQUESTS (REAL STATES)
  // ==========================================
  public static getAllFriendRequests(): FriendRequest[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  public static saveAllFriendRequests(reqs: FriendRequest[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(reqs));
  }

  public static getFriendshipRelation(userId: string, targetUserId: string): FriendshipRelationState {
    if (this.isUserBlocked(userId, targetUserId)) return "BLOCKED";
    const friends = this.getUserFriends(userId);
    if (friends.some((f) => f.id === targetUserId)) return "FRIENDS";

    const reqs = this.getAllFriendRequests();
    const sent = reqs.find((r) => r.sender_id === userId && r.receiver_id === targetUserId && r.status === "pending");
    if (sent) return "REQUEST_SENT";

    const received = reqs.find((r) => r.sender_id === targetUserId && r.receiver_id === userId && r.status === "pending");
    if (received) return "REQUEST_RECEIVED";

    return "NOT_CONNECTED";
  }

  public static sendFriendRequest(
    senderId: string,
    receiverId: string
  ): { success: boolean; message: string; request?: FriendRequest } {
    if (senderId === receiverId) {
      return { success: false, message: "You cannot add yourself as a friend." };
    }
    if (this.isUserBlocked(senderId, receiverId)) {
      return { success: false, message: "Cannot connect with this user." };
    }

    const targetStats = this.getPlayerProfileStats(receiverId);
    if (targetStats.friend_request_permission === "none") {
      return { success: false, message: "This user does not accept friend requests." };
    }

    const relation = this.getFriendshipRelation(senderId, receiverId);
    if (relation === "FRIENDS") {
      return { success: false, message: "Already in your circle." };
    }
    if (relation === "REQUEST_SENT") {
      return { success: false, message: "Friend request is already pending." };
    }

    const reqs = this.getAllFriendRequests();
    // Check if the other person already sent a request to us
    const existingIncoming = reqs.find(
      (r) => r.sender_id === receiverId && r.receiver_id === senderId && r.status === "pending"
    );
    if (existingIncoming) {
      const res = this.acceptFriendRequest(existingIncoming.id, senderId);
      return { success: res.success, message: res.message };
    }

    const senderProfile = this.getProfileById(senderId);
    const newReq: FriendRequest = {
      id: `freq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_profile: senderProfile || undefined,
    };
    reqs.push(newReq);
    this.saveAllFriendRequests(reqs);

    this.createNotification(
      receiverId,
      "friend_request",
      "New Friend Request",
      `${senderProfile?.display_name || senderProfile?.username || "A challenger"} sent you an accountability request.`,
      "/friends",
      { request_id: newReq.id, sender_id: senderId }
    );

    this.recordQuestAction(senderId, "send_friend_request", 1);

    return { success: true, message: "Friend request sent!", request: newReq };
  }

  public static acceptFriendRequest(
    requestId: string,
    currentUserId: string
  ): { success: boolean; message: string; friend?: Profile } {
    const reqs = this.getAllFriendRequests();
    const req = reqs.find((r) => r.id === requestId);
    if (!req || req.status !== "pending") {
      return { success: false, message: "Request not found or already resolved." };
    }
    if (req.receiver_id !== currentUserId) {
      return { success: false, message: "Unauthorized." };
    }

    req.status = "accepted";
    req.updated_at = new Date().toISOString();
    this.saveAllFriendRequests(reqs);

    // Mutual friend addition
    const senderProfile = this.getProfileById(req.sender_id);
    const receiverProfile = this.getProfileById(req.receiver_id);

    if (senderProfile) {
      const myFriendsMap = this.getRawMap<Profile[]>(STORAGE_KEYS.USER_FRIENDS);
      const myFriends = myFriendsMap[currentUserId] ? [...myFriendsMap[currentUserId]] : [...SEED_FRIENDS];
      if (!myFriends.some((f) => f.id === senderProfile.id)) {
        myFriends.push(senderProfile);
        myFriendsMap[currentUserId] = myFriends;
        this.setRawMap(STORAGE_KEYS.USER_FRIENDS, myFriendsMap);
      }
    }

    if (receiverProfile) {
      const theirFriendsMap = this.getRawMap<Profile[]>(STORAGE_KEYS.USER_FRIENDS);
      const theirFriends = theirFriendsMap[req.sender_id] ? [...theirFriendsMap[req.sender_id]] : [...SEED_FRIENDS];
      if (!theirFriends.some((f) => f.id === receiverProfile.id)) {
        theirFriends.push(receiverProfile);
        theirFriendsMap[req.sender_id] = theirFriends;
        this.setRawMap(STORAGE_KEYS.USER_FRIENDS, theirFriendsMap);
      }
    }

    this.createNotification(
      req.sender_id,
      "friend_accepted",
      "Friend Request Accepted! 🤝",
      `${receiverProfile?.display_name || receiverProfile?.username || "A challenger"} accepted your friend request.`,
      "/friends",
      { friend_id: currentUserId }
    );

    return {
      success: true,
      message: `You and ${senderProfile?.display_name || senderProfile?.username} are now connected!`,
      friend: senderProfile || undefined,
    };
  }

  public static declineFriendRequest(requestId: string, currentUserId: string): { success: boolean; message: string } {
    const reqs = this.getAllFriendRequests();
    const req = reqs.find((r) => r.id === requestId);
    if (!req) return { success: false, message: "Request not found." };
    if (req.receiver_id !== currentUserId) return { success: false, message: "Unauthorized." };

    req.status = "declined";
    req.updated_at = new Date().toISOString();
    this.saveAllFriendRequests(reqs);

    return { success: true, message: "Request declined." };
  }

  public static cancelFriendRequest(requestId: string, senderId: string): { success: boolean; message: string } {
    const reqs = this.getAllFriendRequests();
    const req = reqs.find((r) => r.id === requestId);
    if (!req) return { success: false, message: "Request not found." };
    if (req.sender_id !== senderId) return { success: false, message: "Unauthorized." };

    req.status = "cancelled";
    req.updated_at = new Date().toISOString();
    this.saveAllFriendRequests(reqs);

    return { success: true, message: "Request cancelled." };
  }

  public static getFriendRequests(userId: string): { incoming: FriendRequest[]; outgoing: FriendRequest[] } {
    const reqs = this.getAllFriendRequests();
    const incoming = reqs
      .filter((r) => r.receiver_id === userId && r.status === "pending")
      .map((r) => ({ ...r, sender_profile: this.getProfileById(r.sender_id) || undefined }));
    const outgoing = reqs
      .filter((r) => r.sender_id === userId && r.status === "pending")
      .map((r) => ({ ...r, receiver_profile: this.getProfileById(r.receiver_id) || undefined }));

    return { incoming, outgoing };
  }

  public static getPendingRequestsCount(userId: string): number {
    const reqs = this.getAllFriendRequests();
    return reqs.filter((r) => r.receiver_id === userId && r.status === "pending").length;
  }

  public static getUserFriends(userId?: string): Profile[] {
    if (!this.isBrowser()) return SEED_FRIENDS;
    const currentId = userId || this.getSession()?.userId || "default";
    const map = this.getRawMap<Profile[]>(STORAGE_KEYS.USER_FRIENDS);
    if (!map[currentId]) {
      return SEED_FRIENDS;
    }
    return map[currentId];
  }

  public static getFriends(userId?: string): Profile[] {
    return this.getUserFriends(userId);
  }

  public static getRegisteredAccounts(excludeUserId?: string): Profile[] {
    const accounts = this.getAccounts();
    return accounts
      .filter((a) => !excludeUserId || a.id !== excludeUserId)
      .map(({ passwordHash, ...profile }) => profile);
  }

  public static addFriend(
    targetQuery: string,
    currentUserId?: string
  ): { success: boolean; message: string; friend?: Profile } {
    const currentId = currentUserId || this.getSession()?.userId || "default";
    const map = this.getRawMap<Profile[]>(STORAGE_KEYS.USER_FRIENDS);
    const userFriends = map[currentId] ? [...map[currentId]] : [...SEED_FRIENDS];

    const clean = targetQuery.trim().toLowerCase();

    if (userFriends.some((f) => f.username.toLowerCase() === clean || f.id === targetQuery)) {
      return { success: false, message: "Already in your circle." };
    }

    const accounts = this.getAccounts();
    const registered = accounts.find(
      (a) =>
        a.id === targetQuery ||
        a.username.toLowerCase() === clean ||
        a.email.toLowerCase() === clean ||
        a.display_name?.toLowerCase() === clean
    );

    let newFriend: Profile;

    if (registered) {
      const { passwordHash, ...profile } = registered;
      newFriend = profile;
    } else {
      const seedMatch = SEED_FRIENDS.find(
        (sf) => sf.username.toLowerCase() === clean || sf.id === targetQuery
      );
      if (seedMatch) {
        newFriend = seedMatch;
      } else {
        newFriend = {
          id: `user_f_${Date.now()}`,
          username: clean.replace(/\s+/g, "_"),
          display_name: targetQuery.trim(),
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`,
          bio: "Committed to the Arc.",
          language: "en",
          timezone: getBrowserTimezone(),
          privacy: "friends",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    userFriends.push(newFriend);
    map[currentId] = userFriends;
    this.setRawMap(STORAGE_KEYS.USER_FRIENDS, map);

    return {
      success: true,
      message: `Connected with ${newFriend.display_name || newFriend.username}!`,
      friend: newFriend,
    };
  }

  public static removeFriend(friendId: string, currentUserId?: string): void {
    const currentId = currentUserId || this.getSession()?.userId || "default";
    const map = this.getRawMap<Profile[]>(STORAGE_KEYS.USER_FRIENDS);
    const userFriends = map[currentId] ? [...map[currentId]] : [...SEED_FRIENDS];
    const filtered = userFriends.filter((f) => f.id !== friendId);
    map[currentId] = filtered;
    this.setRawMap(STORAGE_KEYS.USER_FRIENDS, map);
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  public static createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    linkUrl?: string,
    data?: Record<string, any>
  ): AppNotification {
    const map = this.getRawMap<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const userNotifs = map[userId] || [];
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      link_url: linkUrl,
      data,
      created_at: new Date().toISOString(),
    };
    userNotifs.unshift(notif);
    map[userId] = userNotifs.slice(0, 50);
    this.setRawMap(STORAGE_KEYS.NOTIFICATIONS, map);
    return notif;
  }

  public static getUserNotifications(userId: string): AppNotification[] {
    const map = this.getRawMap<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    return map[userId] || [];
  }

  public static markNotificationAsRead(userId: string, notificationId: string): void {
    const map = this.getRawMap<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const userNotifs = map[userId] || [];
    const target = userNotifs.find((n) => n.id === notificationId);
    if (target) {
      target.is_read = true;
      map[userId] = userNotifs;
      this.setRawMap(STORAGE_KEYS.NOTIFICATIONS, map);
    }
  }

  public static markAllNotificationsAsRead(userId: string): void {
    const map = this.getRawMap<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const userNotifs = map[userId] || [];
    userNotifs.forEach((n) => (n.is_read = true));
    map[userId] = userNotifs;
    this.setRawMap(STORAGE_KEYS.NOTIFICATIONS, map);
  }

  public static getUnreadNotificationsCount(userId: string): number {
    const notifs = this.getUserNotifications(userId);
    return notifs.filter((n) => !n.is_read).length;
  }

  // ==========================================
  // DIRECT & GROUP MESSAGING
  // ==========================================
  private static getConversationKey(userA: string, userB: string): string {
    return [userA, userB].sort().join("___");
  }

  public static sendDirectMessage(senderId: string, receiverId: string, message: string): DirectMessage {
    const key = this.getConversationKey(senderId, receiverId);
    const map = this.getRawMap<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES);
    const msgs = map[key] || [];

    const dm: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    msgs.push(dm);
    map[key] = msgs;
    this.setRawMap(STORAGE_KEYS.DIRECT_MESSAGES, map);

    const senderProfile = this.getProfileById(senderId);
    this.createNotification(
      receiverId,
      "direct_message",
      `Message from ${senderProfile?.display_name || senderProfile?.username || "Friend"}`,
      message.length > 50 ? `${message.slice(0, 50)}...` : message,
      `/friends?chatWith=${senderId}`,
      { sender_id: senderId }
    );

    return dm;
  }

  public static getDirectMessages(userA: string, userB: string): DirectMessage[] {
    const key = this.getConversationKey(userA, userB);
    const map = this.getRawMap<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES);
    return map[key] || [];
  }

  public static markDirectMessagesAsRead(senderId: string, receiverId: string): void {
    const key = this.getConversationKey(senderId, receiverId);
    const map = this.getRawMap<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES);
    const msgs = map[key] || [];
    msgs.forEach((m) => {
      if (m.sender_id === senderId && m.receiver_id === receiverId) {
        m.is_read = true;
      }
    });
    map[key] = msgs;
    this.setRawMap(STORAGE_KEYS.DIRECT_MESSAGES, map);
  }

  public static getUnreadDirectMessagesCount(userId: string): number {
    const map = this.getRawMap<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES);
    let count = 0;
    Object.keys(map).forEach((k) => {
      if (k.includes(userId)) {
        count += (map[k] || []).filter((m) => m.receiver_id === userId && !m.is_read).length;
      }
    });
    return count;
  }

  public static getGroups(): Group[] {
    if (!this.isBrowser()) return SEED_GROUPS;
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return data ? JSON.parse(data) : SEED_GROUPS;
  }

  public static createGroup(userIdOrName: string, nameOrDesc: string, descOrUndefined?: string): Group {
    const session = this.getSession();
    let userId = session?.userId || "user-local";
    let name = userIdOrName;
    let description = nameOrDesc;

    if (descOrUndefined !== undefined) {
      userId = userIdOrName;
      name = nameOrDesc;
      description = descOrUndefined;
    }

    const groups = this.getGroups();
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      owner_id: userId,
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
      const joined: Group = {
        id: `group_code_${cleanCode}`,
        owner_id: "community",
        name: `Squad ${cleanCode}`,
        description: "Shared challenge squad.",
        invite_code: cleanCode,
        privacy: "private",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members_count: 3,
        avg_completion: 75,
        group_streak: 4,
      };
      groups.push(joined);
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      }
      return { success: true, message: `Successfully joined ${joined.name}!`, group: joined };
    }

    return { success: true, message: `You are already part of ${target.name}!`, group: target };
  }

  public static sendGroupMessage(
    groupId: string,
    senderId: string,
    senderName: string,
    message: string,
    senderAvatar?: string | null
  ): GroupMessage {
    const map = this.getRawMap<GroupMessage[]>(STORAGE_KEYS.GROUP_MESSAGES);
    const msgs = map[groupId] || [];
    const gm: GroupMessage = {
      id: `gm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      group_id: groupId,
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };
    msgs.push(gm);
    map[groupId] = msgs;
    this.setRawMap(STORAGE_KEYS.GROUP_MESSAGES, map);

    this.recordQuestAction(senderId, "cheer_group", 1);
    return gm;
  }

  public static getGroupMessages(groupId: string): GroupMessage[] {
    const map = this.getRawMap<GroupMessage[]>(STORAGE_KEYS.GROUP_MESSAGES);
    return map[groupId] || [];
  }

  // ==========================================
  // ARC HISTORY & ARC PASSPORT
  // ==========================================
  public static getArcHistory(userId: string): ArcHistoryStamp[] {
    const map = this.getRawMap<ArcHistoryStamp[]>(STORAGE_KEYS.ARC_HISTORY);
    return map[userId] || [];
  }

  public static stampArcCompletion(userId: string, arcId: string): ArcHistoryStamp | null {
    const arcs = this.getUserArcs(userId);
    const targetArc = arcs.find((a) => a.id === arcId);
    if (!targetArc) return null;

    const habits = this.getHabits(arcId);
    const logs = this.getUserHabitLogs(userId);
    const arcLogs = logs.filter((l) => habits.some((h) => h.id === l.habit_id));
    const completedLogs = arcLogs.filter((l) => l.completed);

    const completionRate = habits.length > 0 ? Math.min(100, Math.round((completedLogs.length / (habits.length * targetArc.duration_days)) * 100)) : 100;

    const stamp: ArcHistoryStamp = {
      id: `stamp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      arc_id: targetArc.id,
      arc_name: targetArc.name,
      duration_days: targetArc.duration_days,
      start_date: targetArc.start_date,
      end_date: targetArc.end_date,
      completion_rate: completionRate,
      total_habits_completed: completedLogs.length,
      perfect_days: Math.floor(completedLogs.length / (habits.length || 1)),
      highest_streak: targetArc.duration_days,
      stamp_title: `${targetArc.name} Conqueror`,
      stamped_at: new Date().toISOString(),
    };

    const map = this.getRawMap<ArcHistoryStamp[]>(STORAGE_KEYS.ARC_HISTORY);
    const list = map[userId] || [];
    list.unshift(stamp);
    map[userId] = list;
    this.setRawMap(STORAGE_KEYS.ARC_HISTORY, map);

    this.unlockAchievement(userId, "winter_legend");
    this.createNotification(
      userId,
      "streak_milestone",
      `Arc Conquered! 🏆`,
      `Your passport stamp for "${targetArc.name}" has been sealed into your history.`,
      "/profile"
    );

    return stamp;
  }

  public static resetUserData(userId: string): void {
    if (!this.isBrowser()) return;

    const arcsMap = this.getRawMap<Arc[]>(STORAGE_KEYS.ARCS);
    delete arcsMap[userId];
    this.setRawMap(STORAGE_KEYS.ARCS, arcsMap);

    const logsMap = this.getRawMap<HabitLog[]>(STORAGE_KEYS.LOGS);
    delete logsMap[userId];
    this.setRawMap(STORAGE_KEYS.LOGS, logsMap);

    const xpMap = this.getRawMap<XPEvent[]>(STORAGE_KEYS.XP_EVENTS);
    delete xpMap[userId];
    this.setRawMap(STORAGE_KEYS.XP_EVENTS, xpMap);

    const achMap = this.getRawMap<UserAchievement[]>(STORAGE_KEYS.USER_ACHIEVEMENTS);
    delete achMap[userId];
    this.setRawMap(STORAGE_KEYS.USER_ACHIEVEMENTS, achMap);
  }

  public static resetToDefaults(): void {
    if (!this.isBrowser()) return;
    const session = this.getSession();
    if (session) {
      this.resetUserData(session.userId);
    }
  }
}

