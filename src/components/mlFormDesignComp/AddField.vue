<template>
	<el-dropdown @command="handleNewFieldCommand" size="small">
		<slot v-if="isShowDefaultSlot"></slot>
		<el-button type="primary" v-else>
			新建字段<el-icon><ArrowDown /></el-icon>
		</el-button>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="(item, inx) in fieldList"
					:command="item.value"
					:key="inx"
					:divided="item.divided"
				>
					{{ item.label }}
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
	<ml-dialog
        v-if="showNewFieldDialogFlag"
		v-model="showNewFieldDialogFlag"
		:title="(fieldState == 1 ? '新建字段 / ' : '编辑字段 / ') + currentEditorType"
		width="620px"
		draggable
        append-to-body
	>
		<component
			:is="currentFieldComponent"
			:entity="entity"
			@fieldSaved="onFieldSaved"
			:showingInDialog="true"
			:entityProps="entityProps"
			:field-name="fieldName"
			:field-state="fieldState"
            @cancelSave="onCancelSaveField"
		/>
	</ml-dialog>
</template>

<script setup>
import { ref, shallowRef, markRaw, onMounted, useSlots } from "vue";

// 正常导入组件
import BooleanWE from "./field-editor/boolean-widget-editor.vue";
import IntegerWE from "./field-editor/integer-widget-editor.vue";
import DecimalWE from "./field-editor/decimal-widget-editor.vue";
import MoneyWE from "./field-editor/money-widget-editor.vue";
import TextWE from "./field-editor/text-widget-editor.vue";
import TextAreaWE from "./field-editor/textarea-widget-editor.vue";
import OptionWE from "./field-editor/option-widget-editor.vue";
import CodeOptionWE from "./field-editor/code-option-widget-editor.vue";
import TagWE from "./field-editor/tag-widget-editor.vue";
import AreaSelectWE from "./field-editor/areaselect-widget-editor.vue";
import DateWE from "./field-editor/date-widget-editor.vue";
import DateTimeWE from "./field-editor/datetime-widget-editor.vue";
import PictureWE from "./field-editor/picture-widget-editor.vue";
import FileWE from "./field-editor/file-widget-editor.vue";
import LocationWE from "./field-editor/location-widget-editor.vue";
import ReferenceWE from "./field-editor/reference-widget-editor.vue";
import ReferenceListWE from "./field-editor/referencelist-widget-editor.vue";
import OuterReferenceWE from "./field-editor/outerReference-widget-editor.vue";

const props = defineProps({
	entity: {
		type: String,
		default: "",
	},
	entityProps: {
		type: Object,
		default: () => ({}),
	},
});

const emit = defineEmits(["onFieldSaved"]);

// 使用markRaw标记组件
const fieldComponents = {
	BooleanWE: markRaw(BooleanWE),
	IntegerWE: markRaw(IntegerWE),
	DecimalWE: markRaw(DecimalWE),
	MoneyWE: markRaw(MoneyWE),
	TextWE: markRaw(TextWE),
	TextAreaWE: markRaw(TextAreaWE),
	OptionWE: markRaw(OptionWE),
	CodeOptionWE: markRaw(CodeOptionWE),
	TagWE: markRaw(TagWE),
	AreaSelectWE: markRaw(AreaSelectWE),
	DateWE: markRaw(DateWE),
	DateTimeWE: markRaw(DateTimeWE),
	PictureWE: markRaw(PictureWE),
	FileWE: markRaw(FileWE),
	LocationWE: markRaw(LocationWE),
	ReferenceWE: markRaw(ReferenceWE),
	ReferenceListWE: markRaw(ReferenceListWE),
	OuterReferenceWE: markRaw(OuterReferenceWE),
};

// 字段列表配置
const fieldList = [
	{ label: "布尔 / Boolean", value: "BooleanWE" },
	{ label: "整数 / Integer", value: "IntegerWE" },
	{ label: "精度小数 / Decimal", value: "DecimalWE" },
	{ label: "金额 / Money", value: "MoneyWE" },
	{ label: "文本 / Text", value: "TextWE", divided: true },
	{ label: "长文本 / TextArea", value: "TextAreaWE" },
	{ label: "单选项 / Option", value: "OptionWE" },
	{ label: "编码单选项 / CodeOption", value: "CodeOptionWE" },
	{ label: "多选项 / Tag", value: "TagWE" },
	{ label: "地区选择 / AreaSelect", value: "AreaSelectWE" },
	{ label: "日期 / Date", value: "DateWE", divided: true },
	{ label: "日期时间 / DateTime", value: "DateTimeWE" },
	{ label: "图片 / Picture", value: "PictureWE", divided: true },
	{ label: "文件 / File", value: "FileWE" },
	{ label: "定位 / Location", value: "LocationWE" },
	{ label: "一对一引用 / Reference", value: "ReferenceWE", divided: true },
	{ label: "多对多引用 / ReferenceList", value: "ReferenceListWE" },
    { label: "外部引用 / OuterReference", value: "OuterReferenceWE"},
];

// 组件插槽
let contentSlots = ref({});
// 是否显示默认插槽
let isShowDefaultSlot = ref(false);

onMounted(() => {
    contentSlots.value = useSlots();
    console.log(contentSlots.value)
    if(contentSlots.value.default){
        isShowDefaultSlot.value = true;
    }
});

// 使用shallowRef存储当前组件
const currentFieldComponent = shallowRef(null);
const currentEditorType = ref("");
const showNewFieldDialogFlag = ref(false);

// 字段状态 1新建 2编辑
let fieldState = ref(1);
let fieldName = ref("");

const handleNewFieldCommand = (command, name) => {
	currentFieldComponent.value = fieldComponents[command];
	currentEditorType.value = command.replace(/WE$/, "");
    if(typeof name === 'string'){
        fieldState.value = 2;
        fieldName.value = name;
    }else{
        fieldState.value = 1;
    }
	showNewFieldDialogFlag.value = true;
};



// 字段保存
const onFieldSaved = () => {
	showNewFieldDialogFlag.value = false;
	emit("onFieldSaved");
};

// 取消保存
const onCancelSaveField = () => {
	showNewFieldDialogFlag.value = false;
};

defineExpose({
	handleNewFieldCommand,
});
</script>

<style scoped lang="scss"></style>
