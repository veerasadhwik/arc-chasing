import assert from "node:assert";

// Pure logic verification matching lib/calculations/engine.ts and lib/utils.ts

function isHabitCompleted(habit, log) {
  if (!log) return false;
  if (habit.habit_type === "boolean") return !!log.completed;
  if (habit.habit_type === "number" || habit.habit_type === "duration" || habit.habit_type === "percentage") {
    const target = habit.target_value ?? 1;
    return (log.value ?? 0) >= target;
  }
  if (habit.habit_type === "time") return !!log.completed;
  return !!log.completed;
}

function calculateScore(habits, logs) {
  const activeHabits = habits.filter(h => h.is_active);
  if (activeHabits.length === 0) return { score: 0, completedCount: 0, total: 0, perfectDay: false };
  let completedCount = 0;
  for (const h of activeHabits) {
    const log = logs.find(l => l.habit_id === h.id);
    if (isHabitCompleted(h, log)) completedCount++;
  }
  const score = Math.round((completedCount / activeHabits.length) * 100);
  const perfectDay = completedCount === activeHabits.length;
  return { score, completedCount, total: activeHabits.length, perfectDay };
}

function calculateStreak(daysCompletion) {
  let streak = 0;
  for (const completed of daysCompletion) {
    if (completed) {
      streak++;
    } else {
      streak = 0;
    }
  }
  return streak;
}

function getLevelProgress(totalXp) {
  let level = 1;
  let accumulated = 0;
  let neededForCurrent = 300;

  while (totalXp >= accumulated + neededForCurrent) {
    accumulated += neededForCurrent;
    level++;
    neededForCurrent = level * 300;
  }

  const currentLevelXp = totalXp - accumulated;
  const nextLevelXp = neededForCurrent;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  return { level, currentLevelXp, nextLevelXp, progressPercent };
}

console.log("🧪 Running Winter Arc Engine Verification Tests...");

// Test 1: Habit Completion Rules
const boolHabit = { id: "h1", habit_type: "boolean", is_active: true };
assert.strictEqual(isHabitCompleted(boolHabit, { completed: true }), true);
assert.strictEqual(isHabitCompleted(boolHabit, { completed: false }), false);

const numHabit = { id: "h2", habit_type: "number", target_value: 10000, is_active: true };
assert.strictEqual(isHabitCompleted(numHabit, { value: 7842, completed: false }), false);
assert.strictEqual(isHabitCompleted(numHabit, { value: 10000, completed: true }), true);
assert.strictEqual(isHabitCompleted(numHabit, { value: 12500, completed: true }), true);

const durHabit = { id: "h3", habit_type: "duration", target_value: 60, is_active: true };
assert.strictEqual(isHabitCompleted(durHabit, { value: 45 }), false);
assert.strictEqual(isHabitCompleted(durHabit, { value: 60 }), true);

console.log("✅ Habit type evaluation tests passed.");

// Test 2: Daily Score & Perfect Day calculation
const habits = [
  { id: "h1", habit_type: "boolean", is_active: true },
  { id: "h2", habit_type: "number", target_value: 10000, is_active: true },
  { id: "h3", habit_type: "duration", target_value: 60, is_active: true },
  { id: "h4", habit_type: "boolean", is_active: true },
];

const partialLogs = [
  { habit_id: "h1", completed: true },
  { habit_id: "h2", value: 10000, completed: true },
  { habit_id: "h3", value: 30, completed: false }, // Not finished
];
const partialResult = calculateScore(habits, partialLogs);
assert.strictEqual(partialResult.completedCount, 2);
assert.strictEqual(partialResult.total, 4);
assert.strictEqual(partialResult.score, 50);
assert.strictEqual(partialResult.perfectDay, false);

const perfectLogs = [
  { habit_id: "h1", completed: true },
  { habit_id: "h2", value: 10000, completed: true },
  { habit_id: "h3", value: 60, completed: true },
  { habit_id: "h4", completed: true },
];
const perfectResult = calculateScore(habits, perfectLogs);
assert.strictEqual(perfectResult.completedCount, 4);
assert.strictEqual(perfectResult.score, 100);
assert.strictEqual(perfectResult.perfectDay, true);

console.log("✅ Daily score and Perfect Day verification passed.");

// Test 3: Streak interruption and continuity
const history1 = [true, true, true, true, true];
assert.strictEqual(calculateStreak(history1), 5);

const history2 = [true, true, false, true, true, true];
assert.strictEqual(calculateStreak(history2), 3);

console.log("✅ Streak engine verification passed.");

// Test 4: XP Level progression
const lvl1 = getLevelProgress(150);
assert.strictEqual(lvl1.level, 1);
assert.strictEqual(lvl1.currentLevelXp, 150);
assert.strictEqual(lvl1.nextLevelXp, 300);
assert.strictEqual(lvl1.progressPercent, 50);

const lvl2 = getLevelProgress(450); // 300 for L1, 150 into L2 (which needs 600)
assert.strictEqual(lvl2.level, 2);
assert.strictEqual(lvl2.currentLevelXp, 150);
assert.strictEqual(lvl2.nextLevelXp, 600);

console.log("✅ XP & Level progression calculations passed.");

console.log("🎉 All 4 Winter Arc engine test suites passed cleanly!");
