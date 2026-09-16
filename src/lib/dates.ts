// PrimeRX stores calendar dates with no time of day (fill dates, due dates,
// DOB, pickup dates). They reach the browser either as "YYYY-MM-DD" or as a
// midnight-UTC timestamp. `new Date("2026-08-26")` is midnight UTC, which in
// Los Angeles is 5pm on Aug 25 — so every such date rendered a day early.
// Parse them as LOCAL calendar dates instead; only real timestamps (with a
// non-midnight time) are parsed as instants.

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z)?$/;

export function parseApiDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = CALENDAR_DATE.exec(iso);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fmtDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
  empty = "—",
): string {
  const d = parseApiDate(iso);
  return d ? d.toLocaleDateString(undefined, opts) : empty;
}
