/**
 * Internal fake data generator for service status examples.
 *
 * This module is intentionally pure and deterministic: the same
 * (serviceId, date) input yields the same generated values.
 */

// Defines monitored services, their SLIs/SLOs, and incident templates.
const SERVICE_CATALOG = {
    'auth-api': {
        name: 'User Authentication API',
        slis: [
            {
                metric: 'availability',
                unit: '%',
                primary: true,
                baseline: 99.82,
                slo: {
                    target: 99,
                    ideal: 100,
                    direction: 'above',
                },
            },
            {
                metric: 'latency',
                unit: 'ms',
                primary: false,
                baseline: 125,
                slo: {
                    target: 250,
                    ideal: 80,
                    direction: 'below',
                },
            },
        ],
        incidentTemplates: [
            { severity: 2, description: 'Outage between 12:01 and 12:46 UTC.' },
            { severity: 1, description: 'Token refresh endpoint returned elevated 5xx errors.' },
            { severity: 1, description: 'OAuth provider round-trip latency exceeded 2 s.' },
            { severity: 0, description: 'Planned key rotation caused short authentication retries.' },
        ],
        disruptionRate: 0.1,
    },

    www: {
        name: 'Landing Page',
        slis: [
            {
                metric: 'availability',
                unit: '%',
                primary: true,
                baseline: 99.94,
                slo: { target: 99.5, ideal: 100, direction: 'above' },
            },
            {
                metric: 'latency',
                unit: 'ms',
                primary: false,
                baseline: 82,
                slo: { target: 300, ideal: 50, direction: 'below' },
            },
        ],
        incidentTemplates: [
            { severity: 1, description: 'CDN edge cache invalidation ran longer than expected.' },
            { severity: 0, description: 'Scheduled maintenance for image optimisation workers.' },
            { severity: 0, description: 'Minor DNS propagation delay in the EU region.' },
        ],
        disruptionRate: 0.07,
    },

    api: {
        name: 'Main Backend API',
        slis: [
            {
                metric: 'availability',
                unit: '%',
                primary: true,
                baseline: 99.72,
                slo: { target: 99, ideal: 100, direction: 'above' },
            },
            {
                metric: 'latency',
                unit: 'ms',
                primary: false,
                baseline: 172,
                slo: { target: 400, ideal: 100, direction: 'below' },
            },
        ],
        incidentTemplates: [
            { severity: 2, description: 'Primary database failover introduced write throttling.' },
            { severity: 1, description: 'Background job queue buildup increased API latency.' },
            { severity: 1, description: 'Deployment rollback briefly reduced API capacity.' },
            { severity: 0, description: 'Planned schema migration ran in read-only mode.' },
        ],
        disruptionRate: 0.14,
    },
}

function seededFloat(seed) {
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0
    }
    return h / 0xffffffff
}

function pickDisruption(serviceId, date, templates, rate) {
    if (seededFloat(`${serviceId}:${date}:disruption`) > rate) return null
    const idx = Math.floor(seededFloat(`${serviceId}:${date}:template`) * templates.length)
    return templates[idx]
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function generateDailyValue(serviceId, date, sliDef, disruption) {
    const { metric, baseline, slo } = sliDef
    const jitter =
        (seededFloat(`${serviceId}:${date}:${metric}:jitter`) - 0.5) *
        (slo.direction === 'above' ? 0.3 : baseline * 0.25)
    let value = baseline + jitter

    if (disruption) {
        const impact = seededFloat(`${serviceId}:${date}:${metric}:impact`)
        if (slo.direction === 'above') {
            value = slo.target - impact * (disruption.severity + 1) * 0.8
        } else {
            value = slo.target * (0.75 + impact * 0.5 * ((disruption.severity + 1) / 3))
        }
    }

    const minVal = slo.direction === 'above' ? Math.max(0, slo.target - 3) : slo.ideal
    const maxVal = slo.direction === 'above' ? 100 : slo.target * 1.4
    const decimals = slo.direction === 'above' ? 2 : 0
    return Number(clamp(value, minVal, maxVal).toFixed(decimals))
}

function getServiceData(serviceId, def, dates) {
    const slis = def.slis.map((sliDef) => {
        const days = {}

        for (const date of dates) {
            if (seededFloat(`${serviceId}:${date}:hasdata`) < 0.05) {
                days[date] = null
                continue
            }

            const disruption = pickDisruption(serviceId, date, def.incidentTemplates, def.disruptionRate)
            const value = generateDailyValue(serviceId, date, sliDef, disruption)
            const events =
                sliDef.primary && disruption
                    ? [{ severity: disruption.severity, description: disruption.description }]
                    : []

            days[date] = { value, events }
        }

        return { ...sliDef, days }
    })

    return { name: def.name, slis }
}

function createDateRange(days, till = Date.now()) {
    const endDate = new Date(till)
    endDate.setHours(0, 0, 0, 0)

    return Array.from({ length: days }, (_, i) => {
        const d = new Date(endDate)
        d.setDate(endDate.getDate() - (days - 1 - i))
        return d.toISOString().slice(0, 10)
    })
}

/**
 * Internal generator used by server.js.
 * @param {number} days
 * @param {number} till
 * @returns {{ services: Record<string, { name: string, slis: Array<object> }> }}
 */
export function getData(days, till = Date.now()) {
    const dates = createDateRange(days, till)
    const services = {}

    for (const [id, def] of Object.entries(SERVICE_CATALOG)) {
        services[id] = getServiceData(id, def, dates)
    }

    return { services }
}
