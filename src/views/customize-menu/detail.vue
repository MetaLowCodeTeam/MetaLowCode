<template>
	<el-drawer
		:size="isFullSceen ? '100%' : '62.4%'"
		class="ml-drawer"
        v-if="detailDialog.isShow"
        v-model="detailDialog.isShow"
		direction="rtl"
		:show-close="false"
		:append-to-body="true"
		:modal-append-to-body="false"
	>
		<template #header>
			<div class="detail-header">
				<div class="detail-header-title">
					{{ detailName }}
					<div class="fr fr-box">
						<span
							class="fr-icon mr-10"
							@click="onFullSceen"
							v-if="styleConf?.detailConf.showFullScreen"
						>
							<el-icon size="20">
								<ElIconFullScreen />
							</el-icon>
						</span>
						<span class="fr-icon mr-10" @click="refresh">
							<el-icon>
								<ElIconRefresh />
							</el-icon>
						</span>
						<span
							class="fr-icon"
							@click="detailDialog.isShow = false"
						>
							<el-icon>
								<ElIconCloseBold />
							</el-icon>
						</span>
					</div>
				</div>
			</div>
		</template>

		<div class="detail-main" v-loading="loading">
			<el-row :gutter="20" v-if="!noeData">
				<el-col :span="21">
					<DetailTabs
						:tabsConf="detailDialog"
						@tabChange="tabChange"
						:cutTab="cutTab"
						@confirm="refresh"
                        :checkTabsFilter="checkTabsFilter"
					/>
					<!-- 详情 -->
					<div v-if="cutTab == 'detail'">
						<mlApproveBar :approvalInfo="approvalStatus" />
						<v-form-render
							v-if="haveLayoutJson"
							:option-data="optionData"
							:global-dsv="globalDsv"
							ref="vFormRef"
						/>
						<el-empty
							v-else
							:image-size="100"
							description="未查询到相关配置数据"
						/>
					</div>
					<!-- 非详情 -->
					<div v-else>
						<DetailTabCom
							ref="detailTabComRefs"
							:cutTab="cutTab"
							:tabs="detailDialog.tab"
							:entityId="detailId"
                            @closeDialog="closeDialog"
						/>
					</div>
				</el-col>
				<el-col :span="3">
					<div class="detail-right" style="padding-top: 40px">
                        <template v-if="detailParamConf.showBasicBlock">
                            <div class="group-button-label">基本操作</div>
                            <el-row
                                class="group-el-button"
                                style="margin-bottom: 30px"
                            >
                                <el-col :span="24" v-if="contentSlots.beforeNewRelatedBtn">
                                    <slot name="beforeNewRelatedBtn"></slot>
                                </el-col>
                                <el-col :span="24" v-if="$TOOL.checkRole('r6008') && detailParamConf.showNewRelatedBtn">
                                    <NewRelated
                                        :entityName="entityName"
                                        :entityCode="entityCode"
                                        :addConf="addConf"
                                        @confirm="newRelatedConfirm"
                                        @add="onAdd"
                                        :checkNewRelatedFilter="checkNewRelatedFilter"
                                    />
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.beforeEditBtn">
                                    <slot name="beforeEditBtn"></slot>
                                </el-col>
                                <el-col :span="24" v-if="detailParamConf.showEditBtn">
                                    <el-button
                                        type="primary"
                                        plain
                                        @click="onEditRow"
                                        :disabled="
                                            approvalStatus &&
                                            (approvalStatus.value == 3 ||
                                                approvalStatus.value == 1)
                                        "
                                        :title="getEditBtnTitle()"
                                    >
                                        <span class="mr-5">
                                            <el-icon>
                                                <ElIconEditPen />
                                            </el-icon>
                                        </span>
                                        编辑
                                    </el-button>
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.beforeMoreBtn">
                                    <slot name="beforeMoreBtn"></slot>
                                </el-col>
                                <el-col :span="24">
                                    <More
                                        ref="MoreRefs"
                                        :listParamConf="detailParamConf"
                                        type="detail"
                                        :multipleSelection="multipleSelection"
                                        :entityCode="entityCode"
                                        :detailId="detailId"
                                        :idFieldName="idFieldName"
                                        :nameFieldName="nameFieldName"
                                        @editColumnConfirm="editColumnConfirm"
                                        :layoutConfig="myLayoutConfig"
                                        @copySuccess="copySuccess"
                                    />
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.afterMoreBtn">
                                    <slot name="afterMoreBtn"></slot>
                                </el-col>
                            </el-row>
                        </template>
						<el-row class="group-el-button" v-if="detailParamConf.showProcessBlock && (contentSlots.processBlockUnshift || recordApproval || contentSlots.processBlockPush)">
                            <el-col :span="24" v-if="contentSlots.processBlockUnshift">
                                <slot name="processBlockUnshift"></slot>
                            </el-col>
							<el-col :span="24" v-if="showApprovalRelated()">

								<ApprovalRelated
									:recordApproval="recordApproval"
									@onSubmit="onSubmitApproval"
                                    @closeDialog="closeDialog"
								/>
							</el-col>
                            <el-col :span="24" v-if="contentSlots.processBlockPush">
                                <slot name="processBlockPush"></slot>
                            </el-col>
						</el-row>
					</div>
				</el-col>
			</el-row>
			<el-empty v-else description="暂无数据" />
		</div>
        <mlCustomEdit 	
            ref="editRefs"
            @saveFinishCallBack="onConfirm"
			:nameFieldName="nameFieldName"
        />
	</el-drawer>
