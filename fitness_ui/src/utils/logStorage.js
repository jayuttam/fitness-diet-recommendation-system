export const getDailyLogs = () => {
  return JSON.parse(localStorage.getItem("dailyLogs")) || [];
};

export const saveDailyLog = (log) => {
  const logs = getDailyLogs();
  logs.push(log);
  localStorage.setItem("dailyLogs", JSON.stringify(logs));
};
