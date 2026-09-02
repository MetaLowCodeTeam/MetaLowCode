<template>
	<div v-show="!widget.options.hidden" class="table-container loop-container-table">
		<table :ref="widget.id" class="table-layout" :class="customClass">
			<tbody>
				<template v-for="(loopRow, loopIndex) in loopRows" :key="loopRow.__rowKey">
					<tr
						v-for="(tableRow, tableRowIndex) in widget.rows"
						:key="`${loopRow.__rowKey}-${tableRow.id || tableRowIndex}`"
					>
						<template v-for="(cell, cellIndex) in tableRow.cols" :key="cell.id || cellIndex">
							<table-cell-item
								v-if="!cell.merged"
								:widget="cell"
								:parent-list="tableRow.cols"
								:row-index="tableRowIndex"
								:col-index="cellIndex"
								:parent-widget="widget"
								:sub-form-row-id="loopRow.__rowKey"
								:sub-form-row-index="loopIndex"
								:sub-form-col-index="subFormColIndex"
								:loop-row-data="loopRow"
							>
								<template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
									<slot :name="slotName" v-bind="slotProps || {}" />
								</template>
							</table-cell-item>
						</template>
					</tr>
				</template>
			</tbody>
		</table>
	</div>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { emitter, i18n, containerItemMixin, refMixin } = VisualDesign.VFormSDK

export default {
	name: 'loop-merged-table-item',
	componentName: 'ContainerItem',
	mixins: [emitter, i18n, refMixin, containerItemMixin],
	props: {
		widget: Object,
		loopRows: { type: Array, default: () => [] },
		subFormColIndex: { type: Number, default: -1 },
	},
	inject: ['refList', 'sfRefList', 'globalModel'],
	computed: {
		customClass() {
			return this.widget.options.customClass || ''
		},
	},
	created() {
		this.initRefList()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
	},
}
</script>

<style scoped lang="scss">
.loop-container-table,
.loop-container-table > table {
	width: 100%;
}

.loop-container-table > table {
	table-layout: fixed;
	border-collapse: collapse;
}
</style>