</template>

<script setup>
defineOptions({
    name: "default-detail",
});

import mlCustomEdit from '@/components/mlCustomEdit/index.vue';

import { 
    ref, 
    reactive, 
    inject, 
    nextTick, 
    watch,
    watchEffect,
    onMounted,
    useSlots
 } from "vue";
import DetailTabs from "./components/DetailTabs.vue";
import { getFormLayout } from "@/api/system-manager";
import { queryById } from "@/api/crud";
import More from "./components/More/Index.vue";
import DetailTabCom from "./components/DetailTabCom.vue";
// import Edit from "./edit.vue";

// import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
// console.log(mlCustomEdit,'mlCustomEdit');
// import sss from '@/components/mlCustomEdit/index.vue';

import NewRelated from "./components/NewRelated.vue";
import ApprovalRelated from "./components/ApprovalRelated.vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
/**
 * 组件
 */
import mlApproveBar from "@/components/mlApproveBar/index.vue";
/**
 * API
 */
import { getRecordApprovalState } from '@/api/approval';
import { checkTables } from "@/api/layoutConfig";

const $TOOL = inject("$TOOL");
const props = defineProps({
	layoutConfig: { type: Object, default: () => {} },
    // 详情配置
    detailConf: {
        type: Object,
        default: () => {}
    },
});



// Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/nqyxilpbxch417c8?singleDoc#
// 配置项
const detailParamConf = ref({
    showBasicBlock: true,
    showProcessBlock: true,
    showNewRelatedBtn: true,
    showEditBtn: true,
    showMoreBtn: true,
})

// 插槽内容
let contentSlots = reactive({});

watchEffect(() => {
    detailParamConf.value = Object.assign(detailParamConf.value, props.detailConf)
})

onMounted(() => {
    // 取插槽内容
    contentSlots = useSlots();
})

// 整体配置信息
let myLayoutConfig = ref({});
// 列表样式配置
let styleConf = ref({
	// 查看侧滑栏属性
	detailConf: {
		// 显示全屏按钮
		showFullScreen: false,
		// 弹框自动全屏
		autoFullScreen: false,
	},
});


const { queryEntityNameById, queryEntityCodeById } = useCommonStore();
const emits = defineEmits(["onConfirm", "onEdit"]);
const $API = inject("$API");
let vFormRef = ref();
let detailDialog = reactive({
	isShow: false,
	tab: {},
});
let loading = ref(false);
let multipleSelection = ref([]);
// 审批状态
let approvalStatus = ref(null);
// 审批信息
let recordApproval = ref(null);
let entityCode = ref("");
let entityName = ref("");
let detailId = ref("");
let idFieldName = ref("");
let detailName = ref("");
let nameFieldName = ref("");

// 当前行数据
let rowResData = ref({});

// 当前页签
let cutTab = ref("detail");
// 表单数据
let optionData = ref({});
let globalDsv = ref({});

// 指定表单ID
let formId = ref("");

const openDialog = (id, localDsv, paramFormId) => {
	detailId.value = id;
	entityCode.value = queryEntityCodeById(id);
	entityName.value = queryEntityNameById(id);
	if (!entityName.value) {
		ElMessage.warning("当前实体未找到");
		return;
	}
    if(localDsv){
        globalDsv.value = Object.assign(globalDsv.value, localDsv);
    }
    if(paramFormId) {
        formId.value = paramFormId;
    }
	detailDialog.entityCode = entityCode.value;
	detailDialog.entityName = entityName.value;
	detailDialog.isShow = true;
	// 加载数据
	refresh();
};

const closeDialog = () => {
    detailDialog.isShow = false;
}

// 页签更换
const tabChange = (tab) => {
	cutTab.value = tab;
	if (tab == "detail") {
		refresh();
	}
};
// 刷新
const refresh = () => {
	cutTab.value = "detail";
	getLayoutList();
};

