import { generateData } from './data-generator.js'

// ─── Public fake server API ───────────────────────────────────────────────────

/**
 * Return all service status data for a window of `days` ending at `till`.
 *
 * Swap this function body for a real fetch() call to connect to a live backend —
 * the shape of the return value is the stable contract the UI depends on.
 *
 * @param {number} days - Number of days to include in the window.
 * @param {number} till - End of the window as a Unix timestamp (ms). Defaults to now.
 * @returns {{ services: Record<string, { name: string, slis: Array<object> }> }}
 */
export function getData(days, till = Date.now()) {
    return generateData(days, till)
}
