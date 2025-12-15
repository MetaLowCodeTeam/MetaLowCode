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
    .split-query-btn {
        margin-right: 12px;
        :deep(.el-button) {
            padding: 0 10px;
        }
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
                :labelPosition="labelPosition"
                @onSaveAlias="onSaveAlias"
			/>
		</div>
		<div class="conditions-action">
            <el-dropdown 
                split-button 
                type="primary" 
                @click="onSearch('OR')"
                size="default"
                class="split-query-btn"
                @command="onSearch"
            >
                查询
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
    <SetQueryPanelDialog 
        ref="setQueryPanelDialogRef"
        :entityName="entityName"
        @conditionsConfirm="conditionsConfirm"
    />
</template>

<script setup>
import { ref, watchEffect } from "vue";
import layoutConfig from "@/api/layoutConfig";
import { ElMessage } from "element-plus";
import useCommonStore from "@/store/modules/common";
import SetQueryPanelDialog from "@/components/mlSetConditions/SetQueryPanelDialog.vue";
const { queryEntityInfoByName } = useCommonStore();

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
    let tempItems = JSON.parse(JSON.stringify(compConditions.value.items));
    tempItems.forEach(el => {
        if(el.value && typeof el.value == 'string' && el.type !== "DateTime" && el.type !== "Date") {
            el.value = el.value.replace(/\s/g, '');
        }
        // 如果是多引用类型 且不是 为空不为空
        if(el.type == 'ReferenceList' && el.op != 'NL' && el.op != 'NT'){
            let idFieldName = queryEntityInfoByName(props.entityName).idFieldName;
            // 如果是本人、本部门
            if(el.op == "REFD" || el.op == "REFU"){
                el.value = idFieldName;
            }
            // 如果是包含
            if(el.op == "REF"){
                el.value2 = el.value;
                el.value = idFieldName;
            }
        }
        if(el.type == 'Cascader') {
            el.value = JSON.stringify(el.value);
        }
    })
	newCompConditions.items = tempItems.filter(
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
// 禁止用户修改字段
let forbidUserModifyField = ref(false);
// 隐藏查询匹配类型
let hideQueryMatchType = ref(false);
// 是否保存查询值
let isSaveQueryValue = ref(true);
// 标签位置
let labelPosition = ref(3);

let setQueryPanelDialogRef = ref(null);

// 打开弹框
const openDialog = () => {
    setQueryPanelDialogRef.value.openDialog({
        filter: JSON.parse(JSON.stringify(compConditions.value)),
        forbidUserModifyField: forbidUserModifyField.value,
        hideQueryMatchType: hideQueryMatchType.value,
        isSaveQueryValue: isSaveQueryValue.value,
        labelPosition: labelPosition.value,
    });
};



const onSaveAlias = () => {
    conditionsConfirm({
        filter: JSON.parse(JSON.stringify(compConditions.value)),
        forbidUserModifyField: forbidUserModifyField.value,
        hideQueryMatchType: hideQueryMatchType.value,
        isSaveQueryValue: isSaveQueryValue.value,
        labelPosition: labelPosition.value,
    })
}

// 弹框条件确认
const conditionsConfirm = async (event) => {
    let paramFilter = JSON.parse(JSON.stringify(event.filter));
    forbidUserModifyField.value = event.forbidUserModifyField;
    hideQueryMatchType.value = event.hideQueryMatchType;
    isSaveQueryValue.value = event.isSaveQueryValue;
    labelPosition.value = event.labelPosition;
    if(!isSaveQueryValue.value){
        paramFilter.items.forEach(el => {
            el.value = null;
            el.value2 = null;
        })
    }
	let param = {
		config: JSON.stringify({
			isDefaultQueryPanel: false,
			forbidUserModifyField: forbidUserModifyField.value,
			hideQueryMatchType: hideQueryMatchType.value,
			isSaveQueryValue: isSaveQueryValue.value,
            labelPosition: labelPosition.value,
			filter: paramFilter,
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
			filter: event.filter,
			isSaveQueryValue: isSaveQueryValue.value,
            labelPosition: labelPosition.value,
		});
		isShow.value = false;
		ElMessage.success("设置成功");
	}
	loading.value = false;
};

watchEffect(() => {
    if(props.topSearchConfig.filter){
        compConditions.value = JSON.parse(JSON.stringify(props.topSearchConfig.filter));
    }
	forbidUserModifyField.value = props.topSearchConfig.forbidUserModifyField;
	hideQueryMatchType.value = props.topSearchConfig.hideQueryMatchType;
	isSaveQueryValue.value = props.topSearchConfig.isSaveQueryValue;
    labelPosition.value = props.topSearchConfig.labelPosition;
});

defineExpose({
	openDialog,
	changeCustomizeQueryHeight,
});
</script>
