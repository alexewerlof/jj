export const DEFAULT_SLS_PERIOD_DAYS = 30

export function buildServiceRecords(services, days, options = {}) {
    const dateRange = buildDateRange(days)
    const slsPeriodDays = options.slsPeriodDays ?? DEFAULT_SLS_PERIOD_DAYS

    return Object.entries(services).map(([id, serviceData]) => {
        const primarySli = serviceData.slis.find((sli) => sli.primary)

        const timeline = dateRange.map((date) => {
            const primaryDayData = primarySli.days[date]
            const hasData = primaryDayData != null
            const sliValues = serviceData.slis.map((sli) => ({
                metric: sli.metric,
                unit: sli.unit,
                value: sli.days[date]?.value ?? null,
            }))

            return {
                date,
                hasData,
                primaryValue: primaryDayData?.value ?? null,
                sliValues,
                events: hasData ? (primaryDayData.events ?? []) : [],
            }
        })

        const daysWithData = timeline.filter((day) => day.hasData)
        const periodAvg = computePeriodAvg(daysWithData.map((day) => day.primaryValue))
        const { label: statusLabel, cssClass: statusClass } = computeStatusLabel(timeline, primarySli)

        return {
            id,
            name: serviceData.name,
            primarySli,
            sliDefs: serviceData.slis,
            timeline,
            slsPeriodDays,
            slsPeriods: buildSlsPeriods(timeline, primarySli, slsPeriodDays),
            periodAvg,
            daysWithDataCount: daysWithData.length,
            statusLabel,
            statusClass,
        }
    })
}

export function buildDateRange(days) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: days }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (days - 1 - i))
        return d.toISOString().slice(0, 10)
    })
}

export function computePeriodAvg(values) {
    const avg = computeAverage(values)
    return avg ?? 0
}

export function computeStatusLabel(timeline, primarySli) {
    const latest = [...timeline].reverse().find((day) => day.hasData)
    if (!latest) {
        return { label: 'No Data', cssClass: 'status-no-data' }
    }

    const health = computeSliHealth(latest.primaryValue, primarySli.slo)
    if (health >= 1) {
        return { label: 'Operational', cssClass: 'status-operational' }
    }
    if (health > 0) {
        return { label: 'Degraded Performance', cssClass: 'status-degraded' }
    }
    return { label: 'Service Disruption', cssClass: 'status-disruption' }
}

export function buildSlsPeriods(timeline, primarySli, slsPeriodDays) {
    const periods = []

    for (let start = 0; start < timeline.length; start += slsPeriodDays) {
        const window = timeline.slice(start, start + slsPeriodDays)
        const observedDays = window.filter((day) => day.hasData)
        const incidents = window.flatMap((day) =>
            day.events.map((event) => ({
                ...event,
                date: day.date,
            })),
        )
        const degradedDays = observedDays.filter(
            (day) => computeSliHealth(day.primaryValue, primarySli.slo) < 0.5,
        ).length
        const breachDays = observedDays.filter((day) => computeSliHealth(day.primaryValue, primarySli.slo) < 0).length

        periods.push({
            startDate: window[0].date,
            endDate: window.at(-1).date,
            hasData: observedDays.length > 0,
            primaryValue: computeAverage(observedDays.map((day) => day.primaryValue)),
            sliValues: aggregateSliValues(window),
            incidents,
            observedDays: observedDays.length,
            totalDays: window.length,
            degradedDays,
            breachDays,
        })
    }

    return periods
}

export function computeSliHealth(value, slo) {
    if (slo.direction === 'above') {
        const budget = 100 - slo.target
        if (budget <= 0) {
            return value >= slo.target ? 1 : -1
        }

        const degradation = slo.target - value
        if (degradation <= 0) {
            return 1
        }

        return (budget - degradation) / budget
    }

    const budget = slo.target - slo.ideal
    if (budget <= 0) {
        return value <= slo.target ? 1 : -1
    }

    const degradation = value - slo.target
    if (degradation <= 0) {
        return 1
    }

    return (budget - degradation) / budget
}

export function getSlotClass(hasData, value, slo) {
    if (!hasData || value === null) {
        return 'empty'
    }

    const health = computeSliHealth(value, slo)
    if (health < 0) {
        return 'breached'
    }
    if (health < 0.5) {
        return 'degraded'
    }
    return 'healthy'
}

export function formatSliValue(sli) {
    if (sli.value === null) {
        return 'No data'
    }
    if (sli.unit === '%') {
        return `${sli.value.toFixed(2)}%`
    }
    return `${sli.value}${sli.unit}`
}

export function formatDateShort(isoDate) {
    const d = new Date(`${isoDate}T00:00:00Z`)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function formatPeriodLabel(avg, primarySli) {
    if (primarySli.metric === 'availability') {
        return `${avg.toFixed(2)}% uptime`
    }
    return `${avg.toFixed(0)} ${primarySli.unit} avg`
}

function computeAverage(values) {
    const valid = values.filter((value) => value !== null)
    if (valid.length === 0) {
        return null
    }
    const avg = valid.reduce((sum, value) => sum + value, 0) / valid.length
    return parseFloat(avg.toFixed(10))
}

function aggregateSliValues(window) {
    const firstDay = window[0]
    return firstDay.sliValues.map((sli, index) => ({
        metric: sli.metric,
        unit: sli.unit,
        value: computeAverage(window.map((day) => day.sliValues[index].value)),
    }))
}
