/**
 * perfMark — lightweight performance measurement utility.
 *
 * Uses the browser's native Performance Observer API where supported, falling
 * back to console.log in environments that don't support it (SSR, test runners).
 *
 * Usage:
 *   import { perfMark, perfMeasure } from '../utils/perf';
 *
 *   // Mark the start of an operation
 *   perfMark('api-products', 'start');
 *
 *   // ... async work ...
 *
 *   // Mark the end and log the duration
 *   perfMark('api-products', 'end');
 *
 *   // Or measure between two marks
 *   const duration = perfMeasure('api-products');
 *
 * Why this matters:
 *   - Real User Monitoring (RUM) data collected this way feeds directly into
 *     Core Web Vitals dashboards without requiring a paid analytics service.
 *   - Long Tasks (>50ms on the main thread) are surfaced automatically when
 *     a PerformanceObserver is registered for "longtask" entries.
 *   - Pair with the global ErrorBoundary to get a complete picture of what
 *     happened when a user reports a "slow" page.
 */

// Cache the observer instance so we only register it once per page load.
let _longTaskObserver = null;

/**
 * Start a performance mark timer.
 * Call perfMark('my-task', 'end') later to get the duration.
 */
export const perfMark = (label, phase = 'start') => {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  const markName = `[perf] ${label}`;

  if (phase === 'start') {
    performance.mark(`${markName}-start`);
  } else if (phase === 'end') {
    performance.mark(`${markName}-end`);
    const duration = performance.measure(label, `${markName}-start`, `${markName}-end`);
    // Clean up marks after measuring so they don't accumulate.
    performance.clearMarks(`${markName}-start`);
    performance.clearMarks(`${markName}-end`);
    return duration?.duration;
  }
};

/**
 * Measure the duration between two marks. Returns ms (float) or null.
 */
export const perfMeasure = (label) => {
  if (typeof window === 'undefined' || !('performance' in window)) return null;
  try {
    const entries = performance.getEntriesByName(label);
    if (entries.length >= 2) {
      return entries[entries.length - 1].duration;
    }
  } catch {
    // getEntriesByName can throw in some browser contexts.
  }
  return null;
};

/**
 * Register a PerformanceObserver for Long Tasks (browser tasks that block the
 * main thread for >50ms). Long tasks are a leading cause of poor Input Delay
 * (INP) scores. Logs to console in dev; in production you would dispatch
 * to your analytics endpoint.
 */
export const observeLongTasks = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  if (_longTaskObserver) return; // already registered

  try {
    _longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Entries with duration > 50ms are classified as Long Tasks.
        if (entry.duration > 50) {
          const logData = {
            type: 'longtask',
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            attribution: entry.name || '(unattributed)',
            url: window.location.href,
            timestamp: new Date().toISOString(),
          };

          if (import.meta.env.PROD) {
            // TODO: send to analytics endpoint
            // navigator.sendBeacon?.('/api/metrics', JSON.stringify(logData));
          } else {
            console.warn('[LongTask]', logData);
          }
        }
      }
    });
    _longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch {
    // PerformanceObserver may not be supported for 'longtask' in all browsers.
  }
};

/**
 * Capture a Core Web Vital value (LCP, FID/INP, CLS) and store it for
 * reporting. In production, dispatch to your analytics endpoint via
 * sendBeacon so it fires even when the page is being navigated away.
 */
export const captureWebVital = (name, value, delta, rating) => {
  if (typeof window === 'undefined') return;
  const payload = { name, value: Math.round(name === 'CLS' ? value : value), delta, rating, url: window.location.href, timestamp: new Date().toISOString() };

  // Always log in dev.
  if (!import.meta.env.PROD) {
    const style = rating === 'good' ? 'color: green' : rating === 'poor' ? 'color: red' : 'color: orange';
    console.log(`%c[WebVital] ${name}: ${payload.value} (${rating})`, style);
  }

  // TODO: sendBeacon to /api/metrics in production.
  // navigator.sendBeacon?.('/api/metrics', JSON.stringify(payload));
};

export default { perfMark, perfMeasure, observeLongTasks, captureWebVital };
