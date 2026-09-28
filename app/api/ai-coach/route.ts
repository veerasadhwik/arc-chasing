import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habitStats, currentStreak } = body;

    if (!habitStats || !Array.isArray(habitStats)) {
      return NextResponse.json(
        { error: "Invalid habit stats provided" },
        { status: 400 }
      );
    }

    // Sort habits by completion rate
    const sorted = [...habitStats].sort((a, b) => b.completionRate - a.completionRate);
    const topHabit = sorted[0];
    const bottomHabit = sorted[sorted.length - 1];

    let observation = "";
    let suggestion = "";

    if (topHabit && bottomHabit && topHabit.name !== bottomHabit.name) {
      observation = `Your ${topHabit.name} is excelling at ${topHabit.completionRate}% completion, but ${bottomHabit.name} is currently trailing at ${bottomHabit.completionRate}%.`;

      if (bottomHabit.habit_type === "duration") {
        suggestion = `Try reducing your ${bottomHabit.name} target from ${bottomHabit.target_value || 60}m to ${Math.round((bottomHabit.target_value || 60) / 2)}m for the next 7 days, or execute it earlier in the afternoon before mental fatigue sets in.`;
      } else if (bottomHabit.habit_type === "time") {
        suggestion = `Set a recurring wind-down reminder 30 minutes before your ${bottomHabit.name} target to guard your evening focus.`;
      } else {
        suggestion = `Pair ${bottomHabit.name} immediately after your anchor habit (${topHabit.name}) to establish an automatic behavioral trigger.`;
      }
    } else {
      observation = `You have built an active streak of ${currentStreak || 1} consecutive days on your Arc.`;
      suggestion = "Focus on completing your first two morning disciplines before checking notifications or emails.";
    }

    return NextResponse.json({
      success: true,
      insight: {
        observation,
        suggestion,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to analyze pattern" },
      { status: 500 }
    );
  }
}
