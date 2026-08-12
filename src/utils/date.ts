export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDisplayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

export function fromDisplayDate(displayDate: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(displayDate);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}
