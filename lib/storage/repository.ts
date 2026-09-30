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
} from "@/types/database";
import { CHALLENGE_TEMPLATES, SEED_ACHIEVEMENTS, SEED_FRIENDS, SEED_GROUPS } from "./mockData";
import { getTodayDateString, isHabitCompleted, getBrowserTimezone } from "@/lib/utils";

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

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(SEED_ACHIEVEMENTS));
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
      }

      this.unlockAchievement(userId, "first_step");
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
  }

  // Achievements
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
    return true;
  }

  // ==========================================
  // SOCIAL & DISCOVERY (COMMUNITY)
  // ==========================================
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

    // Check if already friends
    if (userFriends.some((f) => f.username.toLowerCase() === clean || f.id === targetQuery)) {
      return { success: false, message: "Already in your circle." };
    }

    // First check if target matches an actual registered account
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
      // Check seed friends or create community challenger
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

  public static resetUserData(userId: string): void {
    if (!this.isBrowser()) return;

    // Remove user arcs
    const arcsMap = this.getRawMap<Arc[]>(STORAGE_KEYS.ARCS);
    delete arcsMap[userId];
    this.setRawMap(STORAGE_KEYS.ARCS, arcsMap);

    // Remove logs
    const logsMap = this.getRawMap<HabitLog[]>(STORAGE_KEYS.LOGS);
    delete logsMap[userId];
    this.setRawMap(STORAGE_KEYS.LOGS, logsMap);

    // Remove XP events
    const xpMap = this.getRawMap<XPEvent[]>(STORAGE_KEYS.XP_EVENTS);
    delete xpMap[userId];
    this.setRawMap(STORAGE_KEYS.XP_EVENTS, xpMap);

    // Remove user achievements
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

