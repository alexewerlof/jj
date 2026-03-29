import { fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'
import { formatDateShort, formatPeriodLabel, formatSliValue, getSlotClass } from '../model.js'

const templatePromise = fetchTemplate(import.meta.resolve('./service-availability-indicator.html'))

export class ServiceAvailabilityIndicator extends HTMLElement {
    static defined = defineComponent('service-availability-indicator', ServiceAvailabilityIndicator)

    #root
    #isMounted = false
    #service = null
    #days = 90
    #serviceNameEl
    #serviceStateEl
    #summaryEl
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
        this.#summaryEl = this.#root.find('.status-row__summary', true)
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
        this.#root.setStyles({
            '--daily-slot-count': String(this.#days),
            '--sls-period-count': String(this.#service.slsPeriods.length),
        })
        this.#summaryEl.empty().addChildMap(this.#service.slsPeriods, (period) => this.#createSummarySlot(period))
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

    #createSummarySlot(period) {
        const slotClass = getSlotClass(period.hasData, period.primaryValue, this.#service.primarySli.slo)
        const slot = JJHE.create('div').addClass('status-slot', 'status-slot--summary', `status-slot--${slotClass}`)

        slot.setAttr(
            'aria-label',
            `${formatPeriodRange(period.startDate, period.endDate)}: ${formatSummaryValue(period, this.#service.primarySli)}`,
        )

        if (period.primaryValue !== null) {
            slot.addChild(
                JJHE.create('span')
                    .addClass('status-slot__label')
                    .setText(formatInlineValue(period, this.#service.primarySli)),
            )
        } else {
            slot.addChild(JJHE.create('span').addClass('status-slot__label').setText('No data'))
        }

        const tooltip = JJHE.create('div').addClass('status-slot__tooltip')
        tooltip
            .addChild(
                JJHE.create('div')
                    .addClass('tooltip-date')
                    .setText(formatPeriodRange(period.startDate, period.endDate)),
            )
            .addChild(createSummaryTooltipBody(period, this.#service.primarySli))

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
        container.addChild(createTooltipEventLine(event.description, event.severity))
    })

    return container
}

function createSummaryTooltipBody(period, primarySli) {
    const container = JJHE.create('div').addClass('tooltip-copy')

    if (!period.hasData) {
        return container.addChild(JJHE.create('p').setText('No service-level data recorded in this window.'))
    }

    container.addChild(JJHE.create('p').setText(`${primarySli.metric} SLS: ${formatSummaryValue(period, primarySli)}`))

    period.sliValues.forEach((sli) => {
        if (sli.metric !== primarySli.metric && sli.value !== null) {
            container.addChild(JJHE.create('p').setText(`${sli.metric} avg: ${formatSliValue(sli)}`))
        }
    })

    container.addChild(
        JJHE.create('p').setText(
            `${period.observedDays}/${period.totalDays} days reported · ${period.breachDays} breach days · ${period.incidents.length} incidents`,
        ),
    )

    period.incidents.slice(0, 2).forEach((incident) => {
        container.addChild(
            createTooltipEventLine(`${formatDateShort(incident.date)}: ${incident.description}`, incident.severity),
        )
    })

    if (period.incidents.length > 2) {
        container.addChild(
            JJHE.create('p')
                .addClass('tooltip-event')
                .setText(`+ ${period.incidents.length - 2} more incidents`),
        )
    }

    return container
}

function formatInlineValue(period, primarySli) {
    if (period.primaryValue === null) {
        return 'No data'
    }

    if (primarySli.unit === '%') {
        return `${period.primaryValue.toFixed(2)}%`
    }

    return `${period.primaryValue.toFixed(0)}${primarySli.unit}`
}

function formatSummaryValue(period, primarySli) {
    return formatSliValue({
        metric: primarySli.metric,
        unit: primarySli.unit,
        value: period.primaryValue,
    })
}

function formatPeriodRange(startDate, endDate) {
    return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
}

function createTooltipEventLine(text, severity) {
    const normalizedSeverity = normalizeSeverity(severity)

    return JJHE.create('p')
        .addClass('tooltip-event', `tooltip-event--severity-${normalizedSeverity}`)
        .addChild(JJHE.create('span').addClass('tooltip-event__dot'))
        .addChild(JJHE.create('span').addClass('tooltip-event__text').setText(text))
}

function normalizeSeverity(severity) {
    if (severity === 2 || severity === 1 || severity === 0) {
        return severity
    }
    return 0
}
