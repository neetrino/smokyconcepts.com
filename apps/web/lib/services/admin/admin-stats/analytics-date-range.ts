const DEFAULT_PERIOD_DAYS = 7;
const MONTH_PERIOD_DAYS = 30;

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
}

function startOfToday(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function startDaysAgo(days: number): Date {
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOneYearAgo(): Date {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfDay(value: Date): Date {
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return end;
}

function resolveCustomRange(startDate?: string, endDate?: string): AnalyticsDateRange {
  if (!startDate || !endDate) {
    return { start: startDaysAgo(DEFAULT_PERIOD_DAYS), end: endOfDay(new Date()) };
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return { start, end: endOfDay(new Date(endDate)) };
}

/**
 * Calculate date range based on period
 */
export function calculateDateRange(
  period: string,
  startDate?: string,
  endDate?: string
): AnalyticsDateRange {
  if (period === "custom") {
    return resolveCustomRange(startDate, endDate);
  }

  const end = endOfDay(new Date());

  switch (period) {
    case "day":
      return { start: startOfToday(), end };
    case "month":
      return { start: startDaysAgo(MONTH_PERIOD_DAYS), end };
    case "year":
      return { start: startOneYearAgo(), end };
    case "week":
    default:
      return { start: startDaysAgo(DEFAULT_PERIOD_DAYS), end };
  }
}
