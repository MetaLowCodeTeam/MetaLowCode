<style lang="scss" scoped>
.ml-customize-query {
	margin-bottom: 6px;
	display: flex;
	overflow: hidden;
	:deep(.is-horizontal) {
		display: none !important;
	}
	.conditions-comp {
		width: calc(100% - 180px);
	}
	.conditions-action {
		width: 180px;
		text-align: right;
	}
}
</style>
<!-- 列表自定义查询 -->
<template>
	<div
		class="ml-customize-query"
		:style="{ height: customizeQueryHeight + 'px' }"
	>
		<div class="conditions-comp">
			<mlSetConditions
				v-model="compConditions"
				:entityName="entityName"
				displayedComp
				:forbidUserModifyField="forbidUserModifyField"
				:hideQueryMatchType="hideQueryMatchType"
			/>
		</div>
		<div class="conditions-action">
			<el-dropdown trigger="click" @command="onSearch" class="pt-1">
				<el-button
					type="primary"
					icon="ArrowDown"
					style="width: 80px; margin-right: 12px"
					plain
				>
					查询
				</el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="OR">
							符合任一条件
						</el-dropdown-item>
						<el-dropdown-item command="AND">
							符合全部条件
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-button @click="refreshAdvancedQuery" style="width: 74px">
				重置
			</el-button>
		</div>
	</div>
	<!-- 设计查询面板 -->
	<ml-dialog title="设计查询面板" v-model="isShow" width="700" append-to-body>
		<div>
			<mlSetConditions
				v-model="dialogConditions"
				:entityName="entityName"
				notType
			/>
		</div>
		<template #footer>
			<div class="fl pl-20">
				<el-checkbox v-model="forbidUserModifyField"
					>禁止用户修改字段</el-checkbox
				>
				<el-checkbox v-model="hideQueryMatchType"
					>隐藏查询匹配类型</el-checkbox
				>
			</div>
			<el-button @click="isShow = false">取消</el-button>
			<el-button type="primary" @click="conditionsConfirm">
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import layoutConfig from "@/api/layoutConfig";
import { ElMessage } from "element-plus";
const props = defineProps({
	// 实体名称
	entityName: { type: String, default: "" },
	entityCode: { type: [Number, String], default: "" },
	// 模块名称
	modelName: { type: String, default: "" },
	// 查询条件
	topSearchConfig: { type: Object, default: () => {} },
});
const emit = defineEmits(["queryNow", "uploadItems"]);

let isShow = ref(false);

let compConditions = ref({
	equation: "AND",
	items: [],
});

let loading = ref(false);

let customizeQueryHeight = ref(38);

const changeCustomizeQueryHeight = (height) => {
	customizeQueryHeight.value = height;
};

const notEmptyItems = [
	"NL",
	"NT",
	"SFU",
	"SFB",
	"SFD",
	"SFT",
	"YTA",
	"TDA",
	"TTA",
	"CUW",
	"CUM",
	"CUQ",
	"CUY",
	"REFD",
	"REFU",
];

const onSearch = (command) => {
	compConditions.value.equation = command;
	let newCompConditions = {
		equation: command,
		items: [],
	};
	newCompConditions.items = compConditions.value.items.filter(
		(el) =>
			(el.value !== undefined && el.value !== null && el.value !== "") ||
			(el.value2 !== undefined && el.value2 !== null && el.value2 !== "") ||
			notEmptyItems.includes(el.op)
	);
	emit("queryNow", newCompConditions);
};

const refreshAdvancedQuery = () => {
	let newCompConditions = JSON.parse(JSON.stringify(compConditions.value));
	newCompConditions.items = [];
	compConditions.value.items.forEach((el) => {
        el.refLabel = null;
		el.value = null;
		el.value2 = null;
        el.value3 = null;
	});
	emit("queryNow", newCompConditions);
};

/**
 * 设计查询面板
 */
// 弹框条件
let dialogConditions = ref({
	equation: "AND",
	items: [],
});

// 禁止用户修改字段
let forbidUserModifyField = ref(false);
// 隐藏查询匹配类型
let hideQueryMatchType = ref(false);

// 打开弹框
const openDialog = () => {
	isShow.value = true;
	dialogConditions.value = JSON.parse(JSON.stringify(compConditions.value));
};
// 弹框条件确认
const conditionsConfirm = async () => {
	//
	let param = {
		config: JSON.stringify({
			isDefaultQueryPanel: false,
			forbidUserModifyField: forbidUserModifyField.value,
			hideQueryMatchType: hideQueryMatchType.value,
			filter: dialogConditions.value,
		}),
		entityCode: props.entityCode,
	};
	loading.value = true;
	let res = await layoutConfig.saveConfig(
		props.topSearchConfig.layoutConfigId,
		"TOP_SEARCH",
		param,
		props.modelName
	);
	if (res) {
		emit("uploadItems", {
			forbidUserModifyField: forbidUserModifyField.value,
			hideQueryMatchType: hideQueryMatchType.value,
			filter: dialogConditions.value,
		});
		isShow.value = false;
		ElMessage.success("设置成功");
	}
	loading.value = false;
};

watchEffect(() => {
	compConditions.value = props.topSearchConfig.filter;
	forbidUserModifyField.value = props.topSearchConfig.forbidUserModifyField;
	hideQueryMatchType.value = props.topSearchConfig.hideQueryMatchType;
});

defineExpose({
	openDialog,
	changeCustomizeQueryHeight,
});
</script>
