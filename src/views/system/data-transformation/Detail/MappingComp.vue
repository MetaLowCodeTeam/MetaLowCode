<template>
	<!--  -->
	<div class="mapping-comp" :class="{'is-error': myError}">
		<el-row
			:gutter="10"
			v-for="(item, inx) of myUseFields"
			:key="inx"
			:class="[inx != myUseFields.length - 1 ? 'mb-10' : '']"
		>
			<FormatRowComp
				:sourceEntity="sourceEntity"
				:targetEntity="targetEntity"
				v-model="myUseFields[inx]"
				:type="2"
			/>
			<!-- 编辑 -->
			<el-col :span="1">
				<div class="del-icon-div" @click="actionOperate('edit', inx)">
					<el-icon><Edit /></el-icon>
				</div>
			</el-col>
			<!-- 删除 -->
			<el-col :span="1">
				<div class="del-icon-div" @click="actionOperate('del', inx)">
					<el-icon><Delete /></el-icon>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="10" class="mb-5" v-if="myUseFields.length > 0">
			<el-col :span="9">
				<span class="info-text">目标字段</span>
			</el-col>
			<el-col :span="4">
				<span class="info-text">更新方式</span>
			</el-col>
			<el-col :span="9">
				<span class="info-text">源字段/固定值/计算公式</span>
			</el-col>
		</el-row>
		<div class="w-100">
			<el-button type="primary" plain @click="actionOperate('add')">
				添加
			</el-button>
		</div>
	</div>
	<ml-dialog :title="title" width="600px" v-model="dialogConf.show" appendToBody>
		<el-row :gutter="10" class="text-center">
			<el-col :span="9">{{ targetEntity.label }}</el-col>
			<el-col :span="9" :offset="6">
				{{ sourceEntity.label }}
			</el-col>
		</el-row>
		<el-row :gutter="10">
			<FormatRowComp
				ref="EditFormatRowCompRef"
				:sourceEntity="sourceEntity"
				:targetEntity="targetEntity"
				v-model="dialogConf.data"
                :useFields="myUseFields"
			/>
		</el-row>
		<el-row :gutter="10">
			<el-col :span="9">
				<span class="info-text">目标字段</span>
			</el-col>
			<el-col :span="6">
				<span class="info-text">更新方式</span>
			</el-col>
			<el-col :span="9">
				<span class="info-text">源字段/固定值/计算公式</span>
			</el-col>
		</el-row>
		<template #footer>
			<el-button @click="dialogConf.show = false">取消</el-button>
			<el-button type="primary" @click="confirmEdit">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref, reactive, watchEffect, shallowRef, nextTick } from "vue";

import FormatRowComp from "./FormatRowComp.vue";
const props = defineProps({
	modelValue: null,
	// 目标实体
	targetEntity: {
		type: Object,
		default: () => {},
	},
	// 目标实体
	sourceEntity: {
		type: Object,
		default: () => {},
	},
	// 标题
	title: {
		type: String,
		default: "",
	},
    // 错误提示
    isError: {
        type: Boolean,
        default: false,
    }
});

const emits = defineEmits(["clearError"])

// 使用的字段
let myUseFields = ref([]);

// 更新内容
const updateItem = reactive({
	// 目标字段
	targetField: "",
	// 更新方式
	updateMode: "forField",
	// 源字段
	sourceField: "",
	// 如果更新方式是 计算公式  判断是否是高级公式
	simpleFormula: false,
	fieldType: "",
	referenceName: "",
});

// 错误提示边框变红
let myError = ref(false);

watchEffect(() => {
	myUseFields.value = props.modelValue;
    myError.value = props.isError;
});

// 执行操作
const actionOperate = (target, inx) => {
    emits('clearError')
	if (target == "add") {
		openEditDialog(updateItem, target);
	} else if (target == "del") {
		myUseFields.value.splice(inx, 1);
	} else {
		openEditDialog(myUseFields.value[inx], inx);
	}
};



/**
 * 新建、编辑 弹框
 */

let EditFormatRowCompRef = ref();

let dialogConf = ref({
	show: false,
	data: {},
    sourceData: {},
	target: "",
});
// 打开编辑弹框
const openEditDialog = (data, target) => {
	dialogConf.value.data = cloneDeep(data);
	dialogConf.value.sourceData = cloneDeep(data);
	dialogConf.value.target = target;
	dialogConf.value.show = true;
	nextTick(() => {
		EditFormatRowCompRef.value?.targetFieldChange(
			dialogConf.value.data,
			"edit"
		);
	});
};
// 确认编辑
const confirmEdit = () => {
	let { data, target, sourceData } = dialogConf.value;
	let { sourceField, targetField, updateMode } = data;
	if (!targetField) {
		ElMessage.error("请先选择目标字段。");
        return;
	}
	if (updateMode != 'toNull' && (!sourceField || JSON.stringify(sourceField) == '[]' || JSON.stringify(sourceField) == '{}')) {
		ElMessage.error("请先选择源字段/固定值/计算公式。");
        return;
	}
    // 查询字段是否存在
	let findTargetField = myUseFields.value.filter(
		(el) => el.targetField == data.targetField
	);
    // 如果字段已存在，并且是新增就提示存在
    // 如果字段已存在，并且是修改并且字段名有修改就提示存在
	if (findTargetField.length > 0 && (target == 'add' || (target != 'add' && data.targetField != sourceData.targetField))) {
		ElMessage.error("目标字段：" + data.targetField + " 已存在");
		return;
	}
	if (target == "add") {
		myUseFields.value.push(cloneDeep(data));
	} else {
		myUseFields.value[target] = cloneDeep(data);
	}

	dialogConf.value.show = false;
};

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
}

</script>
<style lang="scss" scoped>
.mapping-comp {
	width: 680px;
	background: #f7f7f7;
	border-radius: 4px;
	padding: 10px;
	box-sizing: border-box;
    border: 1px solid #f7f7f7;
    &.is-error {
        border-color: red;
    }
	.del-icon-div {
		// display: inline-block;
		height: 30px;
		box-sizing: border-box;
		padding-top: 4px;
		font-size: 18px;
		cursor: pointer;
		&:hover {
			color: var(--el-color-primary);
		}
	}
}
.text-center {
	text-align: center;
}
</style>
