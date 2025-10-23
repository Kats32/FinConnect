// hooks/useLocalStorage.ts
"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setValue(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to parse localStorage", e);
      }
    }
  }, [key]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }, [key, value, isClient]);

  return [value, setValue] as const;
}