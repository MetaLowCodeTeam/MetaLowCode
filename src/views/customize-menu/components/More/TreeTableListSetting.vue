<template>
	<ml-dialog
		title="树形分组设置"
		v-model="isShow"
		width="550px"
		appendToBody
		:showClose="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-form label-position="top" @submit.prevent>
				<el-form-item
					label="配置树形数据的父子关系字段"
                    class="is-required"
				>
					<el-select
						v-model="formData.referenceFieldParent"
						placeholder="选择父子引用字段"
						clearable
						class="w-100"
                        :class="{ 'is-error': referenceFieldParentError }"
                        @focus="referenceFieldParentError = false"
					>
						<el-option
							v-for="item in referenceFieldParentList"
							:key="item.name"
							:label="item.label"
							:value="item.name"
						/>
					</el-select>
				</el-form-item>
                <el-form-item
					label="子表展示最大条数（默认展示1000条，可设置为0不限制条数）"
                    class="is-required"
				>
					<el-input-number
						v-model="formData.maxChildCount"
						:min="0"
						:step="1"
						class="w-100"
                        :align="'left'"
                        controls-position="right"
					/>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="isShow = false">取消</el-button>
			<el-button type="primary" @click="onConfirm">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";

// api
import layoutConfig from "@/api/layoutConfig";
import { getFieldSet } from "@/api/system-manager";

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
});

// 弹窗显示
const isShow = ref(false);
// 当前激活的事件 tab
const activeTab = ref("load");

let loading = ref(false);

// 树形表格配置
const formData = ref({
	referenceFieldParent: "",
    maxChildCount: 1000,
});

let referenceFieldParentList = ref([]);
let referenceFieldParentError = ref(false);
let layoutConfigId = ref(null);

const emits = defineEmits(["confirm"]);

const openDialog = () => {
	isShow.value = true;
	loadLayoutConfigData();
};

// 加载配置
const loadLayoutConfigData = async () => {
	loading.value = true;
	let res = await layoutConfig.getLayoutList(
		props.entityName,
		props.modelName
	);
	if (res?.code == 200) {
		layoutConfigId.value = null;
		let CUSTOM_TEMPLATE = res.data.CUSTOM_TEMPLATE;
		if (CUSTOM_TEMPLATE) {
			let { config } = CUSTOM_TEMPLATE;
			config = JSON.parse(config);
			formData.value.referenceFieldParent = config.referenceFieldParent;
            formData.value.maxChildCount = config.maxChildCount || 1000;
            layoutConfigId.value = CUSTOM_TEMPLATE.layoutConfigId;
		}
		let fieldSetRes = await getFieldSet(props.entityName);
		if (fieldSetRes) {
			referenceFieldParentList.value = fieldSetRes.data;
		}
	}
	loading.value = false;
};
// 确认
const onConfirm = async () => {
	if (!formData.value.referenceFieldParent) {
		ElMessage.error("请选择父子引用字段");
		referenceFieldParentError.value = true;
		return;
	}
    loading.value = true;
	let param = {
		config: JSON.stringify({
			referenceFieldParent: formData.value.referenceFieldParent,
            maxChildCount: formData.value.maxChildCount,
		}),
		entityCode: props.entityCode,
	};
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"CUSTOM_TEMPLATE",
		param,
		props.modelName
	);
	if (res?.code == 200) {
		ElMessage.success("保存成功");
		isShow.value = false;
		emits("confirm");
	}
	loading.value = false;
};

defineExpose({
	openDialog,
});
</script>
