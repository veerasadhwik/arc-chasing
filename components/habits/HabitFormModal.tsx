"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Habit, HabitType } from "@/types/database";

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit> & { name: string; habit_type: HabitType }) => void;
  initialHabit?: Habit | null;
  currentHabitsCount: number;
}

const COMMON_ICONS = ["❄️", "🌅", "📵", "🚶", "🎯", "📖", "🌙", "🍔", "🚿", "💧", "🧘", "💪", "⚡", "🔥", "🧠"];

export function HabitFormModal({
  isOpen,
  onClose,
  onSave,
  initialHabit,
  currentHabitsCount,
}: HabitFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("❄️");
  const [habitType, setHabitType] = useState<HabitType>("boolean");
  const [targetValue, setTargetValue] = useState<string>("1");
  const [targetUnit, setTargetUnit] = useState<string>("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setDescription(initialHabit.description || "");
      setIcon(initialHabit.icon || "❄️");
      setHabitType(initialHabit.habit_type);
      setTargetValue(initialHabit.target_value ? String(initialHabit.target_value) : "1");
      setTargetUnit(initialHabit.target_unit || "");
      setReminderEnabled(initialHabit.reminder_enabled);
      setReminderTime(initialHabit.reminder_time ? initialHabit.reminder_time.slice(0, 5) : "08:00");
    } else {
      setName("");
      setDescription("");
      setIcon("❄️");
      setHabitType("boolean");
      setTargetValue("1");
      setTargetUnit("");
      setReminderEnabled(false);
      setReminderTime("08:00");
    }
    setError(null);
  }, [initialHabit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    if (!initialHabit && currentHabitsCount >= 10) {
      setError("Maximum 10 active habits reached. Stay focused on your core disciplines.");
      return;
    }

    const parsedTarget =
      habitType !== "boolean" ? parseFloat(targetValue) || 1 : null;

    onSave({
      id: initialHabit ? initialHabit.id : undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      habit_type: habitType,
      target_value: parsedTarget,
      target_unit: targetUnit.trim() || undefined,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderEnabled ? `${reminderTime}:00` : undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? "Edit Discipline" : "Add New Discipline"}
      description="Define a measurable daily standard for your challenge."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Icon selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Discipline Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ICONS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                  icon === emoji
                    ? "bg-sky-500/20 border-2 border-sky-400 scale-110"
                    : "bg-slate-800/80 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Habit Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Habit Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 10K Steps, Wake at 5 AM, Read Book"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Purpose / Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Build mental clarity and stamina"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none transition-colors"
          />
        </div>

        {/* Habit Type */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Measurement Method
          </label>
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value as HabitType)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none transition-colors"
          >
            <option value="boolean">Boolean (Done / Not Done)</option>
            <option value="number">Number (e.g. 10,000 Steps, 3 Liters)</option>
            <option value="duration">Duration (e.g. 45 Minutes of Skill)</option>
            <option value="time">Time (e.g. Wake before 5 AM, Sleep before 11 PM)</option>
            <option value="percentage">Percentage (e.g. 80% tasks done)</option>
          </select>
        </div>

        {/* Target and Unit */}
        {habitType !== "boolean" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Unit (Optional)
              </label>
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder={
                  habitType === "duration"
                    ? "minutes"
                    : habitType === "time"
                    ? "AM / PM"
                    : "steps / pages"
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Reminder Settings */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enable Daily Reminder
            </span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 accent-sky-500 focus:ring-0 cursor-pointer"
            />
          </div>
          {reminderEnabled && (
            <div className="mt-2">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialHabit ? "Save Changes" : "Add Discipline"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
