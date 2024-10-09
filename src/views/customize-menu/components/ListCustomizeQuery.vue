<style lang="scss" scoped>
.ml-customize-query {
	height: 44px;
	display: flex;
	:deep(.is-horizontal) {
		display: none !important;
	}
	.conditions-comp {
		width: calc(100% - 160px);
	}
	.conditions-action {
		width: 160px;
		text-align: right;
	}
}
</style>
<!-- 列表自定义查询 -->
<template>
	<div class="ml-customize-query">
		<div class="conditions-comp">
			<el-scrollbar>
				<mlSetConditions
					v-model="compConditions"
					:entityName="entityName"
					displayedComp
				/>
			</el-scrollbar>
		</div>
		<div class="conditions-action">
			<el-dropdown trigger="click" @command="onSearch" class="mr-10 pt-1">
				<el-button type="primary">
					查询
					<el-icon class="el-icon--right">
						<arrow-down />
					</el-icon>
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
            
			<el-button type="primary" plain @click="refreshAdvancedQuery">重置</el-button>
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
const emit = defineEmits(['queryNow'])

let isShow = ref(false);

let compConditions = ref({
	equation: "AND",
	items: [],
});

let loading = ref(false);
let layoutConfigId = ref("");

const onSearch = (command) => {
	compConditions.value.equation = command;
    emit('queryNow', compConditions.value)
};

const refreshAdvancedQuery = () => {
    compConditions.value.items.forEach(el => {
        el.value = "";
        el.value2 = "";
    })
    emit('queryNow', compConditions.value)
}

/**
 * 设计查询面板
 */
// 弹框条件
let dialogConditions = ref({
	equation: "AND",
	items: [],
});
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
        compConditions.value = JSON.parse(JSON.stringify(dialogConditions.value));
        isShow.value = false;
		ElMessage.success("设置成功");
	}
	loading.value = false;
};


watchEffect(() => {
    compConditions.value = props.topSearchConfig.filter;
})


defineExpose({
	openDialog,
});
</script>
