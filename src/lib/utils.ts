import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem("guestId");
  if (existing) return existing;

  const newId = crypto.randomUUID();
  localStorage.setItem("guestId", newId);

  return newId;
}