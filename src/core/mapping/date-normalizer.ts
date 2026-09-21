const ID_MONTH_MAP: Record<string, number> = {
  januari: 0,
  jan: 0,
  january: 0,
  februari: 1,
  feb: 1,
  february: 1,
  maret: 2,
  mar: 2,
  march: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  juni: 5,
  jun: 5,
  june: 5,
  juli: 6,
  jul: 6,
  july: 6,
  agustus: 7,
  agu: 7,
  agt: 7,
  ags: 7,
  aug: 7,
  august: 7,
  september: 8,
  sep: 8,
  sept: 8,
  oktober: 9,
  okt: 9,
  oct: 9,
  october: 9,
  november: 10,
  nov: 10,
  desember: 11,
  des: 11,
  dec: 11,
  december: 11,
};

export function parseFlexibleDate(val: unknown): Date | null {
  if (val === null || val === undefined || val === "") return null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return val;
  }

  const str = String(val).trim();
  if (!str) return null;

  // 1. Check YYYY-MM-DD or YYYY/MM/DD (with optional HH:mm:ss)
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const hours = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
    const minutes = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    const seconds = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY (with optional HH:mm:ss) -> Indonesian standard
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 3. Check text month in Indonesian / English: "02-Agu-2026", "2 Agustus 2026", "18-Sep-2026 14:00"
  const textMonthMatch = str.match(/^(\d{1,2})[\s\-]+([a-zA-Z]+)[\s\-]+(\d{4})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1], 10);
    const monthStr = textMonthMatch[2].toLowerCase();
    const year = parseInt(textMonthMatch[3], 10);
    const hours = textMonthMatch[4] ? parseInt(textMonthMatch[4], 10) : 0;
    const minutes = textMonthMatch[5] ? parseInt(textMonthMatch[5], 10) : 0;
    const seconds = textMonthMatch[6] ? parseInt(textMonthMatch[6], 10) : 0;

    if (monthStr in ID_MONTH_MAP) {
      const month = ID_MONTH_MAP[monthStr];
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 4. Fallback: direct JS Date parse
  const parsedDirect = new Date(str);
  if (!isNaN(parsedDirect.getTime()) && str.length >= 8 && /\d/.test(str)) {
    if (parsedDirect.getFullYear() > 1970 && parsedDirect.getFullYear() < 2100) {
      return parsedDirect;
    }
  }

  return null;
}

export function isDateLike(val: unknown): boolean {
  return parseFlexibleDate(val) !== null;
}
