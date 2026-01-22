# AI Insights - Implementation Plan

**Feature:** AI-Powered Insights & Recommendations  
**Priority:** High (Last major Premium History feature)  
**Estimated Effort:** Medium-Large  
**Timeline:** ~2-3 hours

---

## 🎯 Overview

AI Insights will analyze user timer history and provide personalized insights, patterns, recommendations, and productivity tips. This is a **pure client-side AI** system (no external APIs) using statistical analysis and pattern recognition.

---

## 📊 What We'll Analyze

### Data Sources:
1. **Timer History** - All stored sessions from localStorage
2. **Time-of-Day Patterns** - When users are most productive
3. **Session Durations** - Average, trends, consistency
4. **Mode Preferences** - Stopwatch vs Countdown vs Intervals usage
5. **Streaks & Consistency** - Daily/weekly patterns
6. **Completion Rates** - How often sessions are completed vs stopped

### Session Data Structure (Already Available):
```typescript
interface TimerHistoryRecord {
  id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration: number // milliseconds
  timestamp: number
  intervalCount?: number // for Intervals mode
  sessionName?: string
  targetLoopCount?: number
}

// Note: We need to add `completed` flag for completion analysis
```

---

## 🤖 Insights Categories

### 1. **Peak Productivity Hours** ⭐
- Analyze when user completes most/longest sessions
- Identify morning/afternoon/evening patterns
- Show best 3-hour productivity window
- Visual heat map by hour of day

**Example Output:**
> "Your peak productivity is between 9 AM - 12 PM. You complete 60% of your sessions during this time with an average of 45 minutes per session."

---

### 2. **Session Duration Patterns** ⏱️
- Average session length by mode
- Most common session lengths
- Trend: increasing/decreasing over time
- Sweet spot duration (best completion rate)

**Example Output:**
> "You work best in 25-30 minute intervals. Sessions of this length have a 92% completion rate, compared to 65% for longer sessions."

---

### 3. **Mode Mastery** 🎯
- Most used timer mode
- Completion rate by mode
- Recommended mode based on goals
- Mode switching patterns

**Example Output:**
> "You're a Countdown champion! 78% of your time is spent using Countdown mode with an 85% completion rate. Consider trying Intervals for better focus breaks."

---

### 4. **Consistency Score** 📈
- Days active in last 7/30 days
- Longest streak
- Current streak
- Best time of week
- Consistency trend

**Example Output:**
> "You're building momentum! 🔥 You've used the timer 6 out of the last 7 days. Your longest streak is 12 days. Keep it up!"

---

### 5. **Productivity Trends** 📊
- Week-over-week comparison
- Month-over-month growth
- Total time trending up/down
- Session count trending up/down

**Example Output:**
> "Great progress! You've increased your focus time by 23% this week compared to last week. That's 2.5 hours more of productive work!"

---

### 6. **Smart Recommendations** 💡
- Personalized tips based on patterns
- Break time suggestions
- Optimal session length recommendations
- Mode recommendations
- Time-of-day scheduling tips

**Example Recommendations:**
- "Try taking a 5-minute break after 25-minute sessions for better consistency"
- "Your completion rate drops after 8 PM - consider stopping earlier"
- "You haven't used Intervals mode yet - it's great for structured work!"
- "You're most productive on Tuesday mornings - schedule important tasks then"

---

### 7. **Weekly Summary** 📅
- Total sessions this week
- Total time this week
- Best day
- Average session length
- Completion rate
- vs. Last week comparison

**Example Output:**
> "Week in Review: 24 sessions, 18h 30m total time. Best day: Wednesday (4h 15m). Completion rate: 87% (+5% vs last week)"

---

## 🏗️ Architecture

### Components to Create:

```
src/components/timer/premium-history/ai-insights/
├── index.ts                          // Barrel export
├── AIInsightsModal.tsx              // Main modal (dashboard)
├── InsightCard.tsx                  // Individual insight display
├── ProductivityScoreCard.tsx        // Overall score visualization
├── PeakHoursChart.tsx              // Hour-of-day heatmap
├── TrendsChart.tsx                  // Week/month trends
├── RecommendationsList.tsx         // Tips & suggestions
├── WeeklySummaryCard.tsx           // Weekly recap
├── ConsistencyWidget.tsx           // Streak & consistency
├── aiInsightsEngine.ts             // Core analysis algorithms
├── insightGenerators.ts            // Generate insight text
├── types.ts                         // TypeScript interfaces
└── __tests__/
    ├── AIInsightsModal.test.tsx
    ├── aiInsightsEngine.test.ts
    └── insightGenerators.test.ts
```

---

## 📋 Data Structures

### Insight Interface:
```typescript
interface Insight {
  id: string
  category: 'productivity' | 'patterns' | 'trends' | 'recommendations'
  title: string
  description: string
  icon: string
  color: string
  value?: number
  trend?: 'up' | 'down' | 'neutral'
  confidence: 'high' | 'medium' | 'low' // Based on data quantity
}
```

