<template>
	<!--  -->
	<ml-dialog title="其他列表设置" v-model="isShow" width="850px" scrollbarHeight="500px" noBodyPadding>
        <div v-loading="loading" class="set-list-style">
            <el-row :gutter="20">
                <el-col :span="12">
                    <div class="form-title">列表设置</div>
                    <div class="form-item">
                        <div class="info-text mt-5 mb-2">序号列设置</div>
                        <el-checkbox v-model="styleConf.listConf.showRowNumber">
                            是否显示
                        </el-checkbox>
                        <el-radio-group 
                            v-model="styleConf.listConf.rowNumberPosition"
                            v-if="styleConf.listConf.showRowNumber"
                        >
                            <el-radio label="不冻结列" :value="false" />
                            <el-radio label="向左冻结列" value="left" />
                            <el-radio label="向右冻结列" value="right" />
                        </el-radio-group>
                    </div>
                    <div class="form-item mb-30">
                        <div class="info-text mt-5 mb-2">操作列宽度（初始值：120）</div>
                        <el-input-number 
                            v-model="styleConf.listConf.actionColumnWidth" 
                            placeholder="操作列宽度"
                            style="width: 160px"
                        />
                        <span class="ml-10">px</span>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="form-title">新建编辑弹框属性</div>
                    <div class="form-item mb-30">
                        <el-checkbox v-model="styleConf.actionConf.newTabOpenNew">
                            新页签打开新建
                        </el-checkbox>
                        <el-checkbox v-model="styleConf.actionConf.showFullScreen">
                            显示全屏按钮
                        </el-checkbox>
                        <el-checkbox v-model="styleConf.actionConf.autoFullScreen">
                            弹框自动全屏
                        </el-checkbox>
                    </div>
                </el-col>
                
                <el-col :span="12" v-if="!isListCard && !isListCalendar">
                    <div class="form-title">
                        顶部区域隐藏
                    </div>
                    <el-row>
                        <el-col 
                            v-for="(item,inx) in topHiddenConfig" 
                            :span="item.colspan || 12" 
                            :key="inx"    
                        >
                            <el-checkbox 
                                :checked="!styleConf.toolbarConf[item.value]"
                                @change="handleCheckboxChange(item.value, $event)"
                            >
                                {{ item.label }}
                            </el-checkbox>
                            <el-tooltip v-if="item.value === 'showMoreBtn'">
                                <template #content>
                                    如果开启隐藏可使用快捷键临时显示。 <br />
                                    Windows系统快捷键： <br />
                                    Shift + Alt + M + L <br /> <br />

                                    Mac系统 快捷键： <br />
                                    Shift + Option + M + L
                                </template>
                                <el-icon class="ml-5 cursor-pointer"><QuestionFilled /></el-icon>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :span="12">
                    <div class="form-title">查看侧滑栏属性</div>
                    <div class="form-item mb-20">
                        <el-checkbox v-model="styleConf.detailConf.showFullScreen">
                            显示全屏按钮
                        </el-checkbox>
                        <el-checkbox v-model="styleConf.detailConf.autoFullScreen">
                            弹框自动全屏
                        </el-checkbox>
                        <el-checkbox v-model="styleConf.detailConf.enablePagination">
                            启用上下条切换
                        </el-checkbox>
                    </div>
                </el-col>
                <el-col :span="12" v-if="!isListCard && !isListCalendar">
                    <div class="form-title">批量删除设置</div>
                    <div class="form-item mb-30">
                        <el-checkbox v-model="styleConf.delConf.allowUsersSelect">
                            允许用户选择级联删除
                        </el-checkbox>
                        <div class="info-text mt-5 mb-2">默认级联删除</div>
                        <MlAssociatedRecords
                            v-model="styleConf.delConf.associatedRecords"
                            :entityCode="entityCode"
                        />
                    </div>
                </el-col>
                <el-col :span="12" v-if="!isListCard && !isListCalendar">
                    <div class="form-title">复制设置</div>
                    <div class="form-item mb-30">
                        <el-checkbox v-model="styleConf.copyConf.openCopy">
                            打开复制功能
                        </el-checkbox>
                        <el-checkbox v-model="styleConf.copyConf.skipDuplicationCheck">
                            是否跳过唯一性检查
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                content="当前实体有字段设置为不可重复时，开启该功能后，数据依然可以复制成功。请视业务情况决定是否开启。"
                                placement="top-start"
                            >
                                <span style="position: relative; top: 2px">
                                    <el-icon><QuestionFilled /></el-icon>
                                </span>
                            </el-tooltip>
                        </el-checkbox>
                        <!-- <el-checkbox v-model="styleConf.copyConf.allowUsersSelect">
                            允许用户选择级联复制
                        </el-checkbox> -->
                        <div class="info-text mt-5 mb-2">默认级联复制</div>
                        <MlAssociatedRecords
                            v-model="styleConf.copyConf.cascades"
                            :entityCode="entityCode"
                        />
                    </div>
                </el-col>
                
                <el-col :span="12">
                    <div class="form-title">指定表单</div>
                    <el-tabs v-model="formActiveName" class="mb-20">
                        <el-tab-pane label="指定新建表单" name="addFormId">
                            <el-form label-width="120px" label-position="top">
                                <el-form-item label="指定新建表单(PC)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.pcAddFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="指定新建(Mobile)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.mobileAddFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                            </el-form> 
                        </el-tab-pane>
                        <el-tab-pane label="指定编辑表单" name="editFormId">
                            <el-form label-width="120px" label-position="top">
                                <el-form-item label="指定编辑表单(PC)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.pcEditFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="指定编辑表单(Mobile)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.mobileEditFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                            </el-form>         
                        </el-tab-pane>
                        <el-tab-pane label="指定查看详情表单" name="detailFormId">
                            <el-form label-width="120px" label-position="top">
                                <el-form-item label="指定查看详情表单(PC)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.pcDetailFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="指定查看详情表单(Mobile)" class="mb-5">
                                    <el-select v-model="styleConf.formConf.mobileDetailFormId" clearable>
                                        <el-option v-for="item in formList" :key="item.value" :label="item.layoutName" :value="item.formLayoutId" />
                                    </el-select>
                                </el-form-item>
                            </el-form> 
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
                <el-col :span="24" v-if="!isListCard && !isListCalendar">
                    <div class="form-title">自定义渲染</div>
                    <el-tabs v-model="activeName">
                        <el-tab-pane label="自定义行选中禁用设置" name="rowDisabledRender">
                            <div class="mb-10 mt-10">
                                <span>自定义渲染</span>
                                <a
                                    class="ml-a-span"
                                    target="_blank"
                                    href="https://www.yuque.com/visualdev/melecode/pep81f9rs3qkbdgf?singleDoc#"
                                >
                                    使用文档
                                </a>
                            </div>
                            <mlCodeEditor v-model="styleConf.rowConf.rowDisabledRender" />
                        </el-tab-pane>
                        <el-tab-pane label="自定义行按钮禁用设置" name="rowBtnDisabled">
                            <div class="mb-10 mt-10">
                                <span>自定义渲染</span>
                                <a
                                    class="ml-a-span"
                                    target="_blank"
                                    href="https://www.yuque.com/visualdev/melecode/nmmpo6z8y115bhym?singleDoc#"
                                >
                                    使用文档
                                </a>
                            </div>
                            <mlCodeEditor  v-model="styleConf.rowConf.rowBtnDisabled" />
                        </el-tab-pane>
                        <el-tab-pane label="自定义行样式设置" name="rowStyleRender">
                            <div class="mb-10 mt-10">
                                <span>自定义渲染</span>
                                <a
                                    class="ml-a-span"
                                    target="_blank"
                                    href="https://www.yuque.com/visualdev/melecode/bo0kqdmsnxmc8q2p?singleDoc#"
                                >
                                    使用文档
                                </a>
                            </div>
                            <mlCodeEditor  v-model="styleConf.rowConf.rowStyleRender" />
                        </el-tab-pane>
                        <el-tab-pane label="自定义弹框设置" name="dialogConfig">
                            <div class="mb-10 mt-10">
                                <span>自定义渲染</span>
                                <a
                                    class="ml-a-span"
                                    target="_blank"
                                    href="https://www.yuque.com/visualdev/melecode/bo0kqdmsnxmc8q2p?singleDoc#"
                                >
                                    使用文档
                                </a>
                            </div>
                            <mlCodeEditor  v-model="styleConf.dialogConfig" />
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>

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
	</ml-dialog>
