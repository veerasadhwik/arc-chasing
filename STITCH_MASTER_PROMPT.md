# ❄️ Winter Arc — Master Stitch Design Prompt

> **Usage:** Copy and paste the prompt below into Google Stitch (or your design tool of choice) to generate the complete multi-screen application suite with a single unified design system.

---

```text
Create a complete, responsive mobile-first and desktop web application design for "WINTER ARC" — a customizable 90-day personal transformation challenge and habit tracking platform.

DESIGN PHILOSOPHY & AESTHETIC:
- Persona: Linear + Duolingo-style progress psychology + Apple-level typography and minimalism + cinematic winter atmosphere.
- Core Identity: Dark-first, premium, minimal, focused, motivational without being childish, gamified without looking like an arcade game.
- Tone: Discipline over motivation. Never punish users visually for missing a day; treat missed habits as objective data ("Tomorrow is a new day. Keep building your Arc.").
- Tagline: "90 Days. One Version Better."
- Sub-headline: "Don't just track your habits. Build your arc."
- Primary Action CTA: "START MY ARC ❄️"

COLOR SYSTEM:
- Background: Deep obsidian black `#080A0F`
- Secondary Background / Surface: `#10131A`
- Cards & Modals: `#151922`
- Card Borders: Subtle 1px white border with 8% to 10% opacity (`rgba(255, 255, 255, 0.08)`)
- Primary Text: `#F5F7FA`
- Secondary / Muted Text: `#8D95A5`
- Primary Accent: Ice Blue `#8ED8FF` (Used sparingly and deliberately for active highlights, key metrics, and primary CTAs — do NOT wash the entire UI in blue)
- Success: Soft muted emerald `#10B981`
- Warning / Streak: Warm amber `#F59E0B`
- Danger: Muted rose `#F43F5E`

TYPOGRAPHY & ELEVATION:
- Headings: Bold, commanding display typography with tight letter spacing (Geist / Inter / Space Grotesk).
- Body: Clean, accessible sans-serif with high contrast against the dark background.
- Elevation: Soft glassmorphic blur with hairline borders and subtle ambient glow effects.

SCREEN SUITE TO GENERATE:

1. LANDING PAGE (Desktop & Mobile):
- Header: Minimal bar with "❄️ WINTER ARC" logo, links ("How it works", "Templates"), language toggle (EN / TE / HI), and "Login" button.
- Hero Section:
  - Massive bold typography:
    "BUILD YOUR
     ARC.
     BECOME YOUR NEXT VERSION."
  - Subtitle: "A 90-day challenge for your habits, discipline and personal growth."
  - Dual CTAs: High-impact ice-blue button "[ START MY ARC ❄ ]" and subtle glass button "[ See how it works ]".
  - Floating live-preview card behind/alongside hero: Showing "DAY 27 / 90", "30%", progress bar, "🔥 21 STREAK", and 4 sample habit checklist rows with instant check feedback.
- Feature Grid: 5 measurement types (Boolean, Number, Duration, Time, Percentage), Streak engine, Visual 90-day calendar, Squads & Friends.

2. ONBOARDING (5-Step Visual Wizard):
- Step header: "01 ━━━━━ 02 ━━━━━ 03 ━━━━━ 04 ━━━━━ 05"
- Step 1 (Language): Full-screen selection cards with country flags (English [EN], Telugu [తెలుగు - TE], Hindi [हिन्दी - HI]).
- Step 2 (Focus): Large cards for primary commitment (Fitness, Study, Skills, Digital Detox, Custom).
- Step 3 (Duration): Huge bold cards for "30 DAYS", "60 DAYS", "90 DAYS (RECOMMENDED)", and "CUSTOM".
- Step 4 (Templates): Visually distinct challenge cards ("Winter Arc", "Study Arc", "Fitness Arc", "Digital Detox").
- Step 5 (Habit Customizer): 8 default habits (Wake Up 5 AM, Mindful Eating, 10K Steps, Reading, Sleep <11 PM, Deep Skill, Clean Eating, Cold Discipline) with edit, reorder, delete, and "+ ADD HABIT" (max 10). Big final CTA: "[ START MY ARC ❄ ]".

