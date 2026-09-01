import { useEffect, useRef } from 'react';

export type HotkeyMap = Record<string, string>;
export type HotkeyHandlers = Record<string, () => void>;

interface ParsedHotkey {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

// Accepts the mousetrap-flavoured syntax the app already used, e.g.
// 'x', 'command+z', 'command+shift+z'. `command` matches meta OR ctrl so the
// same binding works on macOS and on Windows/Linux.
function parse(combo: string): ParsedHotkey {
  const parts = combo.toLowerCase().split('+');

  return {
    key: parts[parts.length - 1],
    mod: parts.includes('command') || parts.includes('ctrl') || parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
  };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

export default function useHotkeys(
  keyMap: HotkeyMap,
  handlers: HotkeyHandlers
) {
  // Keep the latest handlers without re-binding the listener on every render.
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const bindings = Object.entries(keyMap).map(
      ([name, combo]) => [name, parse(combo)] as const
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      const pressed = event.key.toLowerCase();

      for (const [name, binding] of bindings) {
        if (
          binding.key === pressed &&
          binding.mod === mod &&
          binding.shift === event.shiftKey &&
          binding.alt === event.altKey
        ) {
          const handler = handlersRef.current[name];

          if (handler) {
            event.preventDefault();
            handler();
          }

          return;
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [keyMap]);
}
