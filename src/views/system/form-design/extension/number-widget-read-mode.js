/**
 * Keep configured decimal places when VForm renders number fields in read mode.
 * The field value remains numeric; only the displayed text is padded.
 */
export function formatNumberReadMode(content, precision) {
	const decimalPlaces = Number(precision)
	if (!Number.isInteger(decimalPlaces) || decimalPlaces <= 0) {
		return String(content)
	}

	const [integerPart, decimalPart = ''] = String(content).split('.')
	return `${integerPart}.${decimalPart.padEnd(decimalPlaces, '0').slice(0, decimalPlaces)}`
}

export function patchNumberWidgetReadMode(fieldComponents) {
	const numberWidget = fieldComponents?.['number-widget']
	const originalContentForReadMode = numberWidget?.computed?.contentForReadMode

	if (typeof originalContentForReadMode !== 'function') {
		console.warn('[VForm] Internal number-widget was not found; read-mode decimal formatting was not patched.')
		return
	}

	numberWidget.computed.contentForReadMode = function contentForReadMode() {
		const content = originalContentForReadMode.call(this)
		if (content === '--') {
			return content
		}

		return formatNumberReadMode(content, this.field?.options?.precision)
	}
}
