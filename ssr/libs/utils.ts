import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export const protocol =
  process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOTP(): string {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const formatValue = (value: number): string =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
    notation: 'compact',
  }).format(value);

export const formatThousands = (value: number): string =>
  Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 3,
    notation: 'compact',
  }).format(value);

// Color fallback map for common CSS variables
const COLOR_FALLBACKS: Record<string, string> = {
  '--color-violet-500': '#8b5cf6',
  '--color-violet-600': '#7c3aed',
  '--color-sky-500': '#0ea5e9',
  '--color-sky-600': '#0284c7',
  '--color-gray-400': '#9ca3af',
  '--color-gray-500': '#6b7280',
  '--color-gray-600': '#4b5563',
  '--color-gray-700': '#374151',
  '--color-gray-800': '#1f2937',
  '--color-gray-100': '#f3f4f6',
  '--color-gray-200': '#e5e7eb',
  '--color-white': '#ffffff',
  '--color-red-500': '#ef4444',
  '--color-emerald-500': '#10b981',
  '--color-amber-500': '#f59e0b',
};

export const getCssVariable = (variable: string): string => {
  if (typeof window === 'undefined') {
    // Return fallback color for server-side rendering
    return COLOR_FALLBACKS[variable] || '#000000';
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  // Return value if found, otherwise return fallback
  return value || COLOR_FALLBACKS[variable] || '#000000';
};

const adjustHexOpacity = (hexColor: string, opacity: number): string => {
  // Remove the '#' if it exists
  hexColor = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustHSLOpacity = (hslColor: string, opacity: number): string => {
  // Convert HSL to HSLA
  return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
};

const adjustOKLCHOpacity = (oklchColor: string, opacity: number): string => {
  // Add alpha value to OKLCH color
  return oklchColor.replace(
    /oklch\((.*?)\)/,
    (match, p1) => `oklch(${p1} / ${opacity})`,
  );
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  // Handle empty or invalid color
  if (!color || color.trim() === '') {
    return `rgba(0, 0, 0, ${opacity})`;
  }

  if (color.startsWith('#')) {
    return adjustHexOpacity(color, opacity);
  } else if (color.startsWith('hsl')) {
    return adjustHSLOpacity(color, opacity);
  } else if (color.startsWith('oklch')) {
    return adjustOKLCHOpacity(color, opacity);
  } else if (color.startsWith('rgb')) {
    // Handle RGB colors by converting to RGBA
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  } else {
    // Fallback: return the color as-is with transparency (might not work for all formats)
    // Better to return a valid transparent color than empty string
    return `rgba(0, 0, 0, ${opacity})`;
  }
};

export const oklchToRGBA = (oklchColor: string): string => {
  // Create a temporary div to use for color conversion
  const tempDiv = document.createElement('div');
  tempDiv.style.color = oklchColor;
  document.body.appendChild(tempDiv);

  // Get the computed style and convert to RGB
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  return computedColor;
};