</template>

<script setup>
import { onMounted, watch, ref, computed } from "vue";
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
import { getFormLayoutList } from "@/api/system-manager";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameByCode } = useCommonStore();
const props = defineProps({
	modelValue: null,
	entityCode: { type: Number },
	layoutConfig: { type: Object, default: () => {} },
	// 实体模块名称
	modelName: {
		type: String,
		default: "",
	},
    // 是否卡片列表
    isListCard: {
        type: Boolean,
        default: false,
    },
    // 是否日历列表
    isListCalendar: {
        type: Boolean,
        default: false,
    }
});
const emits = defineEmits(["update:modelValue", "confirm"]);
let isShow = ref(false);
let loading = ref(false);
let myLayoutConf = ref({});
let layoutConfigId = ref("");
const topHiddenConfig = ref([
    {
        label: "隐藏整块",
        value: "showHeader",
    },
    {
        label: "隐藏切换查询面板",
        value: "showChangeQueryPanel",
    },
    {
        label: "隐藏高级查询",
        value: "showAdvancedQuery",
    },
    {
        label: "隐藏快速搜索",
        value: "showQuickQuery",
    },
    {
        label: "隐藏打开按钮",
        value: "showOpenBtn",
    },
    {
        label: "隐藏编辑按钮",
        value: "showEditBtn",
    },
    {
        label: "隐藏新建按钮",
        value: "showAddBtn",
    },
    {
        label: "隐藏更多操作按钮",
        value: "showMoreBtn",
        colspan: 24,
    },
])
let styleConf = ref({
    // 列表设置
    listConf: {
        // 是否显示序号列
        showRowNumber: false,
        // 序号列位置
        rowNumberPosition: false,
        // 操作列宽度
        actionColumnWidth: null,
    },
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
        // 启用上下条切换
        enablePagination: true,
	},
    // 顶部设置
    toolbarConf: {
        // 顶部影藏
        showHeader: true,
        // 切换查询按钮隐藏
        showChangeQueryPanel: true,
        // 高级查询隐藏
        showAdvancedQuery: true,
        // 快速搜索隐藏
        showQuickQuery: true,
        // 打开隐藏
        showOpenBtn: true,
        // 编辑隐藏
        showEditBtn: true,
        // 新建隐藏
        showAddBtn: true,
        // 更多操作隐藏
        showMoreBtn: true,
    },
    // 指定表单属性
    formConf: {
        // 指定新建表单(PC)
        pcAddFormId: "",
        // 指定新建表单(Mobile)
        mobileAddFormId: "",
        // 指定查看详情表单(PC)
        pcDetailFormId: "",
        // 指定查看详情表单(Mobile)
        mobileDetailFormId: "",
        // 指定编辑表单(PC)
        pcEditFormId: "",
        // 指定编辑表单(Mobile)
        mobileEditFormId: "",
    },
	// 批量删除设置
	delConf: {
		// 允许用户选择级联删除
		allowUsersSelect: true,
		// 默认级联删除
		associatedRecords: [],
	},
	// 复制设置
	copyConf: {
		// 打开复制功能
		openCopy: false,
		// 允许用户选择级联复制
		allowUsersSelect: false,
		// 默认级联删除
		cascades: [],
		// 是否跳过唯一性检查
		skipDuplicationCheck: false,
	},
	// 行设置
	rowConf: {
        // 行样式
		rowStyleRender: "",
        // 行禁用
        rowDisabledRender: "return false",
        // 按钮禁用
        rowBtnDisabled: `return {
    // 查看按钮是否禁用
    view: false,
    // 编辑按钮是否禁用
    edit: false,
    // 更多操作按钮是否禁用（PC无效，PC通过禁用选中行禁用更多操作）
    more: false
}`
	},
    // 弹框设置
    dialogConfig: `return {
    // 编辑标题
    editTitle: "",
    // 查看标题
    detailTitle: "",
}`,
    // 卡片列表设置
    listCardConf: {
        pc: {},
        mobile: {},
    }
});

