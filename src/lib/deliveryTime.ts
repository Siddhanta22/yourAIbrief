// User.preferredSendTime is stored as 24-hour "HH:MM" (that's what the native
// <input type="time"> in SubscriptionForm produces, and what /api/subscribe
// stores as-is). The 12-hour "HH:MM AM/PM" fallback below only exists for any
// older rows that predate the switch to the native time input.
export function parsePreferredHour(userTime: string | null | undefined): number | null {
  if (!userTime) return null;

  const h24 = userTime.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour = parseInt(h24[1], 10);
    return hour >= 0 && hour <= 23 ? hour : null;
  }

  const h12 = userTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (h12) {
    let hour = parseInt(h12[1], 10);
    const ampm = h12[3].toUpperCase();
    if (ampm === 'PM' && hour !== 12) hour += 12;
    else if (ampm === 'AM' && hour === 12) hour = 0;
    return hour;
  }

  return null;
}
