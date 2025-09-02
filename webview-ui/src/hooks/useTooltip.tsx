import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export function useTooltip<T>() {
  const [hovered, setHovered] = useState<T | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [config, setConfig] = useState<{
    selector: string;
    extractData: (el: HTMLElement) => T | null;
  } | null>(null);

  // Effect runs when config changes
  useEffect(() => {
    if (!config) return;

    const { selector, extractData } = config;

    const onMouseEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      setHovered(extractData(el));
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + 40, y: rect.bottom + 4 });
    };

    const onMouseLeave = () => {
      setHovered(null);
    };

    const nodes = document.querySelectorAll<HTMLElement>(selector);
    nodes.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });

    return () => {
      nodes.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, [config]);

  // instead of calling useEffect, attach just sets the config
  const attach = (selector: string, extractData: (el: HTMLElement) => T | null) => {
    setConfig({ selector, extractData });
  };

  const TooltipPortal = ({ children }: { children: React.ReactNode }) =>
    hovered
      ? ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.y,
              left: pos.x,
              zIndex: 1000,
            }}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return { hovered, attach, TooltipPortal };
}
