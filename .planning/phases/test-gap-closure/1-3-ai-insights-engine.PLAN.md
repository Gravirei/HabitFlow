# Plan: 1-3 - AI Insights Engine Tests

## Objective
Create comprehensive unit tests for the AI Insights engine (aiInsightsEngine.ts) and insight generators (insightGenerators.ts).

## Context
- These files contain pure functions for analyzing timer session data
- No external dependencies - purely algorithmic/statistical analysis
- Functions process `TimerSessionData[]` and return structured insights
- Critical business logic that determines productivity scores and recommendations

## Dependencies
- None (Wave 1 - parallel with Plans 1-1 and 1-2)

## Tasks

<task type="auto">
<name>Create aiInsightsEngine tests</name>
<files>src/components/timer/sidebar/ai-insights/__tests__/aiInsightsEngine.test.ts</files>
<action>
Create comprehensive tests for all exported functions in `aiInsightsEngine.ts`:

1. **Setup**:
   - Create mock TimerSessionData factory function
   - Use vi.useFakeTimers() for date-dependent tests

2. **Mock Data Helper**:
```typescript
const createMockSession = (overrides = {}): TimerSessionData => ({
  id: `session-${Math.random()}`,
  mode: 'Stopwatch',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 1800, // 30 minutes
  completed: true,
  ...overrides,
})
```

3. **Test Groups**:

**generateAIInsights (main function)**:
- Returns correct structure with all fields
- Sets dataQuality based on session count
- Populates dataRange correctly
- Returns undefined for optional insights when insufficient data

**determineDataQuality** (test via generateAIInsights):
- < 5 sessions: 'insufficient'
- 5-19 sessions: 'limited'
- 20-49 sessions: 'good'
- 50+ sessions: 'excellent'

**analyzePeakHours**:
- Correctly identifies 3-hour peak window
- Calculates hourlyDistribution for all 24 hours
- Handles sessions spread across different hours
- Calculates completionRate correctly
- Sets confidence based on session count (low/medium/high)
- Edge case: sessions at midnight (hour 0)
- Edge case: peak window wrapping around midnight (e.g., 23-02)

**analyzeDurationPatterns**:
- Correctly buckets sessions (<5min, 5-15min, 15-30min, 30-60min, >60min)
- Identifies optimal duration range (highest completion rate with 3+ sessions)
- Calculates average duration
- Determines trend (increasing/decreasing/stable)
- Edge case: all sessions in one bucket
- Edge case: no bucket has 3+ sessions (uses default)

**analyzeModeMastery**:
- Correctly aggregates by mode (Stopwatch/Countdown/Intervals)
- Identifies best mode by completion rate
- Requires minimum 3 sessions per mode
- Calculates avgDuration per mode
- Edge case: only one mode used

**analyzeConsistency**:
- Empty sessions: returns zeroed metrics
- Calculates activeDays correctly
- Calculates currentStreak (includes today or yesterday)
- Calculates longestStreak
- Calculates avgSessionsPerDay
- Calculates regularityScore (based on coefficient of variation)
- Determines trend (improving/declining/stable)
- Edge case: single day usage
- Edge case: gaps in usage

**analyzeProductivityTrend**:
- Compares current week vs previous week
- Calculates change percentages
- Determines trend (up/down/stable based on 10% threshold)
- Edge case: no previous week data

**calculateProductivityScore**:
- Empty sessions: returns 0 with grade 'F'
- Correctly weights components (consistency 30%, completion 25%, duration 20%, frequency 15%, improvement 10%)
- Assigns correct grade (A+/A/B/C/D/F based on score)
- durationScore optimal range: 15-45 minutes

**generateWeeklySummary**:
- Filters to last 7 days
- Calculates totalSessions, totalDuration, activeDays
- Identifies mostProductiveDay
- Identifies longestSession
- Empty week: returns zeroed highlights
</action>
<verify>Run `npm test src/components/timer/sidebar/ai-insights/__tests__/aiInsightsEngine.test.ts` - all tests pass</verify>
<done>aiInsightsEngine has 35+ tests covering all 8 exported functions with edge cases</done>
</task>

<task type="auto">
<name>Create insightGenerators tests</name>
<files>src/components/timer/sidebar/ai-insights/__tests__/insightGenerators.test.ts</files>
<action>
Create comprehensive tests for `insightGenerators.ts`:

1. **Test Groups**:

**generateInsightMessages (main function)**:
- Returns AIInsights with all message fields populated
- Preserves original insight data
- Calls all individual message generators

**generateScoreMessage** (test via productivityScore.message):
- Score >= 90: "Outstanding" message
- Score >= 80: "Great job" message
- Score >= 70: "Good work" message
- Score >= 60: "Making progress" message
- Score >= 50: "Shows potential" message
- Score < 50: "Starting journey" message
- Message includes grade

**generatePeakHoursMessage**:
- Formats hours correctly (AM/PM)
- Includes session count and completion rate
- Adds appropriate emoji based on completion rate
- Handles edge cases (midnight hours)

**generateDurationMessage**:
- Formats duration ranges (minutes/hours)
- Includes completion rate
- Describes trend (increasing/decreasing/stable)

**generateModeMasteryMessage**:
- Uses correct emoji for mode
- Includes session count and completion rate
- Mentions other modes if used

**generateConsistencyMessage**:
- Varies message based on score tier
- Includes active days / total days
- Shows current streak with fire emoji
- Shows longest streak if greater than current
- Includes trend message

**generateTrendMessage**:
- Up trend: includes positive percentage
- Down trend: includes negative percentage with encouragement
- Stable trend: steady message

**generateWeeklySummaryMessage**:
- No sessions: "No sessions recorded" message
- Formats duration (hours/minutes)
- Includes all highlight stats
- Adds emoji based on completion rate

**generateRecommendations**:
- Insufficient data: returns single "Build Your Data" recommendation
- Duration < 15min avg: suggests longer sessions
- Duration > 60min avg: suggests breaks
- Peak hours with 70%+ completion: leverage peak hours rec
- Consistency < 50: build daily habits rec
- Lost streak: restart streak rec
- Best mode < 50% usage: use best mode more rec
- Productivity trend down: get back on track rec
- Completion rate < 60: improve completion rate rec
- High scores: congratulatory rec
- Sorts by priority (high/medium/low)
- Returns max 5 recommendations
</action>
<verify>Run `npm test src/components/timer/sidebar/ai-insights/__tests__/insightGenerators.test.ts` - all tests pass</verify>
<done>insightGenerators has 25+ tests covering all message generators and recommendation logic</done>
</task>

## Success Criteria
- Both test files created in `__tests__` directory
- 60+ total tests covering all exported functions
- Tests cover happy paths, edge cases, and boundary conditions
- All tests pass with `npm test`

## Verification
```bash
npm test src/components/timer/sidebar/ai-insights/__tests__/aiInsightsEngine.test.ts
npm test src/components/timer/sidebar/ai-insights/__tests__/insightGenerators.test.ts
```
