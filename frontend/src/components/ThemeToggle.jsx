import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

// ThemeToggle component – toggles between light and dark mode using next-themes
// Uses a simple button with an icon; you can replace icons with lucide-react if desired.
const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch – wait until client side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = theme === 'system' ? systemTheme : theme;

  const toggle = () => {
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-sm text-[#171717] hover:text-[#78AFCF] transition-colors"
      data-testid="theme-toggle"
    >
      {current === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeToggle;
