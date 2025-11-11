<template>
	<el-input
		:model-value="displayValue"
		readonly
		:class="{ 'is-error': !!errorField }"
		@focus="clearError()"
	>
		<template #suffix>
			<el-icon
				title="清除"
				v-if="displayValue"
				class="el-input__icon"
				@click="emit('update:modelValue', null)"
			>
				<Close />
			</el-icon>
		</template>
		<template #append>
			<el-button @click="openReferenceDialog">
				<el-icon>
					<ElIconSearch />
				</el-icon>
			</el-button>
		</template>
	</el-input>
	<ml-dialog
		title="请选择"
		class="reference-dialog"
		v-model="showReferenceDialogFlag"
		append-to-body
		width="800"
		v-if="entity"
	>
		<ReferenceSearchTable
            ref="referST"
			v-if="showReferenceDialogFlag"
			:entity="entity"
			:refField="refField"
			:enableSavePlanQuery="enableSavePlanQuery"
			:enableAdd="enableAdd"
			:defaultSelected="defaultSelected"
            :showCheckBox="showCheckBox"
            @recordSelected="handleRecordSelected"
            @multipleRecordSelected="handleMultipleRecordSelected"
            hasFooterButton
            :extraFilter="extraFilter"
		/>
        <template #footer>
            <el-button @click="showReferenceDialogFlag = false">取消</el-button>
            <el-button type="primary" @click="confirmReferenceDialog">确认</el-button>
        </template>
	</ml-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { Search as ElIconSearch, Close } from "@element-plus/icons-vue";
import ReferenceSearchTable from "./reference-search-table.vue";

let showReferenceDialogFlag = ref(false);
let extraFilter = ref(null);

const props = defineProps({
	modelValue: {
		type: [Object, String],
		default: null,
	},
	entity: {
		type: String,
		required: true,
		default: "",
	},
	refField: {
		type: String,
		required: true,
		default: "",
	},
	enableSavePlanQuery: {
		type: Boolean,
		default: true,
	},
	enableAdd: {
		type: Boolean,
		default: true,
	},
	onAppendButtonClick: {
		type: Function,
		default: null,
	},
	// 验证字段名称
	errorField: {
		type: Boolean,
		default: false,
	},
    showCheckBox: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(["update:modelValue", "update:errorField"]);

// 显示值：支持多种字段名（name、label 或根据 refField 获取）
const displayValue = computed(() => {
	if (!props.modelValue) return "";
    if(props.showCheckBox) {
        return props.modelValue.map(el => el.name).join(',');
    }
	return props.modelValue?.name || props.modelValue?.label;
});

// 将 modelValue 转换为 defaultSelected 格式
const defaultSelected = computed(() => {
    return props.modelValue
});

const openReferenceDialog = () => {
	if (typeof props.onAppendButtonClick === "function") {
		const result = props.onAppendButtonClick();
		if (result === false) {
			return;
		}
	}
	// 否则继续打开对话框
	showReferenceDialogFlag.value = true;
};

const clearError = () => {
	emit("update:errorField", false);
};

const referST = ref(null);
const confirmReferenceDialog = () => {
    if(props.showCheckBox) {
        referST.value.multipleSelectRecord();
    }else {
        referST.value.recordSelected();
       
    }
};

// 处理选中记录
const handleRecordSelected = (record, selectedRow) => {
	emit("update:modelValue", record);
	showReferenceDialogFlag.value = false;
	emit("update:errorField", false);
};
// 处理多选记录
const handleMultipleRecordSelected = (recordObj, rows) => {
    let recordData = rows.map(el => {
        return {
            id: el[recordObj.id],
            name: el[recordObj.label],
        }
    })
    emit("update:modelValue", recordData);
    showReferenceDialogFlag.value = false;
    emit("update:errorField", false);
};

const setExtraFilter = (filter) => {
    extraFilter.value = filter;
};

defineExpose({
    setExtraFilter,
});

</script>

<style scoped>
/* Styles here */
</style>
