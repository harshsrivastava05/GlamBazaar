// Simple toast hook that works without React Context
// Use this if you don't want to set up the ToastProvider

import { useState } from "react";

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

// Simple alert-based implementation for immediate use
export function useToast() {
  const toast = ({ title, description, variant = "default" }: Toast) => {
    const message =
      title && description
        ? `${title}: ${description}`
        : title || description || "Action completed";

    if (variant === "destructive") {
      alert(`❌ Error: ${message}`);
    } else if (variant === "success") {
      alert(`✅ Success: ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }

    // For console logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Toast [${variant}]:`, message);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      dismiss: () => {}, // No-op for alert implementation
    };
  };

  return { toast };
}

// Alternative: Console-only implementation for development
export function useToastDev() {
  const toast = ({ title, description, variant = "default" }: Toast) => {
    const message =
      title && description
        ? `${title}: ${description}`
        : title || description || "Action completed";
    const emoji =
      variant === "destructive" ? "❌" : variant === "success" ? "✅" : "ℹ️";

    console.log(`${emoji} [${variant.toUpperCase()}]: ${message}`);

    return {
      id: Math.random().toString(36).substr(2, 9),
      dismiss: () => {},
    };
  };

  return { toast };
}