// 新建相关
let addConf = ref({});
let detailTabComRefs = ref();
// 新建相关完成触发
const newRelatedConfirm = async () => {
	loading.value = true;
	let res = await $API.layoutConfig.getLayoutList(entityName.value);
	if (res) {
        myLayoutConfig.value = res.data;
        myLayoutConfig.value.entityCode = entityCode.value;
        myLayoutConfig.value.entityName = entityName.value;
		// 新建配置项
		formatNewRelated(res.data.ADD);
		if (cutTab.value == "detail") {
			initData();
		} else {
			detailTabComRefs.value.initData();
		}
	}
	loading.value = false;
};

// 提交审批触发
const onSubmitApproval = () => {
	onConfirm();
};

// 检测页签过滤
let checkTabsFilter = ref({});
// 新建项过滤
let checkNewRelatedFilter= ref({});

// 加载页签
const getLayoutList = async () => {
	loading.value = true;
	let res = await $API.layoutConfig.getLayoutList(entityName.value);
	if (res) {
        myLayoutConfig.value = res.data;
        myLayoutConfig.value.entityCode = entityCode.value;
        myLayoutConfig.value.entityName = entityName.value;
        let { STYLE } = res.data;
        if (STYLE && STYLE.config) {
            styleConf.value = JSON.parse(STYLE.config);
            if (styleConf.value?.detailConf.autoFullScreen) {
                isFullSceen.value = true;
            }
        }
        // 如果有页签配置
        if(res.data.TAB?.config){
            // 取所有页签数据
            let tabConfig = JSON.parse(res.data.TAB.config);
            // 拿所有页签过滤参数
            let filterList = tabConfig.map(el => el.filter);
            if(tabConfig && tabConfig.length > 0){
                // 调用查询接口判断该页签是否显示
                let tabRes = await checkTables(filterList, detailId.value);
                if(tabRes){
                    checkTabsFilter.value = tabRes.data;
                }
            }
           
        }
        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        // 新建配置项
		formatNewRelated(res.data.ADD);
		idFieldName.value = res.data.idFieldName;
		nameFieldName.value = res.data.nameFieldName;
	
		initData();
	} else {
		loading.value = false;
	}
};

// 格式化新建相关-新加接口判断过滤条件
const formatNewRelated = async (conf) => {
    addConf.value = conf || {};
    // 如果有新建相关
    if(addConf.value.config) {
        // 取所有新建项数
        let addConfig = JSON.parse(addConf.value.config);
        // 取所有新建项过滤参数
        let filterList = addConfig.map(el => el.filter);
        if(addConfig && addConfig.length > 0){
            // 调用查询接口判断该页签是否显示
            let newAddRes = await checkTables(filterList, detailId.value);
            if(newAddRes){
                checkNewRelatedFilter.value = newAddRes.data;
            }
        }
    }
}


let haveLayoutJson = ref(false);
let noeData = ref(false);

// 初始化数据
const initData = async () => {
	loading.value = true;
	let res = await getFormLayout(entityName.value, formId.value);
	haveLayoutJson.value = false;
	noeData.value = false;
	if (res) {
		if (res.data?.layoutJson) {
			haveLayoutJson.value = true;
			optionData.value = res.data.optionData || {};
			// 根据数据渲染出页面填入的值，填过
			nextTick(async () => {
				globalDsv.value.formStatus = 'read';
				globalDsv.value.formEntityId = detailId.value;
                // 获取审批信息
                let recordApprovalRes = await getRecordApprovalState(detailId.value);
                if(recordApprovalRes){
                    recordApproval.value = recordApprovalRes.data;
                    globalDsv.value.flowVariables = recordApprovalRes.data?.flowVariables;
                }
				let queryByIdRes = await queryById(detailId.value);
				if (queryByIdRes && queryByIdRes.data) {
		            multipleSelection.value = [queryByIdRes.data];
                    globalDsv.value.rowRecordData = queryByIdRes.data;
					detailName.value = queryByIdRes.data[nameFieldName.value];
                    // console.log(res.data.layoutJson,'res.data.layoutJson')
					vFormRef.value.setFormJson(res.data.layoutJson);
                    rowResData.value = queryByIdRes.data || {};
					vFormRef.value.resetForm();
                    approvalStatus.value = queryByIdRes.data.approvalStatus;
					nextTick(() => {
						vFormRef.value.setFormData(rowResData.value);
						nextTick(() => {
							vFormRef.value.reloadOptionData();
							
							vFormRef.value.setReadMode();
							globalDsv.value.openCreateDialog = openCreateDialog;
						});
					});

					noeData.value = false;
				} else {
					noeData.value = true;
				}
				loading.value = false;
			});
		} else {
			loading.value = false;
		}
	} else {
		loading.value = false;
	}
};

// 复制成功
const copySuccess = ({type, recordId}) => {
    emits("onConfirm");
    if(type == 1){
        let tempV = {
            detailId: detailId.value
        };
        editEmits(tempV)
    }else {
        openDialog(recordId)
    }
}

