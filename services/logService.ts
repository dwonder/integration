
import { TransactionLog } from '../types';

const LOG_KEY = 'bayward_activity_logs';

export const getLogs = (): TransactionLog[] => {
  try {
    const logs = localStorage.getItem(LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

export const addLog = (entry: Omit<TransactionLog, 'id' | 'timestamp'>) => {
  try {
    const logs = getLogs();
    const newLog: TransactionLog = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    // Keep most recent 100 logs
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("Failed to save log", e);
  }
};

export const clearLogs = () => {
  localStorage.removeItem(LOG_KEY);
};
