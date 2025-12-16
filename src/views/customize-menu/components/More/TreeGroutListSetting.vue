<template>
	<ml-dialog
		title="树形分组设置"
		v-model="isShow"
		width="850px"
		appendToBody
		:showClose="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<div class="mb-10">
				<span>三个事件：</span>
				<a
					class="ml-a-span"
					target="_blank"
					href="https://www.yuque.com/visualdev/melecode/yvecu1cs06ihdhbz?singleDoc# 《2.0 树形分组列表》"
				>
					使用文档
				</a>
			</div>
			<el-tabs v-model="activeTab">
				<el-tab-pane label="加载事件（初始化树数据）" name="load">
					<mlCodeEditor
						v-model="formData.onLoadEvent"
						funcParam="exposed"
					/>
				</el-tab-pane>
				<el-tab-pane label="节点展开事件（懒加载）" name="expand">
					<mlCodeEditor
						v-model="formData.onNodeExpandEvent"
						funcParam="exposed"
					/>
				</el-tab-pane>
				<el-tab-pane label="节点点击事件" name="click">
					<mlCodeEditor
						v-model="formData.onNodeClickEvent"
						funcParam="exposed"
					/>
				</el-tab-pane>
			</el-tabs>
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
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// api
import layoutConfig from "@/api/layoutConfig";

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

// 事件脚本配置
const formData = ref({
	// 加载事件：初始化树形数据
	onLoadEvent: "let { http } = exposed;\n// 异步\nreturn new Promise(async (resolve, reject) => {\n  let res = await http.post(\"/cm/call/getTreeData\");\n  if(res && res.code == 200) {\n    let treeData = res.data;\n    resolve(treeData)\n  }\n});",
	// 节点展开事件：用于懒加载子节点
	onNodeExpandEvent: "let { http, nodeData } = exposed;\n// 异步\nreturn new Promise(async (resolve, reject) => {\n  let res = await http.post(\"/cm/call/getTreeDataById\", {\n    recordId: nodeData.id\n  });\n  if(res && res.code == 200) {\n    let treeData = res.data;\n    resolve(treeData)\n  }\n});",
	// 节点点击事件：节点被点击时触发
	onNodeClickEvent: "",
});

let layoutConfigId = ref(null);

const emits = defineEmits(["confirm"]);

const openDialog = () => {
	isShow.value = true;
    loadLayoutConfigData();
};

// 加载配置
const loadLayoutConfigData = async () => {
    loading.value = true;
    let res = await layoutConfig.getLayoutList(props.entityName, props.modelName);
    if(res?.code == 200) {
        layoutConfigId.value = null;
        let CUSTOM_TEMPLATE = res.data.CUSTOM_TEMPLATE;
        if(CUSTOM_TEMPLATE) {
            let { config } = CUSTOM_TEMPLATE;
            config = JSON.parse(config);
            // formData.value.onLoadEvent = config.onLoadEvent;
            // formData.value.onNodeExpandEvent = config.onNodeExpandEvent;
            formData.value.onNodeClickEvent = config.onNodeClickEvent;
            layoutConfigId.value = CUSTOM_TEMPLATE.layoutConfigId;
        }
    }
    loading.value = false;
};
// 确认
const onConfirm = async () => {
	loading.value = true;
	let param = {
		config: JSON.stringify({
			onLoadEvent: formData.value.onLoadEvent,
			onNodeExpandEvent: formData.value.onNodeExpandEvent,
			onNodeClickEvent: formData.value.onNodeClickEvent,
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
