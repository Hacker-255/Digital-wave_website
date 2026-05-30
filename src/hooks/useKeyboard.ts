import { useEffect, useState, useCallback, useRef } from 'react';

function isInputFocused(): boolean {
  const target = document.activeElement;
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((target as HTMLElement).isContentEditable) return true;
  return false;
}

export function useKeyboard(
  keyMap: Record<string, () => void>,
  enabled = true,
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const [combo, action] of Object.entries(keyMap)) {
        const parts = combo.toLowerCase().split('+');
        const hasCtrl = parts.includes('ctrl') || parts.includes('meta');
        const hasShift = parts.includes('shift');
        const key = parts[parts.length - 1];

        const ctrlMatch = hasCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = hasShift ? e.shiftKey : true;
        const keyMatch = e.key.toLowerCase() === key;

        if (!ctrlMatch || !shiftMatch || !keyMatch) continue;

        const isTyping = isInputFocused();
        if (isTyping && !hasCtrl) continue;

        e.preventDefault();
        e.stopPropagation();
        action();
        return;
      }
    },
    [keyMap, enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [handler, enabled]);
}

export function usePathRoute() {
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onRouteChange = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  return path;
}
