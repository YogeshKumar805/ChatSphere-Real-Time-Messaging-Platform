export function addDuration(now, duration) {
  const d = new Date(now);
  switch (duration) {
    case "1_day": d.setDate(d.getDate() + 1); break;
    case "7_days": d.setDate(d.getDate() + 7); break;
    case "1_month": d.setMonth(d.getMonth() + 1); break;
    case "3_months": d.setMonth(d.getMonth() + 3); break;
    default: throw new Error("Invalid duration");
  }
  return d;
}

export function toMysqlDateTime(dt) {
  // YYYY-MM-DD HH:MM:SS
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}
