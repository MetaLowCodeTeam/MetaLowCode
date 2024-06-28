<template>
	<!--  -->
	<el-form-item
		:label="i18nt('extension.setting.paginationSize')"
		label-width="120px"
	>
		<el-select
			v-model="optionModel.paginationSize"
			:placeholder="i18nt('extension.setting.paginationPlaceholder')"
		>
			<el-option
				v-for="item in options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n } = VisualDesign.VFormSDK;
export default {
	name: "listSubForm-paginationSize-editor",
	props: {
		optionModel: Object,
	},
	mixins: [i18n],
	data() {
		return {
			pageSizes: [20, 40, 80, 100, 200, 300, 400, 500],
			options: [],
		};
	},
	mounted() {
		this.options = this.pageSizes.map((el) => {
			return {
				label:
					el +
					this.i18nt("extension.setting.paginationLabel") +
					"/" +
					this.i18nt("extension.setting.paginationPage"),
				value: el,
			};
		});
	},
};
</script>
