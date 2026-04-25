/**
 * One friendly sentence about the selected day, compared with the user's usual day this month.
 * `usual` is the average per active day (minor units), or 0 if there's no history yet.
 */
export function dayInsight({
  total,
  usual,
  isToday,
  hour = new Date().getHours(),
}: {
  total: number;
  usual: number;
  isToday: boolean;
  hour?: number;
}): string {
  if (total === 0) {
    if (!isToday) return 'A no-spend day. Nice.';
    return hour < 12 ? 'Fresh day. Nothing spent yet.' : 'Nothing spent yet today.';
  }
  if (!usual) return isToday ? 'Your first entries. Off to a good start.' : 'Logged and done.';
  const ratio = total / usual;
  if (ratio < 0.6) return isToday ? 'Lighter than your usual day.' : 'A lighter day than usual.';
  if (ratio <= 1.3) return 'Right around your usual day.';
  if (ratio <= 2.5) return 'A bit more than your usual day.';
  return 'A big day. Maybe a one-off?';
}
