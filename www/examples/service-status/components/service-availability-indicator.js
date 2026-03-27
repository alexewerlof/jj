import { fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./service-availability-indicator.html'))

export class ServiceAvailabilityIndicator extends HTMLElement {
    static defined = defineComponent('service-availability-indicator', ServiceAvailabilityIndicator)

    #root
    #isMounted = false
    #service = null
    #days = 90
    #serviceNameEl
    #serviceStateEl
    #slotsEl
    #axisStartEl
    #axisValueEl
    #axisEndEl

    async connectedCallback() {
        this.#root = JJHE.from(this)
        await this.#mount()
        this.#updateDynamic()
    }

    /**
     * Public API used by the page script.
     * @param {object} service - Service record built by index.js
     * @param {{ days?: number }} options - Rendering options
     */
    setData(service, options = {}) {
        this.#service = service
        this.#days = options.days ?? this.#days
        this.#updateDynamic()
        return this
    }

    async #mount() {
        if (this.#isMounted || !this.#root) {
            return
        }

        this.#root.setClass('status-row').setTemplate(await templatePromise)
        this.#serviceNameEl = this.#root.find('.service-name', true)
        this.#serviceStateEl = this.#root.find('.service-state', true)
        this.#slotsEl = this.#root.find('.status-row__slots', true)
        this.#axisStartEl = this.#root.find('.status-row__axis-start', true)
        this.#axisValueEl = this.#root.find('.status-row__axis-value', true)
        this.#axisEndEl = this.#root.find('.status-row__axis-end', true)
        this.#isMounted = true
    }

    #updateDynamic() {
        if (!this.#isMounted || !this.#service) {
            return
        }

        this.#serviceNameEl.setText(this.#service.name)
        this.#serviceStateEl
            .setClass('service-state')
            .addClass(this.#service.statusClass)
            .setText(this.#service.statusLabel)
        this.#axisStartEl.setText(`${this.#days} days ago`)
        this.#axisValueEl.setText(formatPeriodLabel(this.#service.periodAvg, this.#service.primarySli))
        this.#axisEndEl.setText('Today')
        this.#slotsEl.empty().addChildMap(this.#service.timeline, (day) => this.#createDaySlot(day))
    }

    #createDaySlot(day) {
        const slotClass = getSlotClass(day.hasData, day.primaryValue, this.#service.primarySli.slo)
        const slot = JJHE.create('div').addClass('status-slot', `status-slot--${slotClass}`)

        const tooltip = JJHE.create('div').addClass('status-slot__tooltip')
        tooltip
            .addChild(JJHE.create('div').addClass('tooltip-date').setText(formatDateShort(day.date)))
            .addChild(createTooltipBody(day))

        slot.addChild(tooltip)
        return slot
    }
}

function createTooltipBody(day) {
    const container = JJHE.create('div').addClass('tooltip-copy')

    if (!day.hasData) {
        return container.addChild(JJHE.create('p').setText('No downtime recorded on this day.'))
    }

    day.sliValues.forEach((sli) => {
        if (sli.value !== null) {
            container.addChild(JJHE.create('p').setText(`${sli.metric}: ${formatSliValue(sli)}`))
        }
    })

    day.events.forEach((event) => {
        container.addChild(JJHE.create('p').addClass('tooltip-event').setText(`! ${event.description}`))
    })

    return container
}

function getSlotClass(hasData, value, slo) {
    if (!hasData) return 'empty'
    const health = computeSliHealth(value, slo)
    if (health < 0) return 'breached'
    if (health < 0.5) return 'degraded'
    return 'healthy'
}

function computeSliHealth(value, slo) {
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

function formatSliValue(sli) {
    if (sli.value === null) return 'No data'
    if (sli.unit === '%') return `${sli.value.toFixed(2)}%`
    return `${sli.value}${sli.unit}`
}

function formatDateShort(isoDate) {
    const d = new Date(`${isoDate}T00:00:00Z`)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function formatPeriodLabel(avg, primarySli) {
    if (primarySli.metric === 'availability') return `${avg.toFixed(2)}% uptime`
    return `${avg.toFixed(0)} ${primarySli.unit} avg`
}