3. DAILY DASHBOARD (The Core Screen):
- Top greeting: "GOOD MORNING, VEERA" with subtle snowflake glyph.
- Challenge Banner: "DAY 27 / 90", large horizontal progress bar at 30%.
- Today's Habits List (Clean card rows with 1-click interactions):
  - 🌅 Wake Up (5:00 AM) — Completed checkmark [✓]
  - 📵 No Social Media while eating — Completed checkmark [✓]
  - 🚶 10K Steps — Stepper controls: `[ − ] 7,842 / 10,000 [ + ]` with progress bar
  - 🎯 Deep Skill — Duration stepper: `45 / 60 min` `[ +15m ]`
  - 🍔 Clean Eating (No Junk) — Unchecked circle [○]
  - 🚿 Cool Discipline — Completed checkmark [✓]
  - 📖 Reading — Unchecked circle [○]
  - 🌙 Sleep before 11 PM — Unchecked circle [○]
- Metric summary tiles below:
  - Card 1: "TODAY: 75% (6 / 8 Completed)"
  - Card 2: "🔥 STREAK: 21 DAYS"
  - Card 3: "⚡ XP: 1,840 / 2,000 (Level 12)"
- AI Coach Insight Pill: "Your reading habit is at 42% while steps is 89%. Consider scheduling reading at 10:15 PM instead of waiting until fatigued."

4. PERFECT DAY CELEBRATION (Overlay / Modal):
- Centered minimal card with soft particle glow:
  "❄️ PERFECT DAY"
  "8 / 8 COMPLETE"
  "+100 XP AWARDED"
  "🔥 NEW BADGE: PERFECT DAY"
  "[ CONTINUE ]" button.

5. MY ARC (Journey Map Screen):
- Interactive visual timeline:
  "1 ────────────────●──────────────────────── 90"
  "DAY 1 (Oct 1)    YOU ARE HERE (Day 27)    DAY 90 (Dec 29)"
- Checkpoint milestones:
  - 30-Day Milestone (Unlocked)
  - 60-Day Milestone (Pending)
  - 90-Day Legend (Locked)
- Active 8 habits summary cards with edit/reorder tools.

6. 90-DAY VISUAL CALENDAR:
- Matrix grid of all 90 days organized by month (e.g. October, November, December).
- Color-coded day blocks:
  - Emerald square [🟩] = Perfect Day (100%)
  - Amber square [🟨] = Partial completion
  - Muted Red square [🟥] = Missed day
  - Dark Charcoal square [⬛] = Upcoming day
- Clicking a day opens the Day Detail modal showing the exact breakdown of completed vs missed habits and completion score.

7. PROGRESS & ANALYTICS:
- Top 4 stat blocks:
  - 84% Arc Completion
  - 🔥 21 Current Streak (Longest: 28)
  - 🏆 14 Perfect Days
  - ⚡ 4,280 Total XP
- Habit-by-habit performance cards with consistency percentages and individual streaks.
- 14-day completion trend bar graph.

8. ACHIEVEMENTS & TROPHY ROOM:
- Level progress bar (Level 12 • 1,840 / 2,000 XP).
- Trophy wall with 7 core badges:
  - First Step (Unlocked)
  - 7 Days of Fire (Unlocked)
  - Perfect Day (Unlocked)
  - 30-Day Milestone (Unlocked)
  - 60-Day Ascent (Locked)
  - Winter Legend 90 Days (Locked)
  - Iron Consistency 30x (Unlocked)
- Feed of recent XP events.

9. SQUADS & SOCIAL (Friends & Groups):
- Friends list with friend progress cards (e.g., "Arjun — Day 32 / 90 • 🔥 14d streak").
- Squad card: "CSE WINTER ARC 2026", 12 members, 78% average completion, 9-day squad streak, invite code pill.
- Create squad & Join squad modals.

10. SHAREABLE PROGRESS BADGE:
- Vertical high-aesthetic graphic card formatted for Instagram Stories / WhatsApp:
  - "❄️ WINTER ARC"
  - "DAY 27 / 90"
  - "84% COMPLETE • 🔥 21 DAY STREAK • LEVEL 12"
  - "27 DAYS OF UNBROKEN DISCIPLINE"
  - Share buttons: [ Copy Link ] [ WhatsApp ] [ Instagram ].

11. SETTINGS & PROFILE:
- Minimal grouped sections: Profile (Avatar, Display name, Username, Bio), Language picker, Theme mode (Winter Dark, Frost Light, System), Privacy mode (Private, Friends, Public), Notification toggles, and Account actions.

NAVIGATION STRUCTURE:
- Desktop: Fixed minimal left sidebar (Logo, Today, My Arc, Calendar, Analytics, Achievements, Friends, Groups, Share, Settings, User profile).
- Mobile: Fixed glass bottom bar (Home, Arc, Progress, Friends, Profile).
```
