// 祝日API: https://holidays-jp.github.io/
const holidayCache = new Map<number, Promise<string[]>>();

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fetchHolidaysOfYear(year: number): Promise<string[]> {
  const cached = holidayCache.get(year);
  if (cached) {
    return cached;
  }
  const promise = (async () => {
    try {
      const response = await fetch(`https://holidays-jp.github.io/api/v1/${year}.json`);
      if (!response.ok) {
        holidayCache.delete(year);
        return [];
      }
      return Object.keys((await response.json()) as Record<string, string>);
    } catch {
      // 取得失敗時は土日のみ除外する計算へフォールバックし、次回再取得できるようにする
      holidayCache.delete(year);
      return [];
    }
  })();
  holidayCache.set(year, promise);
  return promise;
}

/** 基準日から先 約2週間が属する年の祝日を取得する（年またぎ対応）。 */
export async function fetchHolidayDatesAround(baseDate: Date): Promise<Set<string>> {
  const end = new Date(baseDate);
  end.setDate(end.getDate() + 14);
  const years = Array.from(new Set([baseDate.getFullYear(), end.getFullYear()]));
  const lists = await Promise.all(years.map(fetchHolidaysOfYear));
  return new Set(lists.flat());
}

/** 基準日の翌日以降で、土日祝を除く最初の日付(YYYY-MM-DD)を返す。 */
export function getNextBusinessDay(baseDate: Date, holidayDates: ReadonlySet<string>): string {
  const date = new Date(baseDate);
  for (let i = 0; i < 31; i += 1) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6 && !holidayDates.has(formatLocalDate(date))) {
      break;
    }
  }
  return formatLocalDate(date);
}
