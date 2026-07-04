export function evaluateCheckinStatus(studyLog) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = studyLog.filter((entry) => entry.date.slice(0, 10) === today);

  return {
    today,
    isCheckedIn: todaysEntries.length > 0,
    completedActions: todaysEntries,
  };
}
