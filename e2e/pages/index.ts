/**
 * Page Object Models Index
 * Barrel file exporting all Timer module POMs for E2E tests
 */

// Timer page - main timer with stopwatch, countdown, intervals modes
export { TimerPage } from './timer.page';
export type { TimerMode } from './timer.page';

// History page - premium history with session records
export { HistoryPage } from './history.page';
export type { HistoryModeFilter, SessionInfo } from './history.page';

// Goals page - goal tracking and management
export { GoalsPage } from './goals.page';
export type { GoalFilter, GoalInfo } from './goals.page';

// Achievements page - badges and milestones
export { AchievementsPage } from './achievements.page';
export type { AchievementInfo } from './achievements.page';
