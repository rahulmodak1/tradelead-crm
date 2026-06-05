export const FOLLOW_UP_TABS = [
  { id: 'today', label: 'Due Today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'upcoming', label: 'Upcoming' },
];

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function hasActivePendingFollowUp(lead) {
  return Boolean(lead?.followUpDate && lead?.status !== 'Closed');
}

export function getFollowUpType(lead) {
  if (!hasActivePendingFollowUp(lead)) return null;

  const followUpDate = new Date(lead.followUpDate);
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  if (followUpDate < todayStart) return 'overdue';
  if (followUpDate <= todayEnd) return 'today';
  return 'upcoming';
}

export function groupFollowUps(leads = []) {
  const groups = {
    today: [],
    overdue: [],
    upcoming: [],
  };

  leads.forEach((lead) => {
    const type = getFollowUpType(lead);
    if (type) groups[type].push(lead);
  });

  Object.values(groups).forEach((items) => {
    items.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  });

  return groups;
}

export function summarizeFollowUps(leads = []) {
  const groups = groupFollowUps(leads);
  const dueToday = groups.today.length;
  const overdue = groups.overdue.length;
  const upcoming = groups.upcoming.length;

  return {
    dueToday,
    overdue,
    upcoming,
    activePending: dueToday + overdue + upcoming,
    reminderCount: dueToday + overdue,
  };
}

export function latestFollowUpNote(lead) {
  const history = [...(lead?.followUpHistory || [])]
    .sort((a, b) => new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate));
  return history[0]?.note || lead?.notes || '';
}
