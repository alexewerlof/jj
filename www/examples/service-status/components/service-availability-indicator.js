import { fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'
import { formatDateShort, formatPeriodLabel, formatSliValue, getSlotClass } from '../model.js'

const templatePromise = fetchTemplate(import.meta.resolve('./service-availability-indicator.html'))

export class ServiceAvailabilityIndicator extends HTMLElement {
    static defined = defineComponent('service-availability-indicator', ServiceAvailabilityIndicator)

    #jjHost
    #isMounted = false
    #service = null
    #days = 90
    #jjServiceName
    #jjServiceState
    #jjSummary
    #jjSlots
    #jjAxisStart
    #jjAxisValue
    #jjAxisEnd

    async connectedCallback() {
        this.#jjHost = JJHE.from(this)
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
        if (this.#isMounted || !this.#jjHost) {
            return
        }

        this.#jjHost.setClass('status-row').setTemplate(await templatePromise)
        this.#jjServiceName = this.#jjHost.find('.service-name', true)
        this.#jjServiceState = this.#jjHost.find('.service-state', true)
        this.#jjSummary = this.#jjHost.find('.status-row__summary', true)
        this.#jjSlots = this.#jjHost.find('.status-row__slots', true)
        this.#jjAxisStart = this.#jjHost.find('.status-row__axis-start', true)
        this.#jjAxisValue = this.#jjHost.find('.status-row__axis-value', true)
        this.#jjAxisEnd = this.#jjHost.find('.status-row__axis-end', true)
        this.#isMounted = true
    }

    #updateDynamic() {
        if (!this.#isMounted || !this.#service) {
            return
        }

        this.#jjServiceName.setText(this.#service.name)
        this.#jjServiceState
            .setClass('service-state')
            .addClass(this.#service.statusClass)
            .setText(this.#service.statusLabel)
        this.#jjHost.setStyles({
            '--daily-slot-count': String(this.#days),
            '--sls-period-count': String(this.#service.slsPeriods.length),
        })
        this.#jjSummary.empty().addChildMap(this.#service.slsPeriods, (period) => this.#createSummarySlot(period))
        this.#jjAxisStart.setText(`${this.#days} days ago`)
        this.#jjAxisValue.setText(formatPeriodLabel(this.#service.periodAvg, this.#service.primarySli))
        this.#jjAxisEnd.setText('Today')
        this.#jjSlots.empty().addChildMap(this.#service.timeline, (day) => this.#createDaySlot(day))
    }

    #createDaySlot(day) {
        const slotClass = getSlotClass(day.hasData, day.primaryValue, this.#service.primarySli.slo)
        const jjSlot = JJHE.create('div').addClass('status-slot', `status-slot--${slotClass}`)

        const jjTooltip = JJHE.create('div').addClass('status-slot__tooltip')
        jjTooltip
            .addChild(JJHE.create('div').addClass('tooltip-date').setText(formatDateShort(day.date)))
            .addChild(createTooltipBody(day))

        jjSlot.addChild(jjTooltip)
        return jjSlot
    }

    #createSummarySlot(period) {
        const slotClass = getSlotClass(period.hasData, period.primaryValue, this.#service.primarySli.slo)
        const jjSlot = JJHE.create('div').addClass('status-slot', 'status-slot--summary', `status-slot--${slotClass}`)

        jjSlot.setAttr(
            'aria-label',
            `${formatPeriodRange(period.startDate, period.endDate)}: ${formatSummaryValue(period, this.#service.primarySli)}`,
        )

        if (period.primaryValue !== null) {
            jjSlot.addChild(
                JJHE.create('span')
                    .addClass('status-slot__label')
                    .setText(formatInlineValue(period, this.#service.primarySli)),
            )
        } else {
            jjSlot.addChild(JJHE.create('span').addClass('status-slot__label').setText('No data'))
        }

        const jjTooltip = JJHE.create('div').addClass('status-slot__tooltip')
        jjTooltip
            .addChild(
                JJHE.create('div')
                    .addClass('tooltip-date')
                    .setText(formatPeriodRange(period.startDate, period.endDate)),
            )
            .addChild(createSummaryTooltipBody(period, this.#service.primarySli))

        jjSlot.addChild(jjTooltip)
        return jjSlot
    }
}

function createTooltipBody(day) {
    const jjContainer = JJHE.create('div').addClass('tooltip-copy')

    if (!day.hasData) {
        return jjContainer.addChild(JJHE.create('p').setText('No downtime recorded on this day.'))
    }

    day.sliValues.forEach((sli) => {
        if (sli.value !== null) {
            jjContainer.addChild(JJHE.create('p').setText(`${sli.metric}: ${formatSliValue(sli)}`))
        }
    })

    day.events.forEach((event) => {
        jjContainer.addChild(createTooltipEventLine(event.description, event.severity))
    })

    return jjContainer
}

function createSummaryTooltipBody(period, primarySli) {
    const jjContainer = JJHE.create('div').addClass('tooltip-copy')

    if (!period.hasData) {
        return jjContainer.addChild(JJHE.create('p').setText('No service-level data recorded in this window.'))
    }

    jjContainer.addChild(
        JJHE.create('p').setText(`${primarySli.metric} SLS: ${formatSummaryValue(period, primarySli)}`),
    )

    period.sliValues.forEach((sli) => {
        if (sli.metric !== primarySli.metric && sli.value !== null) {
            jjContainer.addChild(JJHE.create('p').setText(`${sli.metric} avg: ${formatSliValue(sli)}`))
        }
    })

    jjContainer.addChild(
        JJHE.create('p').setText(
            `${period.observedDays}/${period.totalDays} days reported · ${period.breachDays} breach days · ${period.incidents.length} incidents`,
        ),
    )

    period.incidents.slice(0, 2).forEach((incident) => {
        jjContainer.addChild(
            createTooltipEventLine(`${formatDateShort(incident.date)}: ${incident.description}`, incident.severity),
        )
    })

    if (period.incidents.length > 2) {
        jjContainer.addChild(
            JJHE.create('p')
                .addClass('tooltip-event')
                .setText(`+ ${period.incidents.length - 2} more incidents`),
        )
    }

    return jjContainer
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
