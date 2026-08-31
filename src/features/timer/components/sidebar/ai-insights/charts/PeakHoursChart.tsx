/**
 * Peak Hours Chart - Hourly productivity heatmap
 */

interface HourlyData {
  hour: number
  sessions: number
  duration: number
  completionRate: number
}

interface PeakHoursChartProps {
  data: HourlyData[]
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const maxSessions = Math.max(...data.map((d) => d.sessions), 1)

  const formatHour = (hour: number) => {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    if (hour < 12) return `${hour}AM`
    return `${hour - 12}PM`
  }

  const getIntensityColor = (sessions: number) => {
    const intensity = sessions / maxSessions
    if (intensity === 0) return 'bg-slate-100 dark:bg-slate-700'
    if (intensity < 0.25) return 'bg-primary/20'
    if (intensity < 0.5) return 'bg-primary/40'
    if (intensity < 0.75) return 'bg-primary/60'
    return 'bg-primary/80'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-600 dark:bg-slate-700">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
        {data.map((hourData) => (
          <div key={hourData.hour} className="group relative">
            <div
              className={`aspect-square rounded-lg ${getIntensityColor(hourData.sessions)} cursor-pointer transition-all hover:ring-2 hover:ring-primary`}
              title={`${formatHour(hourData.hour)}: ${hourData.sessions} sessions`}
            >
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {hourData.hour}
                </span>
              </div>
            </div>

            {/* Tooltip */}
            {hourData.sessions > 0 && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform group-hover:block">
                <div className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-slate-700">
                  <div className="mb-1 font-semibold">{formatHour(hourData.hour)}</div>
                  <div>Sessions: {hourData.sessions}</div>
                  <div>Time: {formatDuration(hourData.duration)}</div>
                  <div>Completion: {Math.round(hourData.completionRate)}%</div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-600">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Less activity</span>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-4 w-4 rounded bg-primary/20" />
            <div className="h-4 w-4 rounded bg-primary/40" />
            <div className="h-4 w-4 rounded bg-primary/60" />
            <div className="h-4 w-4 rounded bg-primary/80" />
          </div>
          <span>More activity</span>
        </div>
      </div>
    </div>
  )
}
