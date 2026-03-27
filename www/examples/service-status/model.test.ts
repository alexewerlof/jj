import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { buildDateRange, buildServiceRecords, getSlotClass } from './model.js'

function createAvailabilityService(values, target = 99) {
    const days = {}
    const dates = buildDateRange(values.length)

    values.forEach((value, index) => {
        const events = index === 35 ? [{ severity: 1, description: 'Cache saturation caused retries.' }] : []
        days[dates[index]] = value === null ? null : { value, events }
    })

    return {
        demo: {
            name: 'Demo Service',
            slis: [
                {
                    metric: 'availability',
                    unit: '%',
                    primary: true,
                    slo: { target, ideal: 100, direction: 'above' },
                    days,
                },
                {
                    metric: 'latency',
                    unit: 'ms',
                    primary: false,
                    slo: { target: 250, ideal: 80, direction: 'below' },
                    days: Object.fromEntries(
                        dates.map((date, index) => [
                            date,
                            values[index] === null ? null : { value: 100 + index, events: [] },
                        ]),
                    ),
                },
            ],
        },
    }
}

test('buildServiceRecords groups 90 days into 30-day SLS periods', () => {
    const services = createAvailabilityService([
        ...Array.from({ length: 30 }, () => 99.7),
        ...Array.from({ length: 30 }, () => 98.2),
        ...Array.from({ length: 30 }, () => 97.8),
    ])
    const [service] = buildServiceRecords(services, 90)

    assert.equal(service.slsPeriods.length, 3)
    assert.equal(service.slsPeriods[0].primaryValue, 99.7)
    assert.equal(service.slsPeriods[1].primaryValue, 98.2)
    assert.equal(service.slsPeriods[2].primaryValue, 97.8)
    assert.equal(service.slsPeriods[1].incidents.length, 1)
    assert.equal(getSlotClass(true, service.slsPeriods[0].primaryValue, service.primarySli.slo), 'healthy')
    assert.equal(getSlotClass(true, service.slsPeriods[1].primaryValue, service.primarySli.slo), 'degraded')
    assert.equal(getSlotClass(true, service.slsPeriods[2].primaryValue, service.primarySli.slo), 'breached')
})

test('buildServiceRecords keeps empty SLS periods when a window has no data', () => {
    const services = createAvailabilityService([
        ...Array.from({ length: 30 }, () => 99.5),
        ...Array.from({ length: 30 }, () => null),
        ...Array.from({ length: 30 }, () => 99.1),
    ])
    const [service] = buildServiceRecords(services, 90)

    assert.equal(service.slsPeriods[1].hasData, false)
    assert.equal(service.slsPeriods[1].primaryValue, null)
    assert.equal(service.slsPeriods[1].observedDays, 0)
    assert.equal(getSlotClass(false, service.slsPeriods[1].primaryValue, service.primarySli.slo), 'empty')
})
