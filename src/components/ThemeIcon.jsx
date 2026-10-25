import { useTheme } from '../hooks/useTheme.js';
import { MoonIcon, SunIcon } from './Icons.jsx';

/** Sun in light mode, moon in dark mode. */
export default function ThemeIcon() {
  const { theme } = useTheme();
  return theme === 'dark' ? <MoonIcon key="moon" /> : <SunIcon key="sun" />;
}