// 打开编辑
let editRefs = ref();
const onEditRow = (localDsv, formId) => {
    let tempV = {
        detailId: detailId.value
    };
    !!localDsv && (tempV.localDsv = localDsv)
    !!formId && (tempV.formId = formId)
    editEmits(tempV)
};

// 新建
const onAdd = (e) => {
	let tempV = {};
	tempV.entityName = e.entityName;
	tempV.fieldName = e.fieldName;
	tempV.fieldNameVale = detailId.value;
	tempV.fieldNameLabel = detailName.value;
    tempV.sourceRecord = multipleSelection.value[0];
    editEmits(tempV)
};

const editEmits = (obj) => {
    // emits('onEdit', obj)
    editRefs.value.openDialog(obj);
}

// DSV新建
const openCreateDialog = (entityName, fieldName) => {
	onAdd({ entityName, fieldName });
};

const editColumnConfirm = (v) => {
	if (v && v.isDel) {
		detailDialog.isShow = false;
		emits("onConfirm");
	} else {
		onConfirm();
	}
};

// 编辑确认
const onConfirm = () => {
	if (cutTab.value == "detail") {
		getLayoutList();
	} else {
		detailTabComRefs.value.initData();
	}
	emits("onConfirm");
};

const getEditBtnTitle = () => {
	let str = "";
	if (approvalStatus.value && approvalStatus.value.value == 3) {
		str = "记录已完成审批，禁止编辑";
		return;
	}
	if (approvalStatus.value && approvalStatus.value.value == 1) {
		str = "记录正在审批中，禁止编辑";
	}
	return str;
};

let isFullSceen = ref(false);
// 全屏
const onFullSceen = () => {
	isFullSceen.value = !isFullSceen.value;
};


/**
 * 导出方法
 */

// 获取实体信息
const getCurEntity = () => {
    return {
        name: entityName.value,
        code: entityCode.value,
        idFieldName: idFieldName.value,
        nameFieldName: nameFieldName.value,
    }
}

// 获取当前详情数据
const getCurDetailInfo = () => {
    return rowResData.value;
}

// 编辑
const toEdit = (localDsv, formId) => {
    onEditRow(localDsv, formId);
}

const MoreRefs = ref();
// 更多操作
const toMoreAction = (type) => {
    let allocationTypes = ['del', 'allocation', 'share', 'unShare'];
    if(allocationTypes.includes(type)){
        if(multipleSelection.value.length < 1){
            ElMessage.warning("请先选择数据")
            return
        }
        MoreRefs.value?.allocationFn(type);
    }else if(type == 'reportForms'){
        MoreRefs.value?.openReportForms();
    }else if(type == 'printer'){
        MoreRefs.value?.openPrinter();
    }
}

// 是否显示流程操作快
const showApprovalRelated = () => {
    // 如果没有审批流程
    if(!recordApproval.value) {
        return false;
    }
    let { 
        imApproval, 
        startApproval, 
        queryHistory, 
        revokeApproval 
    } = recordApproval.value;
    if(imApproval){
        return true
    }
    if(startApproval){
        return true
    }
    if($TOOL.checkRole('r6013') && revokeApproval){
        return true
    }
    if(queryHistory){
        return true
    }

    return false

}


// 暴露方法给父组件调用
defineExpose({
	openDialog,
    getCurEntity,
    getCurDetailInfo,
    toEdit,
    toMoreAction
});
</script>

<style lang="scss" scoped>
:deep(.el-form-item--default),
:deep(.el-form-item) {
	margin-bottom: 5px !important;
}

.detail-header {
	border-bottom: 2px solid #f1f2f3;
	// padding-bottom: 20px;
	// box-sizing: border-box;
	padding: 16px;
	height: 56px;
	//background: #f0f0f0;
	.fr-box {
		// height: 60px;
		.fr-icon {
			cursor: pointer;
			&:hover {
				color: var(--el-color-primary);
			}
		}
	}

	.detail-header-title {
		font-size: 18px;
		padding-left: 5px;
		border-left: 5px solid;
		border-left-color: var(--el-color-primary);
	}
}
.detail-main {
	// padding: 20px;
	font-size: 14px;
	.detail-right {
		.group-el-button {
			:deep(.el-button) {
				margin-bottom: 5px;
				min-width: 110px !important;
			}
		}

		.group-button-label {
			font-size: 11px;
			color: #999999;
			margin-bottom: 5px;
		}
	}
}
</style>

<style lang="scss">
.detail-main {
	.el-form-item--default,
	.el-form-item {
		margin-bottom: 5px !important;
	}
}

.detail-right {
    .group-el-button {
        .el-button {
            margin-bottom: 5px;
            min-width: 110px !important;
        }
    }
}
</style>
