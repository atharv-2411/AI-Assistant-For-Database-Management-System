import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function sleep(ms: number) {
  return await new Promise((r,_) => setTimeout(r, ms));
}

export function cleanSQL(dirtySQL: string) {
  // Removes comments
  return dirtySQL
    .split('\n')
    .map(line => {
      // Find the position of the first '--'
      const commentStart = line.indexOf('--');
      
      // If there's no comment, return the line as is
      if (commentStart === -1) {
        return line;
      }
      
      // Return only the part before the comment, trimmed
      return line.substring(0, commentStart).trim();
    })
    // Filter out empty lines
    .filter(line => line.length > 0)
    // Join back into a single string
    .join('\n');
}