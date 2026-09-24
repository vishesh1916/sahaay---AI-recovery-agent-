import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  if (amount === 0) return "₹0";
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const s = abs.toString();
  
  let result = "";
  if (s.length <= 3) {
    result = s;
  } else {
    result = s.slice(-3);
    let remaining = s.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + "," + result;
    }
  }
  
  return (isNegative ? "-₹" : "₹") + result;
}
