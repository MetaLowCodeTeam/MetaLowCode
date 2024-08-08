<template>
	<!--  -->
	<mlDialog title="其他列表设置" v-model="isShow" width="500px">
		<div v-loading="loading" class="set-list-style">
			<div class="from-title">新建编辑弹框属性</div>
			<div class="from-item mb-15">
				<el-checkbox v-model="styleConf.actionConf.showFullScreen">
					显示全屏按钮
				</el-checkbox>
				<el-checkbox v-model="styleConf.actionConf.autoFullScreen">
					弹框自动全屏
				</el-checkbox>
			</div>
			<div class="from-title">查看侧滑栏属性</div>
			<div class="from-item mb-15">
				<el-checkbox v-model="styleConf.detailConf.showFullScreen">
					显示全屏按钮
				</el-checkbox>
				<el-checkbox v-model="styleConf.detailConf.autoFullScreen">
					弹框自动全屏
				</el-checkbox>
			</div>
			<div class="from-title">批量删除设置</div>
			<div class="from-item">
				<el-checkbox v-model="styleConf.delConf.allowUsersSelect">
					允许用户选择级联删除
				</el-checkbox>
                <div class="info-text mt-5 mb-2">默认级联删除</div>
				<MlAssociatedRecords
					v-model="styleConf.delConf.associatedRecords"
					:entityCode="entityCode"
				/>
			</div>
            <div class="from-title mt-15">自定义行样式设置</div>
			<div class="from-item">
                <div class="mb-10">
                    <span class="">自定义渲染</span>
                    <a class="ml-a-span" target="_blank" href="https://www.yuque.com/visualdev/melecode/bo0kqdmsnxmc8q2p?singleDoc#">使用文档</a>
                </div>
                <mlCodeEditor v-model="styleConf.rowConf.rowStyleRender"/>
			</div>
		</div>
		<template #footer>
			<div class="footer-div">
				<el-button @click="isShow = false" :loading="loading">
					取消
				</el-button>
				<el-button type="primary" @click="onSave" :loading="loading">
					保存
				</el-button>
			</div>
		</template>
	</mlDialog>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import { ElMessage } from "element-plus";
/**
 * API
 */
import layoutConfig from "@/api/layoutConfig";
/**
 * 组件
 */
import MlAssociatedRecords from "@/components/mlAssociatedRecords/index.vue";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
const props = defineProps({
	modelValue: null,
	entityCode: { type: Number },
	layoutConfig: { type: Object, default: () => {} },
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },
});
const emits = defineEmits(["update:modelValue", "confirm"]);
let isShow = ref(false);
let loading = ref(false);
let myLayoutConf = ref({});
let layoutConfigId = ref("");
let styleConf = ref({
	// 新建编辑弹框属性
	actionConf: {
		// 显示全屏按钮
		showFullScreen: false,
		// 弹框自动全屏
		autoFullScreen: false,
	},
	// 查看侧滑栏属性
	detailConf: {
		// 显示全屏按钮
		showFullScreen: false,
		// 弹框自动全屏
		autoFullScreen: false,
	},
    // 批量删除设置
    delConf: {
        // 允许用户选择级联删除
        allowUsersSelect: true,
        // 默认级联删除
        associatedRecords: [],
    },
    // 行设置
    rowConf: {
        rowStyleRender: ""
    },
});
watch(
	() => props.modelValue,
	() => {
		isShow.value = props.modelValue;
		initStyleConf();
	},
	{ deep: true }
);

watch(
	() => props.layoutConfig,
	() => {
		myLayoutConf.value = props.layoutConfig;
	},
	{
		deep: true,
	}
);

watch(
	() => isShow.value,
	(v) => {
		emits("update:modelValue", v);
	},
	{ deep: true }
);
onMounted(() => {
	isShow.value = props.modelValue;
	myLayoutConf.value = props.layoutConfig;
	initStyleConf();
});

// 初始化样式配置
const initStyleConf = () => {
	// 弹框不显示不调用
	if (!isShow.value) {
		return;
	}
	let { STYLE } = myLayoutConf.value;

	if (STYLE && STYLE.config) {
		styleConf.value = Object.assign(styleConf.value, JSON.parse(STYLE.config));
		layoutConfigId.value = STYLE.layoutConfigId;
	}
};

const onSave = async () => {
	let param = {
		config: JSON.stringify(styleConf.value),
		entityCode: props.entityCode,
	};
	loading.value = true;
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"STYLE",
		param,
        props.modelName
	);
	if (res) {
		ElMessage.success("保存成功");
		emits("confirm");
		isShow.value = false;
	}
	loading.value = false;
};
</script>
<style lang="scss" scoped>
.set-list-style {
	line-height: 1.2;
	.from-title {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 5px;
	}
}
</style>
