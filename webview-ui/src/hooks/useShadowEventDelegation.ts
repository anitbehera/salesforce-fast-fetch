import { useEffect } from "react";

/**
 * Hook to listen to events on web components (with or without shadow DOM delegation).
 *
 * @param ref - Ref to the host element (e.g., <vscode-tree>, <vscode-multi-select>)
 * @param eventType - Type of event to listen for (e.g., "click", "change")
 * @param handler - Callback when event occurs. Provides the matched element and event.
 * @param selector - Optional CSS selector for event delegation inside shadow DOM
 */
export function useShadowEventDelegation<TargetEl extends HTMLElement>(
  ref: React.RefObject<HTMLElement | null>,
  eventType: string,
  handler: (el: TargetEl, ev: Event) => void,
  selector?: string
) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const handleEvent = (ev: Event) => {
      if (selector) {
        // Delegated: find matching element in composed path
        const path = ev.composedPath() as EventTarget[];
        const match = path.find(
          (el): el is TargetEl =>
            el instanceof HTMLElement && el.matches(selector)
        );
        if (match) handler(match, ev);
      } else {
        // Direct: just call handler on the host itself
        handler(host as TargetEl, ev);
      }
    };

    host.addEventListener(eventType, handleEvent, true);
    return () => host.removeEventListener(eventType, handleEvent, true);
  }, [ref, eventType, selector, handler]);
}
