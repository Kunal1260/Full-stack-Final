import { useRef, useEffect, useState } from 'react';

// Global registry of component render counts
const componentRenderCounts: Record<string, number> = {};
const listeners: Set<() => void> = new Set();

export function getRenderCountsSnapshot(): Record<string, number> {
  return { ...componentRenderCounts };
}

export function resetRenderCounts(): void {
  for (const k of Object.keys(componentRenderCounts)) {
    componentRenderCounts[k] = 0;
  }
  listeners.forEach((fn) => fn());
}

export function subscribeRenderCounts(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useRenderTracker(componentName: string, isOptimized: boolean = true) {
  const renderCountRef = useRef(0);
  const flashElemRef = useRef<HTMLDivElement | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  renderCountRef.current++;
  componentRenderCounts[componentName] = (componentRenderCounts[componentName] || 0) + 1;

  useEffect(() => {
    // Notify listeners of global render update
    listeners.forEach((fn) => fn());

    // Trigger visual flash
    setFlashKey((k) => k + 1);
  }, []);

  // Update on each render
  useEffect(() => {
    if (renderCountRef.current > 1) {
      setFlashKey((k) => k + 1);
    }
  });

  return {
    renderCount: renderCountRef.current,
    flashClass: isOptimized ? 'render-flash-green' : 'render-flash-red',
    flashKey,
    ref: flashElemRef,
  };
}