### Analysis Result:
```typescript
interface AnalysisResult {
  // Score (0-100)
  productivityScore: number
  
  // Peak Hours
  peakHours: {
    start: number // 0-23
    end: number
    sessionCount: number
    totalDuration: number
  }
  
  // Duration Patterns
  averageDuration: number
  optimalDuration: number // Best completion rate
  mostCommonDuration: number
  durationTrend: 'increasing' | 'decreasing' | 'stable'
  
  // Mode Stats
  modeStats: {
    mostUsed: TimerMode
    completionRates: Record<TimerMode, number>
    timeByMode: Record<TimerMode, number>
  }
  
  // Consistency
  consistency: {
    daysActive7: number
    daysActive30: number
    currentStreak: number
    longestStreak: number
    consistencyScore: number // 0-100
  }
  
  // Trends
  trends: {
    weekOverWeek: {
      sessions: number // % change
      time: number // % change
    }
    monthOverMonth: {
      sessions: number
      time: number
    }
  }
  
  // Recommendations
  recommendations: Recommendation[]
  
  // Insights
  insights: Insight[]
}
```

### Recommendation Interface:
```typescript
interface Recommendation {
  id: string
  type: 'duration' | 'timing' | 'mode' | 'breaks' | 'general'
  title: string
  description: string
  action?: string // CTA text
  priority: 'high' | 'medium' | 'low'
  icon: string
}
```

---

## 🧮 Analysis Algorithms

### 1. **Peak Hours Detection**
```typescript
function analyzePeakHours(sessions: TimerHistoryRecord[]): PeakHours {
  // Group sessions by hour of day
  const hourlyData = sessions.reduce((acc, session) => {
    const hour = new Date(session.timestamp).getHours()
    if (!acc[hour]) acc[hour] = { count: 0, totalDuration: 0 }
    acc[hour].count++
    acc[hour].totalDuration += session.duration
    return acc
  }, {})
  
  // Find 3-hour window with most activity
  // Calculate productivity score per hour
  // Return peak window
}
```

### 2. **Optimal Duration Detection**
```typescript
function findOptimalDuration(sessions: TimerHistoryRecord[]): number {
  // Group by duration ranges (5min, 10min, 15min, 25min, 30min, etc.)
  // Calculate completion rate for each range
  // Return duration range with highest completion rate
}
```

### 3. **Consistency Score Calculation**
```typescript
function calculateConsistencyScore(sessions: TimerHistoryRecord[]): number {
  // Factor 1: Days active in last 30 days (50%)
  // Factor 2: Current streak length (25%)
  // Factor 3: Session regularity (consistent times) (25%)
  // Return 0-100 score
}
```

### 4. **Productivity Score Calculation**
```typescript
function calculateProductivityScore(analysis: AnalysisResult): number {
  // Factor 1: Total time (30%)
  // Factor 2: Consistency (30%)
  // Factor 3: Completion rate (20%)
  // Factor 4: Session count (10%)
  // Factor 5: Trend direction (10%)
  // Return 0-100 score
}
```

### 5. **Recommendation Engine**
```typescript
function generateRecommendations(analysis: AnalysisResult): Recommendation[] {
  const recommendations = []
  
  // Rule 1: If completion rate < 70%, suggest shorter sessions
  // Rule 2: If no peak hours detected, suggest consistent timing
  // Rule 3: If using only one mode, suggest trying others
  // Rule 4: If sessions > 90min, suggest breaks
  // Rule 5: If evening sessions low completion, suggest earlier times
  // Rule 6: If no sessions in 3+ days, suggest streak restart
  // Rule 7: If increasing trend, encourage and celebrate
  // ... more rules
  
  return recommendations.sort((a, b) => 
    priorityScore[b.priority] - priorityScore[a.priority]
  ).slice(0, 5) // Top 5 recommendations
}
```

---

## 🎨 UI Design

