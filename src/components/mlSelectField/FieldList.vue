<template>
	<!--  -->
	<el-row>
		<el-col :span="layoutRow" v-for="(field, inx) of fieldList" :key="inx">
			<div class="ml-field-item">
				<div class="ml-field-check-box fl">
					<el-checkbox
						v-model="field.isSelected"
						:disabled="field[disabledKey]"
					/>
				</div>
				<div class="ml-field-label fr" @click="fieldSelect(field)">
					{{ field.label }}
				</div>
			</div>
		</el-col>
	</el-row>
</template>

<script setup>
const props = defineProps({
	fieldList: {
		type: Array,
		default: () => [],
	},
	layoutRow: {
		type: Number,
		default: 8,
	},
	disabledKey: {
		type: String,
		default: "",
	},
});

const emits = defineEmits(["onSelect"]);

const fieldSelect = (field) => {
	emits("onSelect", field);
};
</script>
<style lang="scss" scoped>
.ml-field-item {
	cursor: pointer;
	.ml-field-label {
		display: inline-block;
		width: calc(100% - 20px);
		margin-top: -3px;
		padding-right: 5px;
	}
}
</style>
