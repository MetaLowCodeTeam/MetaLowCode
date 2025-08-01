<template>
	<!-- 文本 -->
	<el-input
		v-if="nodeData.showComponent == 'textInput'"
		v-model="nodeData.value"
		placeholder="请输入值"
		class="value-input"
		@input="onNodeChange"
		clearable
	/>
	<!-- 布尔 -->
	<el-select
		v-if="nodeData.showComponent == 'booleanSelect'"
		v-model="nodeData.value"
		class="value-input"
		@change="onNodeChange"
		clearable
	>
		<el-option label="是" value="1" />
		<el-option label="否" value="0" />
	</el-select>
	<!-- 单选 -->
	<el-select
		v-if="nodeData.showComponent == 'optionData'"
		v-model="nodeData.value"
		class="value-input"
		@change="onNodeChange"
		clearable
	>
		<el-option
			v-for="item in nodeData.dbField.optionData"
			:key="item.value"
			:label="item.label"
			:value="item.value"
		/>
	</el-select>
	<!-- 引用组件 -->
	<el-input
		v-model="nodeData.refLabel"
		readonly
		class="value-input"
		v-if="nodeData.showComponent == 'referenceSearch'"
	>
		<template #append>
			<el-button @click="openReferenceDialog(nodeData)">
				<el-icon>
					<ElIconSearch />
				</el-icon>
			</el-button>
		</template>
	</el-input>
	<!-- 数字 -->
	<el-input-number
		v-if="nodeData.showComponent == 'numberInput'"
		v-model="nodeData.value"
		class="value-input"
		@change="onNodeChange"
		:precision="PrecisionType.includes(nodeData.dbField.type) ? 2 : 0"
		clearable
	/>
	<!-- 日期 -->
	<el-date-picker
		v-if="nodeData.showComponent == 'datePicker'"
		v-model="nodeData.value"
		class="value-input"
		@change="onNodeChange"
		clearable
		:type="nodeData.dbField.type == 'Date' ? 'date' : 'datetime'"
		:format="nodeData.dbField.type == 'Date' ? 'YYYY/MM/DD' : 'YYYY/MM/DD HH:mm:ss'"
		:value-format="nodeData.dbField.type == 'Date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
	/>
    <!-- 级联 -->
    <el-cascader
        v-if="nodeData.showComponent == 'cascader'"
        v-model="nodeData.value"
        :options="nodeData.dbField.optionData"
    />
	<el-dialog
		title="请选择"
		class="reference-dialog"
		v-model="referenceDialogConfig.isShow"
		append-to-body
		width="800"
		v-if="referenceDialogConfig.formatEntityName"
	>
		<ReferenceSearchTable
			v-if="referenceDialogConfig.isShow"
			:entity="referenceDialogConfig.formatEntityName"
			:refField="referenceDialogConfig.refField"
			@recordSelected="(event) => setReferRecord(event, nodeData)"
		/>
	</el-dialog>
</template>

<script setup>
import { ref } from "vue";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";

const props = defineProps({
	nodeData: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["change"]);

// 显示精度小数
const PrecisionType = ["Decimal", "Money", "Percent"];

let referenceDialogConfig = ref({
	isShow: false,
	formatEntityName: null,
	refField: null,
});

// 打开引用弹窗
const openReferenceDialog = (node) => {
	console.log("node", node);
	referenceDialogConfig.value = {
		isShow: true,
		formatEntityName: node.dbField.entity,
		refField: node.dbField.name,
	};
};

const setReferRecord = (event, node) => {
	node.value = {
		id: event.id,
		name: event.label,
	};
	node.refLabel = event.label;
	referenceDialogConfig.value.isShow = false;
};

const onNodeChange = () => {
	emit("change");
};
</script>

<style scoped lang="scss">
/* Styles here */
.value-input {
	width: 200px;
}
</style>