const activeName = ref("rowDisabledRender");
const formActiveName = ref("addFormId");

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

let formList = ref([]);


// 初始化样式配置
const initStyleConf = () => {
	// 弹框不显示不调用
	if (!isShow.value) {
		return;
	}
	let { STYLE } = myLayoutConf.value;
	if (STYLE && STYLE.config) {
		styleConf.value = Object.assign(
			styleConf.value,
			JSON.parse(STYLE.config)
		);
		layoutConfigId.value = STYLE.layoutConfigId;
        // 老数据初始化默认值
        // 初始化序号列位置
        styleConf.value.listConf.rowNumberPosition = styleConf.value.listConf.rowNumberPosition || false;
	}
    initFormList();
};

const initFormList = async () => {
    loading.value = true;
    let res = await getFormLayoutList(queryEntityNameByCode(props.entityCode));
    if(res) {
        formList.value = res.data;
        // if(formList.value && formList.value.length > 0) {
        //     const firstFormLayoutId = formList.value[0].formLayoutId;
        //     // 使用对象解构赋值的方式简化代码，减少重复设置
        //     const { formConf } = styleConf.value;
        //     Object.assign(formConf, {
        //         pcAddFormId: formConf.pcAddFormId || firstFormLayoutId,
        //         mobileAddFormId: formConf.mobileAddFormId || firstFormLayoutId,
        //         pcEditFormId: formConf.pcEditFormId || firstFormLayoutId,
        //         mobileEditFormId: formConf.mobileEditFormId || firstFormLayoutId,
        //         pcDetailFormId: formConf.pcDetailFormId || firstFormLayoutId,
        //         mobileDetailFormId: formConf.mobileDetailFormId || firstFormLayoutId
        //     });
        // }
    }
    loading.value = false;
}

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


// 处理checkbox的change事件
const handleCheckboxChange = (key, event) => {
    styleConf.value.toolbarConf[key] = !event;
}

</script>
<style lang="scss" scoped>
.set-list-style {
    // display: flex;
    text-align: left;
    // flex-direction: column;
    // justify-content: space-between;
	// line-height: 1;
	// max-height: 500px;
	// overflow-y: auto;
	// overflow-x: hidden;
	// padding: 20px;
    line-height: 32px;
	.form-title {
		font-weight: bold;
		font-size: 18px;
		margin-bottom: 5px;
	}
    .form-item {
        // line-height: 32px;
    }
}
</style>
