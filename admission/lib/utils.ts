import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tierLabel(probability: number): " chạy nước rút " | " phối hoặc kết hôn " | " hòa vốn " {
  if (probability < 40) return " chạy nước rút ";
  if (probability < 70) return " phối hoặc kết hôn ";
  return " hòa vốn ";
}
