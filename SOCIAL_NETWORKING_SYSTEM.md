# Social Networking System — HabitFlow

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Files Created](#files-created)
4. [Feature 1: XP / Points & Rewards System](#feature-1-xp--points--rewards-system)
5. [Feature 2: Leaderboards & Weekly Rankings](#feature-2-leaderboards--weekly-rankings)
6. [Feature 3: Friend Streaks & Nudges](#feature-3-friend-streaks--nudges)
7. [Feature 4: Leagues / Competitive Groups](#feature-4-leagues--competitive-groups)
8. [Design System & UI/UX](#design-system--uiux)
9. [Navigation Integration](#navigation-integration)
10. [Store & State Management](#store--state-management)
11. [Component Details](#component-details)
12. [Type System](#type-system)
13. [Constants & Configuration](#constants--configuration)
14. [Future Enhancements](#future-enhancements)

---

## Overview

The Social Networking System is a complete gamification and social layer for the HabitFlow habit tracker app, inspired by Duolingo's social mechanics but adapted for habit tracking. It motivates users through competition, community, and friendly accountability.

### Core Pillars
- **Competition** — Weekly leaderboards and league tiers drive healthy rivalry
- **Community** — Friends list with mutual streaks and nudge system
- **Accountability** — Friend streaks and nudges keep users engaged
- **Progression** — XP, levels (1–50), badges, and league promotion

### Tech Stack Alignment
- **React 18** + TypeScript (consistent with existing app)
- **Zustand 4** with `persist` middleware (matches `useCategoryStore`, `useHabitStore`, etc.)
- **Framer Motion 12** for animations (matches existing animation patterns)
- **Material Symbols** for all icons (no emoji, consistent with app)
- **Tailwind CSS 3.4** with glass morphism and ambient glow effects

---

## Architecture

```
src/
├── components/social/          # All social networking components
│   ├── types.ts                # Complete type system
│   ├── constants.ts            # XP values, levels, league configs, badges, demo data
│   ├── socialStore.ts          # Zustand store for all social state
│   ├── index.ts                # Barrel exports
│   ├── SocialHub.tsx           # Main container with tabs and hero header
│   ├── ProfileTab.tsx          # XP breakdown, stats, and badges tab
│   ├── LeaderboardScreen.tsx   # Weekly/All-Time rankings with podium
│   ├── FriendsScreen.tsx       # Friends list with streaks and nudges
│   ├── LeagueScreen.tsx        # Competitive league tiers
│   ├── XPProgressBar.tsx       # Reusable animated XP progress bar
│   ├── XPBreakdownCard.tsx     # Today's XP breakdown by source
│   ├── DailyXPSummaryCard.tsx  # End-of-day summary modal
│   └── SocialBadgeCard.tsx     # Individual badge display card
└── pages/
    └── Social.tsx              # Top-level page with app bar and navigation
```

### Data Flow
```
User completes habit
  → awardXP('habit_complete', habitId, habitName)
    → Updates totalXP, weeklyXP, xpEvents, dailySummaries
    → Auto-updates league tier based on totalXP thresholds
    → Triggers checkAndUnlockBadges()
      → Compares state against badge criteria
      → Unlocks badges with timestamp
```

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/social/types.ts` | ~150 | Complete TypeScript type definitions |
| `src/components/social/constants.ts` | ~300 | XP values, 50 levels, league configs, 22 badges, demo generators |
| `src/components/social/socialStore.ts` | ~350 | Zustand store with persist — all social state and actions |
| `src/components/social/index.ts` | ~25 | Barrel exports |
| `src/components/social/SocialHub.tsx` | ~180 | Main tabbed container with hero header |
| `src/components/social/ProfileTab.tsx` | ~200 | XP/Badges profile tab |
| `src/components/social/LeaderboardScreen.tsx` | ~250 | Leaderboard with podium and ranked list |
| `src/components/social/FriendsScreen.tsx` | ~220 | Friends list with search, filters, nudges |
| `src/components/social/LeagueScreen.tsx` | ~250 | League tiers with zone highlighting |
| `src/components/social/XPProgressBar.tsx` | ~60 | Reusable animated XP bar |
| `src/components/social/XPBreakdownCard.tsx` | ~80 | Today's XP breakdown card |
| `src/components/social/DailyXPSummaryCard.tsx` | ~120 | End-of-day summary modal |
| `src/components/social/SocialBadgeCard.tsx` | ~130 | Badge display with rarity and unlock state |
| `src/pages/Social.tsx` | ~70 | Page shell with app bar |

### Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added `Social` import and `/social` route (protected with `RequireAuth` + `RequireVerifiedEmail`) |
| `src/components/BottomNav.tsx` | Added `Social` tab with `group` icon (6 total nav items now) |
| `src/components/SideNav.tsx` | Added `Social` menu item with `group` icon |

---

## Feature 1: XP / Points & Rewards System

### XP Sources (11 types)

| Source | XP Awarded | Trigger |
|--------|-----------|---------|
| `habit_complete` | +10 | Completing any habit |
| `streak_bonus` | +5 per day (max 50) | Maintaining a daily streak |
| `milestone` | +25 | Hitting predefined milestones |
| `league_promotion` | +50 | Promoting to a higher league |
| `daily_goal` | +15 | Completing all habits for the day |
| `weekly_goal` | +30 | Meeting weekly habit targets |
| `first_habit` | +20 | First habit completed today |
| `nudge_response` | +5 | Completing a habit after receiving a nudge |
| `friend_streak` | +10 | Maintaining a mutual streak with a friend |
| `perfect_day` | +20 | 100% habit completion in a day |
| `comeback` | +15 | Returning after 3+ days of inactivity |

### Level System (1-50)

- **XP curve**: Exponential — `minXP = 50 * (level - 1)^1.8`
- **Level 1**: 0-100 XP (Seedling)
- **Level 10**: ~3,200 XP (Explorer)
- **Level 25**: ~15,000 XP (Oracle)
- **Level 50**: ~125,000 XP (Legend)
- Each level has a unique **title** and **Material Symbol icon**

#### Level Titles (sample)

| Range | Titles |
|-------|--------|
| 1-5 | Seedling, Sprout, Sapling, Bloom, Bud |
| 6-10 | Leaf, Branch, Tree, Grove, Forest |
| 11-15 | Explorer, Adventurer, Pathfinder, Trailblazer, Pioneer |
| 21-25 | Master, Expert, Virtuoso, Sage, Oracle |
| 46-50 | Phoenix, Dragon, Sovereign, Emperor, Legend |

### Components

- **`XPProgressBar`** — Animated gradient bar with shine effect, shows level, title, and XP count. Available in 3 sizes (`sm`, `md`, `lg`).
- **`XPBreakdownCard`** — Groups today's XP events by type, shows icon + label + count + total. Empty state when no XP earned.
- **`DailyXPSummaryCard`** — Full-screen modal overlay for end-of-day review. Shows 3-column stat grid (XP earned, habits completed, streak), level progress bar, streak bonus callout, and a celebratory "Awesome!" CTA.

### Badge System (22 badges, 4 rarity tiers)

| Rarity | Visual | Count |
|--------|--------|-------|
| Common | Slate gradient | 8 badges |
| Rare | Blue-cyan gradient | 7 badges |
| Epic | Purple-pink gradient | 3 badges |
| Legendary | Amber-orange gradient + glow | 4 badges |

#### Badge Categories

- **Streak** (4): 7-day, 30-day, 100-day, 365-day streaks
- **Social** (4): First friend, 5 nudges sent, 7-day mutual streak, 10 friends
- **Milestone** (6): Level 10/25/50, 1K/10K XP, perfect week
- **League** (5): Silver/Gold/Platinum/Diamond rank, podium finish
- **Special** (3): Early bird, night owl, comeback kid

---

## Feature 2: Leaderboards & Weekly Rankings

### Screen Layout

1. **Period Toggle** — Segmented control: "This Week" / "All Time" with animated active indicator
2. **Podium** — Top 3 users displayed as a visual podium (2nd | 1st | 3rd) with:
   - Gradient avatar borders matching medal color (gold/silver/bronze)
   - Crown icon on #1
   - Animated podium bars rising from bottom
   - Rank change badge on each bar
3. **Ranked List** — Positions 4-10 in card rows showing:
   - Rank number
   - Avatar with league tier dot (colored by tier)
   - Name + level
   - XP count (right-aligned, tabular-nums)
   - Rank change indicator (up green, down red, "New" cyan badge, dash for same)
4. **Current User Section** — If user is outside top 10, a separated section shows their position with primary accent highlight

### Rank Change Indicators

- **Up**: Green arrow + difference number
- **Down**: Red arrow + difference number
- **New**: Cyan pill badge "NEW"
- **Same**: Em dash in muted color

### States

- **Loading**: Podium skeleton (3 rectangles) + 5 list row skeletons with pulse animation
- **Empty**: Centered icon (leaderboard), title "No rankings yet", helpful subtitle

### User Interaction

- Tap period toggle: refreshes leaderboard data with loading state
- Current user row highlighted with `bg-primary/[0.08]` + primary border ring

---

## Feature 3: Friend Streaks & Nudges

### Screen Layout

1. **Stats Row** — 3-column grid: Friends count, Online count (green), Streaks count (orange fire icon)
2. **Search Bar** — Full-width with search icon, `focus:ring-primary` feedback
3. **Filter Chips** — Pill buttons: All (count), Online (count), Streaks (count) — active state uses primary fill with shadow
4. **Friends List** — Scrollable card list

### Friend Card Anatomy

```
+--------------------------------------------------+
| [Avatar+Status] Name [TierBadge]    [fire 12] [bell] |
|                 Lv.15 . 3h ago                    |
|- - - - - - - (expanded on tap) - - - - - - - - - |
| [  Send Nudge  ]                         [Remove] |
+--------------------------------------------------+
```

- **Avatar**: 44px rounded-xl with status dot overlay (green=active, amber=inactive, slate=away)
- **League Tier Badge**: Tiny colored shield icon next to name
- **Streak Flame**: Orange pill with fire icon + streak count (only shown if mutualStreak > 0)
- **Nudge Button**: Primary-tinted icon button (only shown if friend hasn't logged today)
- **Completed Check**: Green check icon (shown if friend already logged today)
- **Expandable Actions**: Tap card to reveal "Send Nudge" + "Remove" buttons

### Nudge System

- `sendNudge(userId)` creates Nudge record, increments `sentNudgesCount`, triggers badge checks
- Toast notification: "Nudge sent to {name}!" with bell icon
- Unread nudge count shown as red badge on Friends tab

### Sorting Logic

1. Active friends first
2. Higher mutual streak second
3. Higher level third

### States

- **Empty (no friends)**: Group add icon, "No friends yet" message, "Add Friends" CTA button
- **Empty (search miss)**: Search off icon, "No friends match your search"

---

## Feature 4: Leagues / Competitive Groups

### League Tiers

| Tier | Color | Gradient | Min XP | Icon |
|------|-------|----------|--------|------|
| Bronze | #CD7F32 | from-amber-700 to-yellow-600 | 0 | shield |
| Silver | #C0C0C0 | from-slate-400 to-gray-300 | 500 | shield |
| Gold | #FFD700 | from-yellow-500 to-amber-400 | 2,000 | shield |
| Platinum | #E5E4E2 | from-cyan-300 to-blue-200 | 5,000 | diamond |
| Diamond | #B9F2FF | from-cyan-400 to-blue-500 | 15,000 | diamond |

### League Rules

- **30 users** per league of similar XP levels
- **Weekly reset** every Monday
- **Top 5 promote** to the next tier
- **Bottom 5 demote** to the previous tier (except Bronze — no demotion)

### Screen Layout

1. **Hero Card** — Centered tier badge (animated with shine sweep), league name, countdown timer pill ("X days left"), tier progress bar (5 dots from Bronze to Diamond), current user rank + XP
2. **Zone Legend** — Horizontal row of color-coded dots: green (Promote Top 5), gray (Safe), red (Demote Bottom 5)
3. **Members List** — Ranked rows with left border coloring:
   - Green left border = promotion zone
   - No border = safe zone
   - Red left border = demotion zone
   - Current user row highlighted with primary accent
   - Top 3 get gradient medal badges
4. **Show All Toggle** — Expandable to see all 30 members (default shows top 10)
5. **Info Card** — "How It Works" explanation with icon bullets

### Member Row Anatomy

```
+---------------------------------------------+
| | [Rank] [Avatar] Name              XP  [up] |
| |                                           |
+---------------------------------------------+
  ^ colored border (green/none/red)
```

### States

- **Loading**: 8 skeleton rows with pulse animation
- **Empty**: Shield icon, "No league yet", helpful subtitle

---

## Design System & UI/UX

### Design Guidelines Applied (from ui-ux-pro-max skill)

| Rule | Implementation |
|------|---------------|
| No emoji icons | All icons use Material Symbols with `fontVariationSettings` |
| cursor-pointer | Every clickable element (buttons, cards, tabs, toggles) |
| 150-300ms transitions | `transition-all duration-200 ease-out` throughout |
| Skeleton loading | Pulse-animated skeletons on Leaderboard, League, and list views |
| Reduced motion support | Framer Motion respects `prefers-reduced-motion` by default |
| Transform-based animations | All animations use `opacity`, `scale`, `translateX/Y` |
| WCAG AA contrast | `text-white` for primary content, `text-slate-400/500` for secondary |

### Color System

- **Primary**: HabitFlow's existing teal/emerald (`primary` from Tailwind config)
- **Surface cards**: `bg-white/[0.015-0.04]` with `border-white/[0.04-0.06]`
- **Ambient glow**: `blur-3xl` colored circles behind hero sections
- **League tier colors**: Bronze (#CD7F32), Silver (#C0C0C0), Gold (#FFD700), Platinum (#E5E4E2), Diamond (#B9F2FF)
- **Badge rarities**: Common (slate), Rare (blue-cyan), Epic (purple-pink), Legendary (amber-orange)

### Visual Effects

- **Glass morphism**: Ultra-subtle white alpha backgrounds with thin borders
- **Gradient rings**: `from-primary via-emerald-400 to-cyan-400` on profile avatars
- **Shine sweep**: Skewed white gradient animation on tier badges, XP bars, and unlocked badges
- **Spring animations**: Framer Motion springs for podium, badges, modal entrances
- **Ambient particles**: Decorative `animate-pulse` dots on summary modal

### Component Design Patterns

- **Cards**: `rounded-2xl bg-white/[0.025] border border-white/[0.04-0.06]` with `hover:bg-white/[0.04]`
- **Buttons (primary)**: `bg-primary text-primary-content shadow-lg shadow-primary/25`
- **Buttons (ghost)**: `bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white`
- **Inputs**: `bg-white/[0.03] border border-white/[0.06] focus:ring-2 focus:ring-primary/30`
- **Pills/Chips**: `rounded-full bg-{color}/10 border border-{color}/15 px-2.5 py-1`
- **Stat boxes**: `rounded-xl bg-white/[0.03] py-2.5` with icon, bold value, uppercase label
- **Dividers**: `bg-gradient-to-r from-transparent via-slate-700/60 to-transparent`

---

## Navigation Integration

### Bottom Nav (6 items)

```
Today | Habits | Tasks | Social | Categories | Timer
```

The Social tab uses the `group` Material Symbol icon.

### Side Nav

Social is added between "All Habits" and "Statistics" in the menu items list.

### Routing

```tsx
<Route path="/social" element={
  <RequireAuth>
    <RequireVerifiedEmail>
      <Social />
    </RequireVerifiedEmail>
  </RequireAuth>
} />
```

Protected behind authentication and requires verified email.

---

## Store & State Management

### `socialStore.ts` — Zustand with Persist

- **Storage key**: `social-store` (localStorage)
- **Version**: 1

#### State Shape

```typescript
{
  // XP
  totalXP: number
  weeklyXP: number
  xpEvents: XPEvent[]             // last 500 events
  dailySummaries: DailyXPSummary[] // last 90 days
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null

  // Leaderboard
  leaderboardPeriod: LeaderboardPeriod
  leaderboardEntries: LeaderboardEntry[]
  leaderboardLastUpdated: string | null

  // Friends
  friends: Friend[]
  friendRequests: FriendRequest[]
  nudges: Nudge[]
  sentNudgesCount: number

  // League
  currentLeagueTier: LeagueTier
  leagueMembers: LeagueMember[]
  leagueWeekStart: string | null
  leagueWeekEnd: string | null

  // Badges
  badges: SocialBadge[]
}
```

#### Actions (27 total)

| Category | Actions |
|----------|---------|
| **XP** | `awardXP()`, `getTodayXP()`, `getTodayEvents()`, `getTodaySummary()`, `getLevel()` |
| **Leaderboard** | `setLeaderboardPeriod()`, `refreshLeaderboard()` |
| **Friends** | `sendFriendRequest()`, `acceptFriendRequest()`, `declineFriendRequest()`, `removeFriend()`, `sendNudge()`, `markNudgeRead()`, `getUnreadNudges()`, `loadDemoFriends()` |
| **League** | `refreshLeague()`, `getLeagueDaysRemaining()` |
| **Badges** | `initializeBadges()`, `checkAndUnlockBadges()`, `getUnlockedBadges()`, `getLockedBadges()` |
| **Profile** | `getSocialProfile()` |
| **Streak** | `recordActivity()` |
| **Reset** | `resetSocial()` |

#### Auto-behaviors

- `awardXP()` automatically:
  - Updates daily summaries
  - Re-evaluates league tier based on total XP thresholds
  - Triggers `checkAndUnlockBadges()`
- `recordActivity()` automatically:
  - Calculates streak (consecutive days)
  - Awards comeback bonus if returning after 3+ days
  - Updates longest streak record

---

## Component Details

### `Social.tsx` (Page Shell)

- Frosted glass app bar: `backdrop-blur-md bg-gray-950/80 border-b border-white/[0.04]`
- Left: hamburger menu opens SideNav
- Center: "Social" title with group icon
- Right: Level chip (`Lv.{n}` with level icon)
- Content: `max-w-3xl mx-auto` for readability

### `SocialHub.tsx` (Main Container)

- **HeroHeader**: Avatar with gradient ring + level chip, XP progress bar, 4-stat grid (XP, Weekly, Streak, Friends)
- **TabBar**: 4 tabs (Rankings, Friends, League, Profile) with active fill + shadow, notification badge on Friends tab
- **AnimatePresence**: Smooth tab content transitions (opacity + translateY)

### `LeaderboardScreen.tsx`

- **Podium**: Custom layout (2nd | 1st | 3rd), gradient borders, crown on #1, animated rising bars
- **RankBadge**: Color-coded rank change indicators
- **LeaderboardRow**: Highlighted current user, league tier dot on avatar

### `FriendsScreen.tsx`

- **FriendCard**: Expandable with slide-down actions panel
- **StatusDot**: Live status indicator (green/amber/slate)
- **Filter chips**: Count badges on each filter option

### `LeagueScreen.tsx`

- **TierBadge**: Gradient icon with shine sweep, available in 3 sizes
- **TierProgress**: 5-dot horizontal progress showing current tier
- **MemberRow**: Left-border colored by zone, medal badges for top 3

### `ProfileTab.tsx`

- **Profile hero**: Avatar with gradient ring, league badge, level info
- **XPBreakdown**: Inline grouped event list with empty state
- **Badge grid**: 1-2 column responsive grid with filter segmented control

### `XPProgressBar.tsx`

- 3 sizes: sm (1.5px bar), md (2.5px), lg (3.5px)
- Animated fill with `ease-out` + repeating shine sweep
- Shows level icon, number, title, and XP fraction

### `SocialBadgeCard.tsx`

- **Compact mode**: 56px grid tiles for badge collections
- **Full mode**: Detailed card with rarity label, description, earned date
- Locked badges: Desaturated with lock icon overlay + subtle blur
- Unlocked badges: Rarity gradient background + shine animation

### `DailyXPSummaryCard.tsx`

- Full-screen modal overlay with backdrop blur
- Spring-animated entrance
- 3-stat grid (XP, Habits, Streak)
- Level progress bar
- Streak bonus callout card (orange theme)
- "Awesome!" primary CTA to dismiss

---

## Type System

### Core Types

```typescript
// XP
XPSourceType    // 11 union members
XPEvent         // { id, type, amount, label, icon, timestamp, habitId?, habitName? }
XPLevel         // { level, minXP, maxXP, title, icon }
DailyXPSummary  // { date, totalXP, events, habitsCompleted, streakBonus }

// Leaderboard
LeaderboardPeriod  // 'weekly' | 'allTime'
RankChange         // 'up' | 'down' | 'same' | 'new'
LeaderboardEntry   // { userId, displayName, avatarUrl, xp, rank, previousRank,
                   //   rankChange, level, leagueTier, isCurrentUser }

// Friends
FriendStatus        // 'active' | 'inactive' | 'away'
FriendRequestStatus // 'pending' | 'accepted' | 'declined'
Friend              // { userId, displayName, avatarUrl, level, xp, mutualStreak,
                    //   lastActive, status, leagueTier, todayCompleted, friendSince }
FriendRequest       // { id, fromUserId, fromDisplayName, fromAvatarUrl,
                    //   fromLevel, toUserId, status, sentAt }
Nudge               // { id, fromUserId, fromDisplayName, fromAvatarUrl,
                    //   toUserId, message, sentAt, read }

// Leagues
LeagueTier    // 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
LeagueConfig  // { tier, label, icon, color, gradient, minXP,
              //   usersPerLeague, promoteCount, demoteCount }
LeagueMember  // { userId, displayName, avatarUrl, weeklyXP, rank,
              //   level, isCurrentUser, zone }
League        // { id, tier, members, weekStartDate, weekEndDate, daysRemaining }

// Badges
BadgeCategory // 'streak' | 'social' | 'milestone' | 'league' | 'special'
BadgeRarity   // 'common' | 'rare' | 'epic' | 'legendary'
SocialBadge   // { id, name, description, icon, category, rarity,
              //   earnedAt?, unlocked }

// Profile
SocialProfile // { userId, displayName, avatarUrl, level, totalXP,
              //   weeklyXP, currentStreak, longestStreak, leagueTier,
              //   badges, friendCount, habitsCompleted, joinedAt }
```

---

## Constants & Configuration

### Key Constants

- `XP_VALUES`: Award amounts for all 11 source types
- `STREAK_BONUS_CAP`: 50 XP max per day from streak bonus
- `LEVELS`: Array of 50 level definitions with progressive XP curve
- `LEAGUE_CONFIGS`: 5 tier configurations with colors, gradients, promotion/demotion rules
- `SOCIAL_BADGE_DEFINITIONS`: 22 badge definitions across 5 categories

### Utility Functions

- `getLevelForXP(totalXP)` — returns the XPLevel for a given XP amount
- `getLevelProgress(totalXP)` — returns `{ current, required, percentage }`
- `getLeagueConfig(tier)` — returns LeagueConfig for a tier
- `getLeagueTierColor(tier)` — returns hex color string
- `getLeagueTierGradient(tier)` — returns Tailwind gradient classes

### Demo Data Generators

- `generateDemoLeaderboard(name, xp)` — 15 randomized leaderboard entries with current user inserted
- `generateDemoFriends()` — 8 friends with varied statuses, streaks, levels, and last active times
- `generateDemoLeagueMembers(name)` — 30 league members sorted by XP with zone assignments

---

## Future Enhancements

### Not Yet Implemented (Planned)

1. **XP Integration with Habit Store** — Automatically call `awardXP('habit_complete')` when a habit is toggled complete in `useHabitStore`
2. **Push Notifications for Nudges** — Backend integration via Supabase Edge Functions to send real push notifications
3. **Real-time Leaderboard** — Replace demo data generators with Supabase queries for live multi-user data
4. **Celebration Animations** — Confetti/particle effects on league promotion, level-up, and badge unlock
5. **Friend Discovery** — Search by username/email, QR code sharing, invite links
6. **Challenge System** — Create habit challenges between friends (e.g., "7-day meditation challenge")
7. **Activity Feed** — Timeline of friends' achievements and milestones
8. **Haptic Feedback** — Vibration API integration for nudge receipt, level-up, badge unlock
9. **Sound Effects** — Audio feedback for XP gain, level-up, and badge unlock
10. **Supabase Tables** — Migration for `social_profiles`, `friendships`, `nudges`, `league_memberships`, `xp_events` tables with RLS policies

### Database Schema (Proposed)

```sql
-- social_profiles
CREATE TABLE social_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  league_tier TEXT DEFAULT 'bronze',
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- friendships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  friend_id UUID REFERENCES auth.users(id),
  mutual_streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- xp_events
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  habit_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- nudges
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Document created: 2026-02-27*
*Last updated: 2026-02-27*
*Status: v2.0 — Full design system and interaction documentation*

---

# Part 2: Design System & Interaction Documentation

---

## 1. Design System Specification

### 1.1 Color Palette

#### Brand Colors (from `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#13ec5b` | CTAs, active tabs, XP bar fill, level chip, highlights |
| `primary-focus` | `#0ebf49` | Hover/pressed state for primary buttons |
| `primary-content` | `#003811` | Text on primary backgrounds |
| `secondary` | `#3e4c42` | Secondary surfaces |
| `background-dark` | `#030712` | Page background (`gray-950`) |
| `surface-dark` | `#141c16` | Elevated card backgrounds |

#### League Tier Colors

| Tier | Hex | Tailwind Gradient | Ring/Glow |
|------|-----|-------------------|-----------|
| Bronze | `#CD7F32` | `from-amber-700 to-yellow-600` | `shadow-amber-700/20` |
| Silver | `#C0C0C0` | `from-slate-400 to-gray-300` | `shadow-gray-400/20` |
| Gold | `#FFD700` | `from-yellow-500 to-amber-400` | `shadow-yellow-500/30` |
| Platinum | `#E5E4E2` | `from-cyan-300 to-blue-200` | `shadow-cyan-300/20` |
| Diamond | `#B9F2FF` | `from-cyan-400 to-blue-500` | `shadow-cyan-400/30` |

#### Badge Rarity Colors

| Rarity | Gradient | Glow Shadow |
|--------|----------|-------------|
| Common | `from-slate-500 to-slate-400` | none |
| Rare | `from-blue-500 to-cyan-400` | `shadow-blue-500/20` |
| Epic | `from-purple-500 to-pink-400` | `shadow-purple-500/20` |
| Legendary | `from-amber-500 to-orange-400` | `shadow-amber-500/30` |

#### Surface & Border System

| Element | Background | Border | Hover |
|---------|-----------|--------|-------|
| Card (default) | `bg-white/[0.025]` | `border-white/[0.04]` | `bg-white/[0.04]` |
| Card (elevated) | `bg-white/[0.03]` | `border-white/[0.06]` | `bg-white/[0.06]` |
| Hero section | `bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900` | `border-white/[0.06]` | — |
| Input field | `bg-white/[0.03]` | `border-white/[0.06]` | — |
| Segmented control bg | `bg-slate-800/50` | `border-white/[0.04]` | — |
| Stat box | `bg-white/[0.03]` | none | — |
| Zone (promotion) | `bg-emerald-500/[0.04]` | `border-l-emerald-500/60` | — |
| Zone (demotion) | `bg-red-500/[0.03]` | `border-l-red-500/60` | — |
| Current user row | `bg-primary/[0.08]` | `border-primary/20` | — |

#### Semantic Colors

| Purpose | Color | Example |
|---------|-------|---------|
| XP earned / positive | `text-emerald-400` | "+10 XP" |
| Streak / fire | `text-orange-400` | Streak count, flame icon |
| Rank up | `text-emerald-400` | Arrow up indicator |
| Rank down | `text-red-400` | Arrow down indicator |
| New entry | `text-cyan-400` on `bg-cyan-500/15` | "NEW" badge |
| Online status | `bg-emerald-400` | Friend status dot |
| Inactive status | `bg-amber-400` | Friend status dot |
| Away status | `bg-slate-500` | Friend status dot |
| Notification badge | `bg-red-500` | Unread nudge count |

#### Ambient Glow System

Used behind hero sections to create depth. Always `pointer-events-none`.

| Position | Size | Color | Blur |
|----------|------|-------|------|
| Top-right | `size-48` | `bg-primary/10` | `blur-3xl` |
| Bottom-left | `size-40` | `bg-cyan-500/8` | `blur-3xl` |
| League hero (top-right) | `size-40` | `{tierColor}15` | `blur-3xl` |
| League hero (bottom-left) | `size-32` | `{tierColor}10` | `blur-3xl` |

### 1.2 Typography Scale

Font families from `tailwind.config.js`:
- **Display**: `Space Grotesk, Manrope, Inter, system-ui, sans-serif`
- **Body**: `Plus Jakarta Sans, Inter, system-ui, sans-serif`

| Token | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| `heading-page` | `text-lg` (18px) | `font-bold` (700) | `tracking-tight` | Page title in app bar |
| `heading-section` | `text-base` (16px) | `font-bold` (700) | default | Section headers ("Today's XP", "Badges") |
| `heading-card` | `text-[14px]` | `font-bold` (700) | default | Card headers |
| `heading-modal` | `text-xl` (20px) | `font-bold` (700) | default | "Daily Summary" modal title |
| `heading-hero` | `text-base` (16px) | `font-bold` (700) | default | User name in hero header |
| `body-primary` | `text-[13px]` | `font-semibold` (600) | default | Friend names, leaderboard names, list items |
| `body-secondary` | `text-[12px]` | `font-medium` (500) | default | League member names, XP values in list |
| `body-meta` | `text-[11px]` | `font-medium` (500) | default | "Lv.15", level title, last active |
| `xp-value-hero` | `text-2xl` (24px) | `font-bold` (700) | default | XP number in daily summary modal |
| `xp-value-inline` | `text-[13px]` | `font-bold` (700) | `tabular-nums` | XP in leaderboard rows |
| `xp-value-stat` | `text-lg` (18px) | `font-bold` (700) | `tabular-nums` | Stat boxes in profile |
| `xp-value-compact` | `text-sm` (14px) | `font-bold` (700) | `tabular-nums` | Hero stat grid values |
| `rank-medal` | `text-[10px]` | `font-black` (900) | default | Number inside medal circle |
| `rank-list` | `text-sm` (14px) | `font-bold` (700) | `tabular-nums` | Rank number in leaderboard rows |
| `rank-league` | `text-[11px]` | `font-bold` (700) | `tabular-nums` | Rank number in league rows |
| `badge-rarity` | `text-[9px]` | `font-bold` (700) | `tracking-wider uppercase` | "COMMON", "RARE", etc. |
| `badge-name` | `text-sm` (14px) | `font-bold` (700) | default | Badge title |
| `label-stat` | `text-[9px]` | `font-semibold` (600) | `tracking-wider uppercase` | "XP", "WEEKLY", "STREAK" |
| `label-filter` | `text-[11px]` | `font-semibold` (600) | default | Filter chip text |
| `label-tab` | `text-[10px]` | `font-semibold` (600) | default | Tab bar labels |
| `label-zone` | `text-[10px]` | `font-medium` (500) | default | "Promote (Top 5)", zone legend |
| `label-chip` | `text-[11px]` | `font-bold` (700) | default | Level chip "Lv.12" |
| `label-info` | `text-[11px]` | default (400) | default | Info card body text |
| `caption` | `text-[10px]` | `font-medium` (500) | default | XP fraction "450/1200", timestamps |
| `caption-tiny` | `text-[9px]` | `font-bold` (700) | `tracking-widest uppercase` | "How It Works" section header |
| `rank-change` | `text-[10px]` | `font-bold` (700) | default | "+2" rank change indicator |
| `notification-badge` | `text-[8px]` | `font-bold` (700) | default | Unread count in red dot |

### 1.3 Spacing Tokens

All spacing uses Tailwind's 4px grid system.

#### Section Spacing (vertical rhythm between major blocks)

| Context | Gap | Tailwind |
|---------|-----|----------|
| Between SocialHub sections (hero, tabs, content) | 16px | `space-y-4` |
| Between screen sections (stats, search, filters, list) | 16px | `space-y-4` |
| Between leaderboard rows | 6px | `space-y-1.5` |
| Between league member rows | 4px | `space-y-1` |
| Between friend cards | 6px | `space-y-1.5` |
| Between badge cards | 10px | `gap-2.5` |
| Between XP breakdown rows | 6px | `space-y-1.5` |

#### Card Internal Padding

| Card Type | Padding | Tailwind |
|-----------|---------|----------|
| Hero header | 20px | `p-5` |
| League hero | 20px | `p-5` |
| Profile hero | 20px | `p-5` |
| Standard card | 16px | `p-4` |
| Leaderboard row | 14px horiz, 12px vert | `px-3.5 py-3` |
| League member row | 12px horiz, 8px vert | `px-3 py-2` |
| Friend card | 14px | `p-3.5` |
| Badge card (full) | 16px | `p-4` |
| Stat box | 10px vert | `py-2.5` |
| Filter chip | 12px horiz, 8px vert | `px-3 py-2` |
| Daily summary modal header | 24px horiz, 32px top, 24px bottom | `px-6 pt-8 pb-6` |
| Daily summary modal body | 24px horiz, 20px vert | `px-6 py-5` |

#### Icon Sizing

| Context | Size | Tailwind |
|---------|------|----------|
| Tab bar icon | 18px | `text-[18px]` |
| Card section icon | 18px | `text-[18px]` |
| Nudge / action button icon | 18px | `text-[18px]` |
| Stat icon | 14px | `text-sm` |
| League tier badge icon (sm) | 20px | `text-xl` |
| League tier badge icon (md) | 30px | `text-3xl` |
| League tier badge icon (lg) | 36px | `text-4xl` |
| Empty state icon | 36px | `text-4xl` |
| Badge icon (compact) | 24px | `text-2xl` |
| Badge icon (full) | 24px | `text-[24px]` |
| Rank change arrow | 12px | `text-[12px]` |
| Zone indicator arrow | 14px | `text-[14px]` |
| Status dot | 12px | `size-3` |
| Medal circle (top 3) | 28px / 24px | `size-7` / `size-6` |

#### Avatar Sizing

| Context | Size | Radius |
|---------|------|--------|
| Hero header | 60px | `rounded-2xl` (16px) |
| Profile tab | 56px | `rounded-2xl` (16px) |
| Leaderboard row | 40px | `rounded-xl` (12px) |
| Podium (#1) | 64px | `rounded-xl` (12px) |
| Podium (#2, #3) | 48px | `rounded-xl` (12px) |
| Friend card | 44px | `rounded-xl` (12px) |
| League member | 32px | `rounded-lg` (8px) |

### 1.4 Elevation & Shadow

#### Glass Morphism Rules

| Surface | Backdrop Blur | BG Opacity | Border Opacity | Shadow |
|---------|---------------|-----------|----------------|--------|
| App bar | `backdrop-blur-md` (12px) | `bg-gray-950/80` | `border-white/[0.04]` | none |
| Daily summary backdrop | `backdrop-blur-sm` (4px) | `bg-black/70` | none | none |
| Daily summary modal | none | `from-slate-800 to-slate-900` | `border-slate-700/50` | `shadow-2xl` |
| Locked badge overlay | `backdrop-blur-[1px]` | `bg-slate-900/20` | none | none |
| Unlocked badge icon bg | `backdrop-blur-sm` (4px) | `bg-white/20` | none | none |

#### Shadow Tokens

| Token | CSS | Usage |
|-------|-----|-------|
| `shadow-primary` | `shadow-lg shadow-primary/25` | Active tab, active filter chip |
| `shadow-medal-gold` | `shadow-lg shadow-yellow-500/30` | #1 podium medal |
| `shadow-medal-silver` | `shadow-lg shadow-gray-400/30` | #2 podium medal |
| `shadow-medal-bronze` | `shadow-lg shadow-amber-700/30` | #3 podium medal |
| `shadow-tier` | `shadow-lg` | League tier badge |
| `shadow-notification` | `shadow-lg shadow-red-500/30` | Unread count badge |
| `shadow-user-ring` | `ring-1 ring-primary/10` | Current user row highlight |
| `shadow-status` | `shadow-sm shadow-{color}/40` | Online status dot glow |
| `shadow-badge-rare` | `shadow-lg shadow-blue-500/20` | Rare badge card |
| `shadow-badge-epic` | `shadow-lg shadow-purple-500/20` | Epic badge card |
| `shadow-badge-legend` | `shadow-lg shadow-amber-500/30` | Legendary badge card |

#### Border Radius System

| Element | Radius | Tailwind |
|---------|--------|----------|
| Cards, modals, hero sections | 16px | `rounded-2xl` |
| Daily summary modal | 24px | `rounded-3xl` |
| Buttons (primary CTA) | 16px | `rounded-2xl` |
| List rows | 16px | `rounded-2xl` (leaderboard), `rounded-xl` (league) |
| Avatar (large) | 16px | `rounded-2xl` |
| Avatar (medium) | 12px | `rounded-xl` |
| Avatar (small) | 8px | `rounded-lg` |
| Input fields | 12px | `rounded-xl` |
| Filter chips | 12px | `rounded-xl` |
| Segmented control | 16px outer, 12px inner | `rounded-2xl` / `rounded-xl` |
| XP bar track | 9999px | `rounded-full` |
| Pills / status badges | 9999px | `rounded-full` |
| Medal circles | 9999px | `rounded-full` |
| Stat boxes | 12px | `rounded-xl` |
| Empty state container | 24px | `rounded-3xl` |
| Badge compact | 12px | `rounded-xl` |

### 1.5 Motion Tokens

All animations use Framer Motion or CSS transitions. Every animation respects `prefers-reduced-motion` automatically via Framer Motion's built-in support.

#### Named Animation Presets

**`spring-bounce`** — Modals, badge unlocks, podium crown, hero elements
```
type: 'spring'
damping: 25
stiffness: 300
```
Usage: DailyXPSummaryCard entrance, TierBadge scale-in, podium crown reveal

**`spring-snappy`** — Tier badge icon entrance
```
type: 'spring'
damping: 20
stiffness: 300
```
Usage: League TierBadge scale animation

**`ease-slide`** — Tab content transitions, list row stagger
```
duration: 0.22s (220ms)
ease: 'easeOut'
```
Usage: AnimatePresence tab switch (opacity + translateY 12px)

**`ease-fill`** — XP bar progress fill
```
duration: 0.8s (800ms)
ease: 'easeOut'
```
Usage: XPProgressBar width animation on mount

**`ease-stagger`** — List item entrance
```
duration: default (Framer auto)
ease: 'easeOut'
delay: index * 0.035s (35ms per item)
```
Usage: Leaderboard rows (35ms), friend cards (35ms), league members (20ms)

**`shine-sweep`** — Repeating gradient shine on premium elements
```
duration: 2s–2.5s
ease: 'easeInOut'
repeat: Infinity
repeatDelay: 4s–6s
transform: translateX(-100% to 200%) skewX(-20deg)
```
Usage: XP bar shine, tier badge shine, unlocked badge shine

**`pulse-ambient`** — Decorative dots on modals
```
CSS: animate-pulse (Tailwind built-in)
animationDelay: staggered (0s, 0.5s, 1s)
```
Usage: Daily summary modal decorative circles

**`fade-in`** — Loading state to content transition
```
duration: 0.2s (200ms)
ease: default
```
Usage: Leaderboard/League loading completion

#### CSS Transition Standard

All interactive elements use this base transition:
```
transition-all duration-200 ease-out
```
This covers: hover background changes, text color changes, border changes, scale transforms.

#### Scale Feedback

| Interaction | Scale | Tailwind |
|-------------|-------|----------|
| Button press | 0.88 | `whileTap={{ scale: 0.88 }}` |
| CTA button press | 0.98 | `active:scale-[0.98]` |
| Menu button press | 0.95 | `active:scale-95` |
| Compact badge entrance | 0.8 to 1.0 | `initial={{ scale: 0.8 }}` |
| Modal entrance | 0.9 to 1.0 | `initial={{ scale: 0.9 }}` |

---

## 2. Screen-by-Screen Layout Breakdown

### 2.1 Social Page Shell (`Social.tsx`)

```
+------------------------------------------+
| [=] Menu      Social (icon)     [Lv.12]  |  <-- Frosted app bar, sticky
|========================================== |
|                                          |
|  +--------------------------------------+|
|  |  [Avatar]  Name           Stat Grid  ||  <-- HeroHeader
|  |            Title    [XP] [Wk] [S] [F]||
|  |  --------XP Progress Bar--------    ||
|  +--------------------------------------+|
|                                          |
|  [Rankings] [Friends] [League] [Profile]  |  <-- TabBar
|                                          |
|  +--------------------------------------+|
|  |                                      ||
|  |       Active Tab Content             ||  <-- AnimatePresence
|  |       (scrollable area)              ||
|  |                                      ||
|  +--------------------------------------+|
|                                          |
+------------------------------------------+
| Today | Habits | Tasks | Social | Cat | T |  <-- BottomNav
+------------------------------------------+
```

**Top of screen**: Sticky frosted glass app bar (`backdrop-blur-md bg-gray-950/80`). Left: hamburger menu (40x40px). Center: "Social" text + group icon. Right: Level chip showing current level with icon.

**Primary focal element**: HeroHeader card showing avatar with gradient ring, level chip overlay, XP progress bar, and 4-stat grid.

**Scrollable area**: Everything below the tab bar scrolls naturally. The tab bar and hero are part of the scroll content (not sticky beyond the app bar).

**CTAs visible**: Menu button (top-left), level chip (top-right, informational).

### 2.2 Leaderboard Screen (`LeaderboardScreen.tsx`)

```
+------------------------------------------+
| [ This Week ]  [ All Time ]              |  <-- Period toggle
|                                          |
|        [Avatar]          [Avatar]        |
|     2nd  Name        3rd   Name          |
|         XP              XP               |
|   +---------+  +-------+  +-------+     |
|   | Podium  |  |Podium |  |Podium |     |  <-- Animated podium bars
|   |  Bar 2  |  | Bar 1 |  | Bar 3 |     |
|   +---------+  +-------+  +-------+     |
|                                          |
| ─ ─ ─ ─ gradient divider ─ ─ ─ ─ ─ ─ ─ |
|                                          |
| 4  [Avatar] David Park     820 XP  ↑2   |  <-- Ranked rows 4-10
| 5  [Avatar] Sophia Liu     785 XP  —    |
| 6  [Avatar] You            740 XP  ↑3   |  <-- Highlighted
| 7  [Avatar] James Brown    702 XP  NEW  |
| ...                                     |
|                                          |
| ── Your Position ──                      |  <-- Only if outside top 10
| 14 [Avatar] You            320 XP  ↑2   |
+------------------------------------------+
```

**Top**: Period segmented control (2 options, full-width, rounded-xl, 1px gap).

**Primary focal element**: The podium — 3 columns arranged as 2nd | 1st | 3rd. First place is taller (h-28 bar), has a crown icon (`kid_star`), and a larger avatar (64px vs 48px). Each podium has a gradient avatar border matching medal color.

**Scrollable list**: Positions 4–10 in card rows with 1.5px gap spacing. Each row: rank number (left), avatar with league dot (center-left), name + level (center), XP + rank badge (right).

**Current user**: If in top 10, their row gets `bg-primary/[0.08]` highlight with border. If outside top 10, a "Your Position" divider appears below the list with their row.

**CTAs**: Period toggle buttons are the only interactive elements beyond scrolling.

**Empty state**: Centered vertically. 80x80px container with dashed border, `leaderboard` icon at 36px, "No rankings yet" in `text-sm font-semibold text-slate-400`, subtitle "Complete habits to earn XP and start climbing!" in `text-xs text-slate-500`, max-width 220px.

**Loading state**: 3-column podium skeleton (circles + rectangles) at top, then 5 row skeletons with `animate-pulse`. Each skeleton row: circle (32px) + rounded-xl (40px) + two text bars + short bar.

### 2.3 Friends Screen (`FriendsScreen.tsx`)

```
+------------------------------------------+
| +----------+----------+----------+       |
| | 8        | 3        | (fire) 5 |       |  <-- Stats row
| | Friends  | Online   | Streaks  |       |
| +----------+----------+----------+       |
|                                          |
| [search icon] Search friends...          |  <-- Search input
|                                          |
| [All 8] [Online 3] [Streaks 5]          |  <-- Filter chips
|                                          |
| +--------------------------------------+ |
| | [Avatar] Sarah Chen [shield]  [fire7]| |  <-- Friend card
| |    *     Lv.22 . 2h ago         [bell]| |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [Avatar] Marcus Rivera [shield]      | |
| |    .     Lv.15 . Just now       [ok] | |  <-- Completed today
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [Avatar] Aisha Patel [shield] [fire3]| |
| |    *     Lv.8 . 1d ago         [bell]| |
| +--------------------------------------+ |
| ...                                      |
+------------------------------------------+
```

**Top**: 3-column stats grid showing Friends count (white), Online count (emerald), Streaks count (orange with fire icon). Each is a rounded-xl card with centered layout.

**Primary focal element**: The friend cards list. Each card has avatar (44px) with status dot, name + tier badge, streak flame pill (if streak > 0), and nudge button (if not completed today) or check icon (if completed).

**Scrollable list**: Friend cards with 1.5px gap. Sorted: active first, then by streak, then by level.

**Current user info**: Not shown on this screen (this is about friends).

**CTAs visible**: Search input, 3 filter chips, nudge button on each non-completed friend card. Tapping a card expands it to show "Send Nudge" (full-width primary ghost) and "Remove" (red ghost, icon-only width) action buttons.

**Empty state (no friends)**: 80x80px dashed container, `group_add` icon, "No friends yet", subtitle "Add friends to compete and share streaks!", plus "Add Friends" CTA button (`bg-primary/10 text-primary` with person_add icon).

**Empty state (search miss)**: Same container, `search_off` icon, "No friends match your search", subtitle "Try different keywords".

### 2.4 League Screen (`LeagueScreen.tsx`)

```
+------------------------------------------+
| +--------------------------------------+ |
| |                                      | |
| |          [TierBadge lg]              | |  <-- Hero card
| |          Gold League                 | |
| |                                      | |
| |     [timer icon] 4 days left         | |  <-- Timer pill
| |                                      | |
| |  [B]---[S]---[G*]---[P]---[D]       | |  <-- Tier progress
| |                                      | |
| |  Rank #8  .  245 XP                  | |  <-- User position
| +--------------------------------------+ |
|                                          |
| (green) Promote  (gray) Safe  (red) Demo |  <-- Zone legend
|                                          |
| g| 1 [medal] [Av] Sarah Chen  580 XP ↑  |  <-- Promotion zone
| g| 2 [medal] [Av] Liam O'B    540 XP ↑  |
| g| 3 [medal] [Av] Yuki T      520 XP ↑  |
| g| 4         [Av] Noah S      490 XP ↑  |
| g| 5         [Av] Zara O      475 XP ↑  |
|  | 6         [Av] Priya S     450 XP     |  <-- Safe zone
|  | 7         [Av] Ethan K     420 XP     |
| *| 8         [Av] You         245 XP     |  <-- Highlighted
|  | 9         [Av] Oliver J    230 XP     |
|  | 10        [Av] Isabella S  210 XP     |
|                                          |
| [ Show All 30 ]                          |  <-- Expand toggle
|                                          |
| +--------------------------------------+ |
| | How It Works                         | |  <-- Info card
| | ↑ Top 5 promote each week            | |
| | ↓ Bottom 5 move down (fresh start!)  | |
| | ↻ Weekly reset every Monday          | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Top**: Hero card with ambient glow circles using tier color. Centered tier badge (80px, animated with shine), league name below, timer pill showing days remaining, 5-node tier progress bar, and user's current rank + XP.

**Primary focal element**: The tier badge in the hero card, followed by the ranked member list with zone coloring.

**Scrollable list**: Member rows with 4px gap. Each row has a 2px left border colored by zone (green=promotion, transparent=safe, red=demotion). Top 3 get gradient medal circles. Default shows top 10, expandable to all 30.

**Current user info**: Shown in hero card (rank + XP) and highlighted in the member list with `bg-primary/[0.07]` and primary left border.

**CTAs visible**: "Show All 30" expand toggle button at bottom of list.

**Empty state**: 80x80px dashed container, `shield` icon, "No league yet", subtitle "Earn XP to join a league!".

**Loading state**: 8 skeleton rows with `animate-pulse`. Each: circle (24px) + rounded-lg (32px) + text bar (80px) + short bar (40px).

### 2.5 Profile Tab (`ProfileTab.tsx`)

```
+------------------------------------------+
| +--------------------------------------+ |
| | [GradientRing]                       | |
| | [Avatar]  Name         [Summary btn] | |  <-- Profile hero
| | [TierDot] League Name                | |
| |                                      | |
| | --------XP Progress Bar (lg)-------  | |
| |                                      | |
| | +--------+ +--------+ +--------+    | |
| | | 1,250  | | 340    | | 12d    |    | |  <-- Stat pills
| | | Total  | | Weekly | | Streak |    | |
| | +--------+ +--------+ +--------+    | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | (bolt) Today's XP           +45 XP  | |  <-- XP Breakdown
| | [icon] Habit Completed   x3   +30   | |
| | [icon] Streak Bonus           +10   | |
| | [icon] First Habit            +5    | |
| +--------------------------------------+ |
|                                          |
| Badges                    4/22          |
| [All] [Unlocked] [Locked]               |  <-- Badge filter
|                                          |
| +------------------+ +------------------+|
| | (fire) 7-Day     | | (star) Rising    ||  <-- Badge grid
| | Streak  [COMMON] | | Star   [COMMON]  ||
| | 7 days in a row  | | Reach Level 10   ||
| | Earned 2/15/26   | | Earned 2/20/26   ||
| +------------------+ +------------------+|
| +------------------+ +------------------+|
| | [lock] 30-Day    | | [lock] XP        ||  <-- Locked badges
| | Streak    [RARE] | | Master   [EPIC]  ||
| | 30 days in row   | | Earn 10K XP      ||
| +------------------+ +------------------+|
| ...                                      |
+------------------------------------------+
```

**Top**: Profile hero card with avatar (56px) in gradient ring, league tier dot overlay, name + league label, "Summary" button (opens daily summary modal). Below: large XP progress bar, then 3-column stat grid (Total XP white, Weekly emerald, Streak orange).

**Primary focal element**: The XP progress bar and stat pills give immediate feedback on progress.

**Scrollable list**: XP breakdown card (grouped by event type with icons), followed by badge grid (1-2 columns responsive).

**Current user info**: Everything on this screen is about the current user.

**CTAs visible**: "Summary" button (opens DailyXPSummaryCard modal), badge filter segmented control (All/Unlocked/Locked).

**Empty state (no XP today)**: Inside XP Breakdown card: 48px electric_bolt icon container, "No XP earned yet today", subtitle "Complete a habit to start!".

**Empty state (no badges to show)**: Centered 36px `military_tech` icon, "No badges to show" text.

---

## 3. Micro-Interaction Catalogue

Every interactive moment in the social system, with exact animation parameters extracted from the implementation.

### Screen Mount Animations

| Trigger | Element | Animation | Duration | Easing | Delay | Notes |
|---------|---------|-----------|----------|--------|-------|-------|
| Leaderboard opens | XP bar fill | Width 0% to N% + shine sweep | 800ms + 2s sweep | ease-out / easeInOut | 300ms | Shine repeats every 4s |
| Leaderboard opens | Podium avatars | opacity 0 + y:30 to visible | 500ms | ease-out | 0ms / 150ms / 250ms | 1st=0ms, 2nd=150ms, 3rd=250ms |
| Leaderboard opens | Podium bars | height 0 to full | 400ms | ease-out | 200ms / 350ms / 450ms | Staggered after avatar |
| Leaderboard opens | Crown icon (#1) | opacity 0 + y:5 to visible | default | default | 500ms | After podium settles |
| Leaderboard opens | List rows (4-10) | opacity 0 + x:-16 to visible | default | ease-out | 300ms + i*35ms | Staggered per row |
| Friends opens | Stats grid | Standard mount | — | — | — | No special animation |
| Friends opens | Friend cards | opacity 0 + y:12 to visible | default | ease-out | i*35ms | Staggered per card |
| League opens | Tier badge | scale 0.85 + opacity 0 to full | spring | damping:20, stiff:300 | 0ms | Spring bounce-in |
| League opens | Tier badge shine | translateX -100% to 200% | 2.5s | easeInOut | — | Repeats every 4s, skewX(-20deg) |
| League opens | Tier progress bars | color transition | 300ms | default | — | CSS transition on `transition-all` |
| League opens | Member rows | opacity 0 + x:-8 to visible | default | ease-out | i*20ms | Faster stagger than leaderboard |
| Profile opens | Avatar gradient ring | Immediate | — | — | — | Static gradient, no animation |
| Profile opens | XP bar fill | Width 0% to N% | 800ms | ease-out | 300ms | Same as leaderboard |
| Profile opens | Stat pill numbers | Immediate render | — | — | — | No count-up (static) |
| Profile opens | Badge cards | opacity 0 + y:20 to visible | default | default | i*50ms | Staggered per badge |
| Profile opens | Badge compact tiles | opacity 0 + scale 0.8 to full | default | default | i*30ms | Faster stagger |

### User Action Animations

| Trigger | Element | Animation | Duration | Easing | Notes |
|---------|---------|-----------|----------|--------|-------|
| Tap period toggle | Tab button | bg-primary + shadow appear | 200ms | ease-out | Instant visual feedback |
| Tap period toggle | Content area | Fade out y:-8, fade in y:8 | 220ms | ease-out | AnimatePresence mode="wait" |
| Tap period toggle | Loading skeletons | Appear with pulse | 500ms display | — | Skeletons show for 500ms minimum |
| Tap tab (Rankings/Friends/etc) | Old content | opacity 1 to 0, y:0 to -8 | 220ms | ease-out | Exit animation |
| Tap tab (Rankings/Friends/etc) | New content | opacity 0 to 1, y:12 to 0 | 220ms | ease-out | Enter animation |
| Tap tab (Rankings/Friends/etc) | Tab indicator | bg-primary + text change | 200ms | ease-out | Fill + text color swap |
| Tap nudge button | Button | scale 1.0 to 0.88 to 1.0 | 200ms | default | Framer `whileTap` |
| Tap nudge button | Toast | Slide in from top | 300ms | spring | react-hot-toast default |
| Tap friend card | Actions panel | height 0 to auto, opacity 0 to 1 | 200ms | ease-out | AnimatePresence expand |
| Tap friend card (collapse) | Actions panel | height auto to 0, opacity 1 to 0 | 200ms | ease-out | AnimatePresence exit |
| Tap filter chip | Chip | bg swap + shadow appear | 200ms | ease-out | Previous chip loses primary bg |
| Tap "Show All" (league) | Extra rows | Rows appear with stagger | i*20ms | ease-out | Same stagger as initial rows |
| Tap "Summary" button | Modal backdrop | opacity 0 to 1 | default | default | bg-black/70 + backdrop-blur-sm |
| Tap "Summary" button | Modal card | scale 0.9 + y:20 to scale 1 + y:0 | spring | damping:25, stiff:300 | Spring bounce entrance |
| Tap "Summary" button | Trophy icon | scale 0 to 1 | spring | default | 200ms delay |
| Tap "Summary" button | Stat numbers | opacity 0 + y:10 to visible | default | default | 300ms / 400ms / 500ms stagger |
| Tap "Awesome!" (dismiss) | Modal card | scale 1 to 0.9, y:0 to 20 | default | default | Exit animation |
| Tap "Awesome!" (dismiss) | Backdrop | opacity 1 to 0 | default | default | Simultaneous with modal |
| Tap backdrop (dismiss) | Same as "Awesome!" | Same | Same | Same | Click-outside dismiss |
| Hover on any card | Card background | bg-white/[0.025] to bg-white/[0.04] | 200ms | ease-out | CSS transition |
| Hover on ghost button | Button | text-slate-400 to text-white | 200ms | ease-out | CSS transition |
| Type in search | Input border | border-white/[0.06] to border-primary/40 | 200ms | ease-out | On focus ring appears |
| CTA button press | Button | scale 1.0 to 0.98 | instant | — | `active:scale-[0.98]` |
| Menu button press | Button | scale 1.0 to 0.95 | instant | — | `active:scale-95` |

### Passive / Looping Animations

| Element | Animation | Duration | Repeat | Notes |
|---------|-----------|----------|--------|-------|
| XP bar shine | translateX sweep, skewX(-20deg) | 2s | Every 4s | `via-white/20` gradient |
| Tier badge shine | translateX sweep, skewX(-20deg) | 2.5s | Every 4s | `via-white/20` gradient |
| Unlocked badge shine | translateX sweep, skewX(-20deg) | 2s | Every 6s | `via-white/15` gradient |
| Daily summary dots | CSS pulse opacity | 2s (Tailwind) | Infinite | 3 dots, staggered 0s/0.5s/1s |
| Online status dot | Static | — | — | No animation (solid color) |
| Notification badge (red) | Static | — | — | Number only, no pulse |

### Planned (Not Yet Implemented)

| Trigger | Proposed Animation | Duration | Notes |
|---------|-------------------|----------|-------|
| Level up | Number count-up + burst particles | 1200ms | Full-screen celebration moment |
| Badge unlock | Scale 0 to 1.1 to 1.0 + glow pulse ring | 600ms | Spring with overshoot |
| League promotion | Confetti burst + old badge shrink + new badge grow | 1500ms | Full-screen with tier color confetti |
| League demotion warning | Gentle red pulse on demotion zone border | 2s | Repeating, subtle attention draw |
| Rank change on refresh | Number flip/count animation | 500ms | Each row staggers |
| XP gain in real-time | Floating "+10 XP" text rising and fading | 800ms | Anchored to source element |
| Friend comes online | Status dot scale 0 to 1 + green pulse | 400ms | One-time animation |
| Nudge received | Bell icon shake + scale bounce | 500ms | 3-frame wiggle |

---

## 4. Notification & Feedback Design

### 4.1 Nudge Received

```
+------------------------------------------+
| [Avatar]  Sarah sent you a nudge!        |
|           "Don't forget your habits!" ->  |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Top of screen, below status bar |
| **Layout** | Avatar (32px rounded-lg) + title (bold 13px white) + subtitle (12px slate-400) |
| **Icon** | Friend's avatar (not a generic icon) |
| **Title** | "{Name} sent you a nudge!" |
| **Subtitle** | Message preview (truncated to 1 line) |
| **Background** | `bg-slate-800 border border-primary/30 rounded-xl` |
| **Duration** | 5 seconds (auto-dismiss) |
| **Dismiss** | Swipe up or tap anywhere on toast |
| **Action required** | No — informational only |
| **Sound** | Soft notification chime (planned, not implemented) |
| **Haptic** | Light impact (planned, not implemented) |

### 4.2 Badge Earned

```
+------------------------------------------+
| [BadgeIcon]  Badge Unlocked!             |
|    (glow)    "7-Day Streak" earned  ->   |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Top of screen |
| **Layout** | Badge icon (24px, filled, in rarity gradient circle) + title + badge name |
| **Icon** | The badge's own icon with rarity gradient background |
| **Title** | "Badge Unlocked!" (bold, white) |
| **Subtitle** | "\"{badge.name}\" earned" (slate-300) |
| **Background** | `bg-slate-800 border border-{rarityColor}/30 rounded-xl` |
| **Duration** | 6 seconds (longer for celebration moment) |
| **Dismiss** | Swipe up, tap, or auto |
| **Action required** | No — but tapping navigates to Profile tab badges section |
| **Glow** | Subtle box-shadow using rarity color at 20% opacity |

### 4.3 Level Up

```
+------------------------------------------+
| [LevelIcon]  Level Up!                   |
|    (star)     You reached Level 12!  ->  |
|              "Explorer"                  |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Top of screen |
| **Layout** | Level icon (24px, filled, in primary/10 circle) + title + level number + title name |
| **Icon** | The new level's icon from the `LEVELS` array |
| **Title** | "Level Up!" (bold, primary color) |
| **Subtitle** | "You reached Level {n}!" + level title in quotes |
| **Background** | `bg-slate-800 border border-primary/30 rounded-xl` |
| **Duration** | 6 seconds |
| **Dismiss** | Swipe up, tap, or auto |
| **Action required** | No |
| **Celebration** | Planned: confetti burst behind toast (not yet implemented) |

### 4.4 League Promotion / Demotion Warning

#### Promotion (end of week, top 5)

```
+------------------------------------------+
| [TierIcon]   Promoted!                   |
|   (shield)   Welcome to Gold League! ->  |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Center of screen (modal, not toast) — this is a celebration moment |
| **Layout** | Full DailyXPSummaryCard-style modal with new tier badge, confetti dots, "Awesome!" CTA |
| **Icon** | New tier's shield/diamond icon in tier gradient |
| **Title** | "Promoted!" (bold, white, text-xl) |
| **Subtitle** | "Welcome to {Tier} League!" (tier color) |
| **Background** | Modal: `rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900` |
| **Duration** | Manual dismiss only (requires "Awesome!" tap) |
| **Dismiss** | Tap "Awesome!" CTA or backdrop |
| **Action required** | Yes — must acknowledge |
| **Tone** | Celebratory, encouraging |

#### Demotion Warning (2 days before week end, bottom 5)

```
+------------------------------------------+
| [warning]  You're close to the edge!     |
|            Earn more XP to stay safe ->  |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Top of screen (toast) |
| **Layout** | Warning icon + encouraging title + actionable subtitle |
| **Icon** | `trending_down` in `text-amber-400` (NOT red — encouraging, not punishing) |
| **Title** | "You're close to the edge!" (bold, amber-300) |
| **Subtitle** | "Earn more XP to stay in {Tier} League!" (slate-400) |
| **Background** | `bg-slate-800 border border-amber-500/30 rounded-xl` |
| **Duration** | 8 seconds (longer to ensure visibility) |
| **Dismiss** | Swipe up, tap, or auto |
| **Action required** | No — but motivational |
| **Tone** | Encouraging, NOT shame-based. "You can do it" energy. |
| **Frequency** | Maximum once per day, only when in demotion zone with 2 days remaining |

### 4.5 Friend Request Received

```
+------------------------------------------+
| [Avatar]  New friend request!            |
|           Marcus Rivera wants to...  ->  |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| **Position** | Top of screen |
| **Layout** | Requester's avatar (32px) + title + name preview |
| **Icon** | Requester's avatar image |
| **Title** | "New friend request!" (bold, white) |
| **Subtitle** | "{Name} wants to be your friend" (slate-400) |
| **Background** | `bg-slate-800 border border-cyan-500/30 rounded-xl` |
| **Duration** | 6 seconds |
| **Dismiss** | Swipe up, tap (navigates to Friends tab), or auto |
| **Action required** | No on toast — but Friends tab will show pending request with Accept/Decline buttons |
| **Badge** | Friends tab gets red notification dot with count |

### General Toast Styling

All toasts use `react-hot-toast` with custom styling:

```typescript
toast.success(message, {
  style: {
    background: '#1f2937',      // slate-800
    color: '#fff',
    borderRadius: '12px',       // rounded-xl
    border: '1px solid ...',    // context-dependent border color
    fontSize: '13px',
    fontWeight: 600,
    maxWidth: '360px',
  },
  duration: 5000,               // default, overridden per type
  position: 'top-center',
})
```

---

## 5. Accessibility Checklist

### 5.1 Touch Target Sizes

| Element | Actual Size | Minimum Required | Status |
|---------|-------------|------------------|--------|
| App bar menu button | 40x40px | 44x44px | NEEDS FIX — increase to 44px |
| App bar level chip | 32x28px (approx) | 44x44px | OK — informational, not interactive |
| Tab bar buttons | flex-1 x 40px | 44x44px | OK — width exceeds 44px, height ~40px is close |
| Period toggle buttons | flex-1 x 40px | 44x44px | OK — same as tabs |
| Filter chips | ~70x36px | 44x44px | OK — width exceeds, height 36px acceptable for inline |
| Nudge button | 36x36px | 44x44px | NEEDS FIX — increase to 44px |
| Friend card (tap area) | full-width x ~56px | 44x44px | OK — exceeds minimum |
| "Show All" toggle | full-width x 40px | 44x44px | OK — width exceeds, height acceptable |
| Badge filter buttons | ~60x28px | 44x44px | NEEDS FIX — increase padding to hit 44px height |
| "Summary" button | ~90x36px | 44x44px | NEEDS FIX — increase to 44px height |
| "Awesome!" CTA | full-width x 44px | 44x44px | OK — meets minimum |
| Search input | full-width x 40px | 44x44px | OK — acceptable for text input |
| "Add Friends" CTA | ~140x40px | 44x44px | NEEDS FIX — increase to 44px height |

#### Remediation Plan

Elements marked "NEEDS FIX" should have their touch targets increased. For icon buttons, this means changing from `size-9` (36px) to `size-11` (44px). For text buttons, increasing vertical padding from `py-2` to `py-2.5` or `py-3`.

### 5.2 Color Contrast Ratios

All contrast ratios measured against `#030712` (gray-950 background) or card surfaces.

| Text | Color | Background | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|------|-------|-----------|----------------|-----------------|----------------|
| Primary headings | `#ffffff` (white) | `#030712` (gray-950) | 21:1 | PASS | PASS |
| Primary body text | `#ffffff` (white) | `rgba(255,255,255,0.025)` on gray-950 | ~20:1 | PASS | PASS |
| Secondary text | `#94a3b8` (slate-400) | `#030712` | 7.1:1 | PASS | PASS |
| Tertiary text | `#64748b` (slate-500) | `#030712` | 4.6:1 | PASS | FAIL |
| Muted text | `#475569` (slate-600) | `#030712` | 3.2:1 | FAIL | FAIL |
| Primary accent | `#13ec5b` (primary) | `#030712` | 10.8:1 | PASS | PASS |
| XP positive | `#34d399` (emerald-400) | `#030712` | 9.4:1 | PASS | PASS |
| Streak orange | `#fb923c` (orange-400) | `#030712` | 6.2:1 | PASS | FAIL |
| Rank up green | `#34d399` (emerald-400) | `#030712` | 9.4:1 | PASS | PASS |
| Rank down red | `#f87171` (red-400) | `#030712` | 5.3:1 | PASS | FAIL |
| "NEW" badge text | `#22d3ee` (cyan-400) | `rgba(6,182,212,0.15)` on gray-950 | ~8:1 | PASS | PASS |
| White on primary | `#003811` on `#13ec5b` | — | 8.5:1 | PASS | PASS |
| Badge rarity label | `#ffffff` (white) | rarity gradient | varies 4.5-8:1 | PASS | varies |
| Stat labels | `#64748b` (slate-500) uppercase | card surface | 4.6:1 | PASS (large text exception for uppercase) | — |

#### Key Finding

`text-slate-600` (#475569) fails WCAG AA at 3.2:1. This is used only for decorative separators ("·") and em-dashes, never for essential information. All essential content uses slate-400 or brighter.

### 5.3 Screen Reader Labels

#### Icon-Only Buttons

| Element | Visual | `aria-label` / `title` |
|---------|--------|------------------------|
| Menu button | Hamburger icon | `aria-label="Open navigation menu"` |
| Nudge button | Bell icon | `title="Nudge {friendName}"` |
| Period toggle | "This Week" / "All Time" text | Self-labeling (has visible text) |
| Filter chips | "All 8" / "Online 3" | Self-labeling (has visible text) |
| Tab bar buttons | Icon + label | Self-labeling (has visible text) |
| "Summary" button | Icon + "Summary" text | Self-labeling |
| Expand/collapse toggle | Arrow + text | Self-labeling ("Show All 30") |
| Remove friend button | Person remove icon | Needs `aria-label="Remove friend"` |

#### Badges and Decorative Elements

| Element | Strategy |
|---------|----------|
| League tier dot on avatar | Decorative — `aria-hidden="true"` (tier is shown in text) |
| Status dot (online/away) | Include in parent's `aria-label`: "{Name}, online, Level 15" |
| Medal circles (rank 1-3) | `aria-label="Rank {n}"` |
| Streak flame icon | Decorative — the number provides the information |
| Ambient glow circles | `pointer-events-none` already excludes from accessibility tree |
| Shine sweep overlays | `pointer-events-none` already excludes |
| Rank change arrows | `aria-label="Rank up by {n}"` or `aria-label="Rank down by {n}"` |
| Locked badge overlay | `aria-label="{badge.name} — locked. {badge.description}"` |
| Unlocked badge | `aria-label="{badge.name} — unlocked. {badge.description}. Earned {date}"` |

#### Live Regions

| Event | ARIA Strategy |
|-------|---------------|
| Nudge sent toast | `role="status"` on toast container (react-hot-toast default) |
| Tab content change | `aria-live="polite"` on content container |
| Leaderboard refresh | No announcement needed (user-initiated) |
| Loading to content | `aria-busy="true"` during loading, removed when content renders |

### 5.4 Reduced Motion Fallbacks

Framer Motion automatically respects `prefers-reduced-motion: reduce` by disabling animations. Below documents the specific fallback behavior:

| Animation | Normal Behavior | Reduced Motion Fallback |
|-----------|----------------|------------------------|
| XP bar fill | Width animates 0 to N% over 800ms | Renders at final width immediately |
| Shine sweep | Continuous translateX loop | Disabled entirely (no sweep) |
| Podium entrance | Staggered opacity + translateY | All three appear simultaneously, no movement |
| List row stagger | Sequential fade-in with translateX | All rows appear simultaneously |
| Tab content transition | Opacity + translateY with AnimatePresence | Instant swap (opacity jump) |
| Modal entrance | Spring scale + translateY | Appears at final position instantly |
| Modal exit | Scale down + opacity out | Disappears instantly |
| Badge card entrance | Staggered opacity + translateY | All badges appear simultaneously |
| Compact badge scale | Scale 0.8 to 1.0 | Appears at full size |
| Button whileTap | Scale to 0.88 | No scale change (still clickable) |
| Ambient pulse dots | CSS `animate-pulse` | Static dots (no opacity change) |
| Tier badge spring | Spring scale 0.85 to 1.0 | Appears at full size |

#### Implementation Note

Framer Motion handles this automatically via its `useReducedMotion()` hook. CSS animations (`animate-pulse`) should additionally have:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse { animation: none; }
}
```

This is already handled by Tailwind CSS v3.4's built-in reduced motion support when using `motion-safe:` and `motion-reduce:` variants.

### 5.5 Keyboard Navigation

| Screen | Tab Order | Notes |
|--------|-----------|-------|
| Social page | Menu > Level chip > Hero (informational) > Tab 1-4 > Tab content | Standard top-to-bottom |
| Leaderboard | Period toggle 1 > Period toggle 2 > List rows (informational) | Rows are not focusable (no actions) |
| Friends | Stats (informational) > Search input > Filter 1-3 > Friend cards (expandable) > Nudge buttons | Each friend card toggles on Enter/Space |
| League | Hero (informational) > Member rows (informational) > Show All > Info card | Most elements are read-only |
| Profile | Hero > Summary button > XP breakdown (informational) > Badge filter 1-3 > Badge cards | Summary button opens modal, badges are informational |
| Daily Summary modal | Focus trapped inside modal > "Awesome!" button auto-focused | Escape key dismisses |

#### Focus Trap

The DailyXPSummaryCard modal implements focus trapping:
- Focus moves to modal content on open
- Tab cycles within modal (only "Awesome!" button is focusable)
- Escape key triggers `onClose`
- Click on backdrop triggers `onClose`

---

*Document created: 2026-02-27*
*Last updated: 2026-02-27*
*Status: v2.0 — Full design system specification with interaction documentation*
