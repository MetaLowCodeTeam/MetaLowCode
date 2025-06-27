<template>
	<ml-dialog
		v-model="isShow"
		width="500"
		title="列表页签设置"
		appendToBody
		:showClose="!loading"
	>
		<div v-loading="loading">
			<div class="mb-10">
				<el-checkbox v-model="isEnableTab">是否启用页签</el-checkbox>
			</div>
			<el-row class="header-box mb-10" :gutter="10">
				<el-col :span="19">
					<el-input
						v-model="search"
						placeholder="请输入页签名称"
						clearable
					/>
				</el-col>
				<el-col :span="5">
					<el-button
						type="primary"
						@click="handleAction('add')"
						style="width: 100%"
					>
						新增页签
					</el-button>
				</el-col>
			</el-row>
			<el-table
				:data="tableData.filter((item) => item.name.includes(search))"
				:border="true"
				:max-height="300"
			>
				<el-table-column
					prop="name"
					label="页签名称"
					:align="'center'"
				/>
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
		</div>

		<template #footer>
			<el-button @click="isShow = false" :loading="loading">
				取消
			</el-button>
			<el-button type="primary" @click="handleSave" :loading="loading">
				保存
			</el-button>
		</template>
	</ml-dialog>
	<!-- 新增/编辑页签 -->
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
			<el-form-item label="过滤条件" v-if="tabDialog.row.key !== ''">
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
			<el-button type="primary" @click="handleConfirm"> 确认 </el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { deepClone } from "@/utils/util";
import SetConditionsDialog from "@/components/mlSetConditions/Dialog.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import layoutConfigApi from "@/api/layoutConfig";

const props = defineProps({
	modelName: {
		type: String,
		default: "",
	},
	entityName: {
		type: String,
		default: "",
	},
	entityCode: {
		type: [String, Number],
		default: "",
	},
    // 当前页签
    tabKey: {
        type: String,
        default: "",
    }
});

const emits = defineEmits(["confirm"]);


const isShow = ref(false);

const tableData = ref([]);

let search = ref("");

// 操作按钮
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
// 默认页签，无法删除
const defaultTab = ref({
	name: "默认页签",
	key: "default",
	filter: null,
});
// 自增key
let selfKey = ref(1);
// 是否启用页签
const isEnableTab = ref(false);

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
				key: null,
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
		ElMessageBox.confirm("确定删除该页签吗？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning",
		})
			.then(() => {
				tableData.value = tableData.value.filter(
					(item) => item.key !== row.key
				);
			})
			.catch(() => {});
	} else if (key === "up") {
		const index = tableData.value.findIndex((item) => item.key === row.key);
		const temp = tableData.value[index];
		tableData.value[index] = tableData.value[index - 1];
		tableData.value[index - 1] = temp;
	} else if (key === "down") {
		const index = tableData.value.findIndex((item) => item.key === row.key);
		const temp = tableData.value[index];
		tableData.value[index] = tableData.value[index + 1];
		tableData.value[index + 1] = temp;
	}
};

const handleConfirm = () => {
	let { name, filter, key } = tabDialog.value.row;
	if (!name) {
		ElMessage.error("请输入页签名称");
		return;
	}
	if (
		tableData.value.some((item) => item.name === name && item.key !== key)
	) {
		ElMessage.error("页签名称不能重复");
		return;
	}
	// 新建
	if (!key) {
		tableData.value.push({
			key: selfKey.value + "",
			name,
			filter,
		});
		selfKey.value++;
	}
	// 编辑
	else {
		tableData.value = tableData.value.map((item) => {
			if (item.key === key) {
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

let loading = ref(false);
// 布局配置id
let layoutConfigId = ref(null);

// 打开弹窗
const openDialog = (tabFilterConfig) => {
	layoutConfigId.value = tabFilterConfig?.layoutConfigId || null;
	if (tabFilterConfig && tabFilterConfig.config) {
		let config = JSON.parse(tabFilterConfig.config);
		selfKey.value = config.selfKey;
		tableData.value = config.tabFilterList;
		isEnableTab.value = config.isEnableTab;
	}
    // 如果是空数组的时候，默认添加一个默认页签。该默认页签是可以删除的。
	if (tableData.value.length == 0) {
		tableData.value.unshift(deepClone(defaultTab.value));
	}
	isShow.value = true;
};

// 保存
const handleSave = async () => {
    let paramModelName = props.modelName;
    if(props.modelName && props.tabKey){
        // 如果modelName存在且页签存在，去掉_curtab后缀
        paramModelName = props.modelName.replace(new RegExp(`_${props.tabKey}$`), '');
    }
	let param = {
		config: JSON.stringify({
			selfKey: selfKey.value,
			isEnableTab: isEnableTab.value,
			tabFilterList: tableData.value,
		}),
		entityCode: props.entityCode,
	};
	loading.value = true;
	let res = await layoutConfigApi.saveConfig(
		layoutConfigId.value,
		"TAB_FILTER",
		param,
		paramModelName
	);
	if (res) {
		ElMessage.success("保存成功");
		emits("confirm");
		isShow.value = false;
	}
	loading.value = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.add-btn {
	float: right;
	margin-top: 0px;
}
</style>
