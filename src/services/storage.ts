/**
 * Storage Service — abstraction layer over localStorage
 * Ready to swap to SecureStorage / IndexedDB in production
 */

export const StorageService = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error("StorageService.set failed:", err);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("StorageService.remove failed:", err);
    }
  },

  getJSON<T = unknown>(key: string): T | null {
    const raw = StorageService.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJSON(key: string, value: unknown): void {
    StorageService.set(key, JSON.stringify(value));
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (err) {
      console.error("StorageService.clear failed:", err);
    }
  },
};
