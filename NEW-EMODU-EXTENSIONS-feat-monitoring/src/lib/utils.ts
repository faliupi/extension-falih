import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const capitalize = (name: string) => {
  const nameSplit = name.split(" ")
  const nameCapitalized = nameSplit
    .map((name) => name[0].toUpperCase() + name.slice(1))
    .join(" ");

  return nameCapitalized;
};