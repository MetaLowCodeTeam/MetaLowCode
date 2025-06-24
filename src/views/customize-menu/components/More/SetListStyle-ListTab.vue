<template>
	<div class="info-text mb-5 mt-10">
		列表页签设置
		<el-button
			class="add-btn"
			type="primary"
			size="small"
			@click="handleAction('add')"
		>
			新增页签
		</el-button>
	</div>
	<el-table :data="tableData" :border="true" :max-height="300">
		<el-table-column prop="name" label="页签名称" :align="'center'" />
		<el-table-column label="操作" :align="'center'" width="190">
			<template #default="scope">
				<el-button
					v-for="btn in actionBtns"
					:key="btn.key"
					link
					:type="btn.type"
					:size="btn.size"
					@click="handleAction(btn.key, scope.row)"
					:disabled="
						(btn.key == 'up' && scope.$index == 0) ||
						(btn.key == 'down' &&
							scope.$index == tableData.length - 1)
					"
				>
					{{ btn.label }}
				</el-button>
			</template>
		</el-table-column>
	</el-table>
	<ml-dialog
		v-model="tabDialog.show"
		:title="tabDialog.title"
		append-to-body
		width="400px"
	>
		<el-form>
			<el-form-item label="页签名称" class="is-required">
				<el-input v-model="tabDialog.row.name" />
			</el-form-item>
			<el-form-item label="过滤条件">
				<SetConditionsDialog
					title="附加过滤条件"
					:conditionConf="tabDialog.row.filter"
					:entityName="entityName"
					@confirm="conditionConfirm"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="tabDialog.show = false">取消</el-button>
			<el-button type="primary" @click="handleConfirm">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { deepClone, getGuid } from "@/utils/util";
import SetConditionsDialog from "@/components/mlSetConditions/Dialog.vue";
import { ElMessage } from "element-plus";
const props = defineProps({
	entityName: {
		type: String,
		default: "",
	},
	listTabs: {
		type: Array,
		default: () => [],
	},
});
const actionBtns = [
	{
		label: "编辑",
		type: "primary",
		size: "small",
		key: "edit",
	},
	{
		label: "删除",
		type: "primary",
		size: "small",
		key: "delete",
	},
	{
		label: "上移",
		type: "primary",
		size: "small",
		key: "up",
	},
	{
		label: "下移",
		type: "primary",
		size: "small",
		key: "down",
	},
];

let tableData = ref([]);

onMounted(() => {
    tableData.value = props.listTabs;
})

const tabDialog = ref({
	show: false,
	title: "新增页签",
	row: null,
});

const handleAction = (key, row) => {
	if (key === "add") {
		tabDialog.value = {
			show: true,
			title: "新增页签",
			row: {
				name: "",
				guid: null,
				filter: {},
			},
		};
	} else if (key === "edit") {
		tabDialog.value = {
			show: true,
			title: "编辑页签",
			row: deepClone(row),
		};
	} else if (key === "delete") {
		tableData.value = tableData.value.filter(
			(item) => item.guid !== row.guid
		);
	} else if (key === "up") {
		const index = tableData.value.findIndex(
			(item) => item.guid === row.guid
		);
		const temp = tableData.value[index];
		tableData.value[index] = tableData.value[index - 1];
		tableData.value[index - 1] = temp;
	} else if (key === "down") {
		const index = tableData.value.findIndex(
			(item) => item.guid === row.guid
		);
		const temp = tableData.value[index];
		tableData.value[index] = tableData.value[index + 1];
		tableData.value[index + 1] = temp;
	}
};

const handleConfirm = () => {
	let { name, filter, guid } = tabDialog.value.row;
	if (!name) {
		ElMessage.error("请输入页签名称");
		return;
	}
	// 新建
	if (!guid) {
		tableData.value.push({
			name,
			guid: getGuid(),
			filter,
		});
	}
	// 编辑
	else {
		tableData.value = tableData.value.map((item) => {
			if (item.guid === guid) {
				return { ...item, name, filter };
			}
			return item;
		});
	}

	tabDialog.value.show = false;
};

// 确认条件
const conditionConfirm = (data) => {
	tabDialog.value.row.filter = data;
};

const getTableData = () => {
	return tableData.value;
};

defineExpose({
	getTableData,
});
</script>

<style scoped lang="scss">
.add-btn {
	float: right;
	margin-top: -4px;
}
</style>