### Modal Layout:
```
┌─────────────────────────────────────────────────────┐
│  🧠 AI Insights          [Period: Last 30 Days ▼]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Productivity Score: 87/100  [Progress Ring] │  │
│  │  🔥 Great! Keep up the momentum              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Peak Hours   │  │ Consistency  │               │
│  │ 9 AM - 12 PM │  │ 23/30 days   │               │
│  │ ⭐ Best time │  │ 🔥 12-day    │               │
│  └──────────────┘  └──────────────┘               │
│                                                      │
│  📊 Insights                                        │
│  ┌────────────────────────────────────────────┐   │
│  │ ⏱️ Optimal Duration                         │   │
│  │ You work best in 25-30 minute sessions     │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  💡 Recommendations                                 │
│  • Try taking breaks after 25 minutes              │
│  • Schedule deep work for morning hours            │
│  • Experiment with Intervals mode                  │
│                                                      │
│  📈 Trends (scroll for more charts)                │
│  [Time Series Chart]                               │
│  [Peak Hours Heatmap]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Implementation Steps

### Phase 1: Core Engine (1 hour)
1. ✅ Create `aiInsightsEngine.ts`
2. ✅ Implement analysis algorithms
3. ✅ Write insight generators
4. ✅ Add tests for algorithms

### Phase 2: UI Components (1 hour)
5. ✅ Create `AIInsightsModal.tsx`
6. ✅ Create `InsightCard.tsx`
7. ✅ Create `ProductivityScoreCard.tsx`
8. ✅ Create `PeakHoursChart.tsx`
9. ✅ Create `RecommendationsList.tsx`

### Phase 3: Integration (30 min)
10. ✅ Add to Settings Sidebar
11. ✅ Wire up to PremiumHistory
12. ✅ Add loading states
13. ✅ Handle empty data gracefully

### Phase 4: Polish & Testing (30 min)
14. ✅ Component tests
15. ✅ Integration tests
16. ✅ Manual testing with real data
17. ✅ Documentation

---

## 🔧 Technical Details

### Data Requirements:
- **Minimum:** 5 sessions for basic insights
- **Optimal:** 20+ sessions for accurate patterns
- **Full Analysis:** 50+ sessions for all features

### Performance:
- Analysis runs client-side only
- Cached results (5-minute cache)
- Lazy loading of charts
- Maximum 1000 sessions analyzed

### Privacy:
- 100% client-side processing
- No external API calls
- Data never leaves user's device
- Can be cleared anytime

---

## 📊 Success Metrics

### User Engagement:
- % of users who open AI Insights
- Average time spent in modal
- Return visits to insights

### Insight Quality:
- User feedback (helpful/not helpful)
- Recommendation follow-through
- Accuracy of predictions

### Feature Adoption:
- First insight view within 24h of having enough data
- Weekly insight check-ins

---

## 🚀 Future Enhancements

### Phase 2 (Future):
- [ ] Goal recommendations based on patterns
- [ ] Personalized timer presets
- [ ] Focus score tracking
- [ ] Distraction patterns
- [ ] Team comparisons (anonymized)
- [ ] Export insights as PDF
- [ ] Weekly email summaries
- [ ] Achievement predictions

---

## 🧪 Testing Strategy

### Unit Tests:
- `aiInsightsEngine.test.ts` - Test all algorithms
- `insightGenerators.test.ts` - Test insight text generation

### Component Tests:
- `AIInsightsModal.test.tsx` - Modal rendering
- Insight card display
- Chart rendering

### Integration Tests:
- Full analysis with sample data
- Empty state handling
- Error scenarios

### Manual Test Cases:
1. New user (< 5 sessions) - Show "not enough data"
2. Light user (5-20 sessions) - Show basic insights
3. Regular user (20-50 sessions) - Show all insights
4. Power user (50+ sessions) - Full analysis with trends

---

## 💾 Data Storage

### Cache Strategy:
```typescript
// localStorage key
'timer-ai-insights-cache'

// Cache structure
{
  lastAnalyzed: timestamp,
  data: AnalysisResult,
  sessionCount: number // Invalidate if changed
}

// Cache duration: 5 minutes
```

---

## 📝 Copy/Messaging

### Empty State:
> **Keep tracking to unlock insights!**
> 
> Complete at least 5 timer sessions to see personalized insights about your productivity patterns and get smart recommendations.
> 
> Sessions tracked: 2/5

### Loading State:
> **Analyzing your productivity patterns...**
> 
> This won't take long!

### Error State:
> **Unable to generate insights**
> 
> We couldn't analyze your data right now. Please try again later.

---

## 🎯 Success Criteria

✅ **Must Have:**
- [ ] Productivity score calculation
- [ ] Peak hours detection
- [ ] 3+ insight categories
- [ ] 3+ recommendations
- [ ] Beautiful, responsive UI
- [ ] Works with 5+ sessions
- [ ] Handles empty state
- [ ] Tests passing

✅ **Should Have:**
- [ ] Consistency tracking
- [ ] Trend analysis
- [ ] Weekly summary
- [ ] Chart visualizations
- [ ] Caching system

✅ **Nice to Have:**
- [ ] Advanced pattern recognition
- [ ] Seasonal trends
- [ ] Comparative insights
- [ ] Export functionality

---

## 📋 Checklist

### Before Starting:
- [x] Review existing data structures
- [x] Understand timer history format
- [x] Plan algorithm approach
- [x] Design UI mockups
- [x] Write comprehensive plan

### During Implementation:
- [ ] TDD approach for algorithms
- [ ] Mobile-first UI design
- [ ] Accessibility considerations
- [ ] Performance optimization
- [ ] Error handling

### After Implementation:
- [ ] All tests passing
- [ ] Build successful
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] Feature demo ready

---

**Status:** 📋 Planning Complete - Ready for Implementation  
**Next Step:** Create `aiInsightsEngine.ts` and implement core algorithms  
**Estimated Time:** 2-3 hours total

---

## 🤔 Questions Before We Start?

1. Should we add a `completed` field to TimerHistoryRecord for completion rate analysis?
2. What period options should we offer? (7, 30, 90 days, All time)
3. Should insights auto-refresh or require manual refresh?
4. Should we show a "New insights available" badge?
5. Any specific insights you'd like prioritized?

Let me know if you approve this plan or want any changes!
