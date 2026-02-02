<template>
	<el-drawer
		:size="isFullScreen ? '100%' : styleConf?.newDialogConfig?.detailWidth || '62.4%'"
		class="ml-drawer"
        v-model="detailDialog.isShow"
		direction="rtl"
		:show-close="false"
		:append-to-body="true"
		:modal-append-to-body="false"
		destroy-on-close
		:before-close="beforeClose"
	>
		<template #header>
			<div class="detail-header">
				<div class="detail-header-title">
					<span class="title-span" :title="detailParamConf.customDialogTitle || customDialogTitle || styleConf?.newDialogConfig?.detailTitle || detailName">
                        {{ detailParamConf.customDialogTitle || customDialogTitle || styleConf?.newDialogConfig?.detailTitle || detailName }}
                    </span>
					<div class="fr fr-box">
                        <span v-if="styleConf.detailConf.enablePagination || styleConf.detailConf.enablePagination == undefined" class="enable-pagination-span">
                            <el-button
                                size="small"
                                type="primary"
                                @click="onPrev"
                                :disabled="!prevRecordId"
                                :loading="loading"
                                icon="ArrowLeft"
                                plain
                            >
                                上一条
                            </el-button>
                            <el-button
                                size="small"
                                type="primary"
                                @click="onNext"
                                :disabled="!nextRecordId"
                                :loading="loading"
                                plain
                            >
                                下一条
                                <el-icon class="ml-3">
                                    <ElIconArrowRight />
                                </el-icon>
                            </el-button>
                        </span>
						<span
							class="fr-icon mr-10"
							@click="onFullScreen"
							v-if="styleConf?.detailConf.showFullScreen"
						>
							<el-icon size="20">
								<ElIconFullScreen />
							</el-icon>
						</span>
						<span class="fr-icon mr-10" @click="loading ? null : refresh()">
							<el-icon>
								<ElIconRefresh />
							</el-icon>
						</span>
						<span
							class="fr-icon"
							@click="closeDialog"
						>
							<el-icon>
								<ElIconCloseBold />
							</el-icon>
						</span>
					</div>
				</div>
			</div>
		</template>

		<div class="detail-main" v-loading="loading" :class="{'left-tabs': publicSetting.detailTabsPosition == 'left'}">
			<el-row :gutter="20" v-if="!noeData">
				<el-col :span="21">
                    <div class="detail-left-box">
                        <DetailTabs
                            :tabsConf="detailDialog"
                            @tabChange="tabChange"
                            :cutTabIndex="cutTabIndex"
                            @confirm="refresh"
                            :checkTabsFilter="checkTabsFilter"
                            :modelName="modelName"
                            ref="detailTabsRefs"
                        />
                        <div class="detail-container">
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
                            <div v-else-if="cutTab == 'Attachment'">
                                <Attachment :entityCode="entityCode" :recordId="detailId"/>
                            </div>
                            <div v-else-if="cutTab.includes('detail_custom_component_all') || cutTab.includes('detail_custom_component_pc')">
                                <!-- 拿最后一个-后面的字符串 -->
                                <component
                                    v-if="componentExists(cutTab.split('_').pop())"
                                    :is="cutTab.split('_').pop()"
                                    :recordId="detailId"
                                    :recordData="globalDsv.recordData"
                                    ref="customComponentRefs"
                                />
                                <el-empty v-else :description="'组件【'+ cutTab.split('_').pop() +'】不存在，请确认该组件是否已全局注册'" />
                            </div>
                            <!-- 非详情 -->
                            <div v-else>
                                <DetailTabCom
                                    ref="detailTabComRefs"
                                    :cutTab="cutTabCom"
                                    :tabs="detailDialog.tab"
                                    :cutTabIndex="cutTabIndex"
                                    :entityId="detailId"
                                    :idFieldName="idFieldName"
                                    :recordData="globalDsv.recordData"
                                    @closeDialog="closeDialog"
                                    @addRow="onAdd"
                                />
                            </div>
                        </div>
                    </div>
				</el-col>
				<el-col :span="3">
					<div class="detail-right" style="padding-top: 40px">
                        <template v-if="detailParamConf.showBasicBlock && !customButtonList.length">
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
                                        :modelName="modelName"
                                        :checkNewRelatedFilter="checkNewRelatedFilter"
                                    />
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.beforeEditBtn">
                                    <slot name="beforeEditBtn"></slot>
                                </el-col>
                                <el-col :span="24" v-if="detailParamConf.showEditBtn && !checkDetailEntityFlag(entityCode)">
                                    <el-button
                                        type="primary"
                                        plain
                                        @click="onEditRow"
                                        :disabled="!checkModifiableEntity(detailId, approvalStatus?.value)"
                                        :title="getEditBtnTitle()"
                                        v-if="$TOOL.checkRole('r' + entityCode + '-3')"
                                    >
                                        <span class="mr-5">
                                            <el-icon>
                                                <ElIconEditPen />
                                            </el-icon>
                                        </span>
                                        编辑
                                    </el-button>
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.beforeRevisionHistory">
                                    <slot name="beforeRevisionHistory"></slot>
                                </el-col>
                                <el-col :span="24" v-if="detailParamConf.showRevisionHistory && !checkDetailEntityFlag(entityCode)">
                                    <el-button
                                        type="primary"
                                        plain
                                        @click="toRevisionHistory(detailId)"
                                    >
                                        <span class="mr-5 icon-top-1">
                                            <el-icon>
                                                <ElIconClock />
                                            </el-icon>
                                        </span>
                                        修改历史
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
                                        @editColumnConfirm="editColumnConfirm"
                                        :layoutConfig="myLayoutConfig"
                                        :isMainDetailField="checkDetailEntityFlag(entityCode)"
                                        @copySuccess="copySuccess"
                                    />
                                </el-col>
                                <el-col :span="24" v-if="contentSlots.afterMoreBtn">
                                    <slot name="afterMoreBtn"></slot>
                                </el-col>
                            </el-row>
                        </template>
                        <template v-else>
                            <div
                                v-for="(item,customBtnIndex) in customButtonList"
                                :key="customBtnIndex"
                                class="block-el-button"
                            >
                                <slot v-if="item.type === 'slot'" :name="item.name" :row="rowResData"></slot>
                                <NewRelated
                                    v-else-if="item.key == 'newRelated' && !item.hide"
                                    :entityName="entityName"
                                    :entityCode="entityCode"
                                    :modelName="modelName"
                                    :addConf="addConf"
                                    @confirm="newRelatedConfirm"
                                    @add="onAdd"
                                    :checkNewRelatedFilter="checkNewRelatedFilter"
                                />
                                <el-button
                                    plain
                                    :type="item.type"
                                    v-else-if="!item.hidden"
                                    class="mb-5"
                                    @click="customButtonClick(item)"
                                    :disabled="item.disabled"
                                >
                                    <el-icon
                                        :color="item.iconColor"
                                        v-if="
                                            item.icon &&
                                            item.showType != 3
                                        "
                                        style="position: relative; top: -1px"
                                    >
                                        <component :is="item.icon" />
                                    </el-icon>
                                    <span
                                        v-if="item.showType != 2"
                                        :class="{
                                            'ml-5':
                                                item.showType == 1 &&
                                                item.icon,
                                        }"
                                    >
                                        {{ item.isNative ? item.name || item.defaultName : item.name }}
                                    </span>
                                </el-button>
                                <More
                                    ref="MoreRefs"
                                    :listParamConf="detailParamConf"
                                    type="detail"
                                    :multipleSelection="multipleSelection"
                                    :entityCode="entityCode"
                                    :detailId="detailId"
                                    @editColumnConfirm="editColumnConfirm"
                                    :layoutConfig="myLayoutConfig"
                                    :isMainDetailField="checkDetailEntityFlag(entityCode)"
                                    @copySuccess="copySuccess"
                                    v-else-if="item.key == 'more' && !item.hide"
                                />
                            </div>
                        </template>
						<el-row class="group-el-button" v-if="detailParamConf.showProcessBlock && (contentSlots.processBlockUnshift || recordApproval || contentSlots.processBlockPush) && cutTab == 'detail'">
                            <el-col :span="24" v-if="contentSlots.processBlockUnshift">
                                <slot name="processBlockUnshift"></slot>
                            </el-col>
							<el-col :span="24" v-if="showApprovalRelated()">
								<ApprovalRelated
                                    :detailParamConf="detailParamConf"
									:recordApproval="recordApproval"
									@onSubmit="onSubmitApproval"
                                    @onRevokeIng="onRevokeIng"
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
            :layoutConfig="myLayoutConfig"
            :isUser="isUser"
        />
        <!-- 新建、编辑部门 -->
        <EditDepartment
            ref="EditDepartmentRef"
            @onRefresh="onConfirm"
            :nameFieldName="nameFieldName"
        />
        <DetailRevisionHistoryDialog ref="DetailRevisionHistoryRef"/>
	</el-drawer>
</template>

<script setup>
defineOptions({
    name: "default-detail",
});

import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import EditDepartment from '@/views/user/components/EditDepartment.vue'

import {
    ref,
    reactive,
    inject,
    nextTick,
    watch,
    watchEffect,
    onMounted,
    useSlots,
    getCurrentInstance,
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
import { 
    globalDsvDefaultData, 
    formatFormVirtualField, 
    formatQueryByIdParam,
    keyboardEventToInput,
} from "@/utils/util";
/**
 * 组件
 */
import mlApproveBar from "@/components/mlApproveBar/index.vue";
// 修改历史
import DetailRevisionHistoryDialog from './components/DetailRevisionHistoryDialog.vue';
// 附件
import Attachment from "./components/Attachment/Index.vue";
/**
 * API
 */
import { getRecordApprovalState } from '@/api/approval';
import { checkTables } from "@/api/layoutConfig";
import { storeToRefs } from "pinia";
// 自定义按钮过滤
import { checkCustomButtonFilters } from "@/api/layoutConfig";
// 自定义按钮
import useCustomButtonConfig from "@/hooks/useCustomButtonConfig";
import { useRouter } from "vue-router";
const router = useRouter();
const {
    // 当前按钮点击处理
    customButtonHandler,
    // 当前按钮后置事件
	customButtonAfterEventCb,
    // 获取自定义按钮
    getCustomAppButtons,
} = useCustomButtonConfig();



const { publicSetting } = storeToRefs(useCommonStore());
const $TOOL = inject("$TOOL");
const props = defineProps({
	layoutConfig: { type: Object, default: () => {} },
    // 详情配置
    detailConf: {
        type: Object,
        default: () => {}
    },
    // 详情记录表单id
    recordDetailFormId: {
		type: String,
		default: "",
	},
    // 编辑记录表单id
    recordEditFormId: {
		type: String,
		default: "",
	},
    // 自定义详情弹框标题
    customDetailDialogTitle: {
		type: String,
		default: "",
	},
    // 记录id集
    recordIds: {
		type: Array,
		default: () => [],
	},
    // 当前modelName
    modelName: {
		type: String,
		default: "",
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
    showDelBtn: true,
    showRevisionHistory: true,
    customDialogTitle: "",
    beforeSubmitApproval: () => true,
    afterSubmitApproval: () => true,
    beforeRevokeApproval: () => true,
    afterRevokeApproval: () => true,
})

// 插槽内容
let contentSlots = reactive({});
// 自定义弹框标题
let customDialogTitle = ref("");
watchEffect(() => {
    detailParamConf.value = Object.assign(detailParamConf.value, props.detailConf)
    // 自定义弹框标题
    customDialogTitle.value = props.customDetailDialogTitle;
})


let currentExposed = ref({});



onMounted(() => {
    // 取插槽内容
    contentSlots = useSlots();
    currentExposed.value = getCurrentInstance().exposed;
})

// 整体配置信息
let myLayoutConfig = ref({});
// 源实体配置
let sourceLayoutConfig = ref({});
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


const { queryEntityNameById, queryEntityCodeById, checkModifiableEntity, checkDetailEntityFlag, queryEntityLabelByName } = useCommonStore();
const emits = defineEmits(["onConfirm", "onEdit", "onLayoutFinish"]);
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
let cutTabIndex = ref(0);
let cutTabCom = ref("");
// 表单数据
let optionData = ref({});
let globalDsv = ref(globalDsvDefaultData());

// 指定表单ID
let formId = ref("");

let prevRecordId = ref(null);
let nextRecordId = ref(null);
// 详情加载版本号：用于丢弃过期的异步回调，避免偶现 Detached / 已卸载组件仍被写入
let detailLoadSeq = ref(0);
const bumpDetailLoadSeq = () => {
    detailLoadSeq.value += 1;
    return detailLoadSeq.value;
};

// 上一条
const onPrev = () => {
    if(loading.value) {
        return;
    }
    openDialog(prevRecordId.value, globalDsv.value, formId.value);
}
// 下一条
const onNext = () => {
    if(loading.value) {
        return;
    }
    openDialog(nextRecordId.value, globalDsv.value, formId.value);
}

const openDialog = (id, localDsv, paramFormId) => {
    const seq = bumpDetailLoadSeq();
    let { recordIds } = props;
    let curInx = recordIds.indexOf(id);
    prevRecordId.value = recordIds[curInx - 1] || null;
    nextRecordId.value = recordIds[curInx + 1] || null;
    detailId.value = id;
	entityCode.value = queryEntityCodeById(id);
	entityName.value = queryEntityNameById(id);
    formId.value = paramFormId;
	if (!entityName.value) {
		ElMessage.warning("当前实体未找到");
		return;
	}
    // 设置父级暴露
    globalDsv.value.parentExposed = currentExposed.value;
    if(localDsv){
        globalDsv.value = Object.assign(globalDsv.value, localDsv);
    }
	detailDialog.entityCode = entityCode.value;
	detailDialog.entityName = entityName.value;
	detailDialog.isShow = true;

	// 加载数据
	refresh(seq);
    nextTick(() => {
        // 丢弃过期回调（比如快速上一条/下一条/关闭）
        if (detailLoadSeq.value !== seq || !detailDialog.isShow) return;
        detailTabsRefs.value?.setTabsData({
            recordId: detailId.value,
        });
    });
}
// 关闭弹框前，清空数据
const beforeClose = (done) => {
    if(loading.value) {
        return;
    }
    haveLayoutJson.value = false;
    bumpDetailLoadSeq();
    keyboardEventToInput();
    done();
}
// 关闭弹框
const closeDialog = () => {
    if(loading.value) {
        return;
    }
    haveLayoutJson.value = false;
    keyboardEventToInput();
    detailDialog.isShow = false;
    bumpDetailLoadSeq();
}

const onRevokeIng = () => {
    loading.value = true;
}

// 页签更换
const tabChange = (tab) => {
	cutTab.value = tab.props.name.split("-")[0];
    cutTabCom.value = tab.props.name;
    cutTabIndex.value = tab.index;
	if (cutTab.value == "detail") {
		refresh();
	}
};

// 组件是否存在
const componentExists = (componentName) => {
    return Boolean(getCurrentInstance().appContext.components[componentName]);
}

// 刷新
const refresh = (seq) => {
	cutTab.value = "detail";
    cutTabIndex.value = 0;
	getLayoutList(seq);
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
			initData(detailLoadSeq.value);
		} else if(cutTab.value.includes('detail_custom_component_all') || cutTab.value.includes('detail_custom_component_pc')) {
            // 如果是自定义组件可添加对应的方法用于刷新
            customComponentRefs.value?.refresh();
        } else {
			detailTabComRefs.value.initData();
		}
	}
	loading.value = false;
};

// 提交审批触发
const onSubmitApproval = () => {
	onConfirm();
    detailParamConf.value.afterSubmitApproval();
};

// 检测页签过滤
let checkTabsFilter = ref({});
// 新建项过滤
let checkNewRelatedFilter= ref({});


// 自定义按钮
let customButtonList = ref([]);

// 自定义按钮点击
const customButtonClick = (item) => {
    if(item.key == 'edit'){
        onEditRow();
    }else if(item.key == 'history'){
        toRevisionHistory(detailId.value);
    }else {
        customButtonHandler(
            item,
            multipleSelection.value,
            currentExposed.value,
            detailId.value,
            loading,
            onAdd,
            onEditRow,
            onAdd,
            router,
        );
    }
}

// 加载页签
const getLayoutList = async (seq) => {
    // 如果未传 seq，则视为一次新的加载
    const curSeq = seq ?? bumpDetailLoadSeq();
	loading.value = true;
	let res = await $API.layoutConfig.getLayoutList(entityName.value, props.modelName, false);
    if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) {
        loading.value = false;
        return;
    }
	if (res) {
        sourceLayoutConfig.value = res.data;
        sourceLayoutConfig.value.entityCode = entityCode.value;
        sourceLayoutConfig.value.entityName = entityName.value;
        myLayoutConfig.value = {...sourceLayoutConfig.value};
        let { STYLE } = res.data;
        if (STYLE && STYLE.config) {
            styleConf.value = JSON.parse(STYLE.config);
            if (styleConf.value?.detailConf.autoFullScreen) {
                isFullScreen.value = true;
            }
            let { dialogConfig } = styleConf.value;
            if(dialogConfig){
                let recordData = {};
                let entity = {
                    name: entityName.value,
                    code: entityCode.value,
                    label: queryEntityLabelByName(entityName.value),
                }
                // 获取弹框配置
                let newDialogConfig = new Function('row', 'entity', dialogConfig)(recordData, entity);
                if(!newDialogConfig.editHeight && !newDialogConfig.editMaxHeight) {
                    newDialogConfig.editMaxHeight = '500px';
                }
                styleConf.value.newDialogConfig = newDialogConfig;
            }
        }
        // 如果有页签配置
        if(res.data.TAB?.config){
            // 取所有页签数据
            let tabConfig = JSON.parse(res.data.TAB.config);
            // 2025-06-03 新加的动态显示事件
            let sourceConfigColumn = [];
            if(tabConfig.showEventCode) {
                sourceConfigColumn = tabConfig.column;
            }else {
                sourceConfigColumn = tabConfig;
            }
            // 拿所有页签过滤参数
            let filterList = sourceConfigColumn.map(el => el.filter);
            if(filterList && filterList.length > 0){
                // 调用查询接口判断该页签是否显示
                let tabRes = await checkTables(filterList, detailId.value);
                if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) {
                    loading.value = false;
                    return;
                }
                if(tabRes){
                    checkTabsFilter.value = tabRes.data;
                }
            }
        }
        // 自定义按钮
        customButtonList.value = getCustomAppButtons(res.data.CUSTOM_BUTTON, 'pcDetail');
        // 先做权限和hide等所有显示逻辑过滤
        customButtonList.value.forEach(btn => {
            // 权限判断
            let checkCustomRole = btn.customCode ? $TOOL.checkRole(btn.customCode) : true;
            let customPermissionPass = btn.customCode
                ? (btn.reversalCustomCode ? !checkCustomRole : checkCustomRole)
                : true;
            // 权限或hide不通过直接隐藏
            if (!customPermissionPass || btn.hide) {
                btn.hidden = true;
                return;
            }
            // 非原生按钮直接显示
            if (!btn.isNative) {
                btn.hidden = false;
                return;
            }
            // 更多按钮不显示
            if (btn.key === 'more') {
                btn.hidden = true;
                return;
            }
            // 新建相关按钮不显示
            if (btn.key === 'newRelated') {
                btn.hidden = true;
                return;
            }
            // 编辑按钮且无编辑权限不显示
            if (btn.key === 'edit' && !$TOOL.checkRole('r' + entityCode.value + '-3')) {
                btn.hidden = true;
                return;
            }
        });
        // 只对"有权限且未被隐藏且有filterJson"的按钮调接口
        let filterBtns = customButtonList.value.filter(btn => !btn.hidden && btn.filterJson && JSON.stringify(btn.filterJson) !== '{}' && btn.action !== 1);
        if (filterBtns.length > 0) {
            let filterList = filterBtns.map(item => item.filterJson);
            let filterParam = {
                entityName: entityName.value,
                recordIdList: [detailId.value],
                filterList
            };
            let checkCustomButtonFiltersRes = await checkCustomButtonFilters(filterParam);
            if (checkCustomButtonFiltersRes && checkCustomButtonFiltersRes.code == 200) {
                let filterRes = checkCustomButtonFiltersRes.data[0];
                filterBtns.forEach((btn, idx) => {
                    const pass = filterRes[idx] == 1 || filterRes[idx] === true;
                    if (!pass) {
                        if (btn.errorShowType == 1) {
                            btn.disabled = true;
                            btn.hidden = false;
                        } else if (btn.errorShowType == 2) {
                            btn.hidden = true;
                            btn.disabled = false;
                        } else {
                            btn.hidden = false;
                            btn.disabled = false;
                        }
                    } else {
                        btn.hidden = false;
                        btn.disabled = false;
                    }
                });
            }
        }
        // 辅助函数：查找 key 的索引
        const findIndexByKey = (key) => customButtonList.value.findIndex(item => item.key === key && item.isNative);
        // 在 key='open' 前插入
        let newRelatedIndex = findIndexByKey('newRelated');
        if (newRelatedIndex !== -1) {
            customButtonList.value.splice(newRelatedIndex, 0, { type: 'slot', name: 'beforeNewRelatedBtn' });
        }
        // 在 key='edit' 前插入
        let editIndex = findIndexByKey('edit');
        if (editIndex !== -1) {
            customButtonList.value.splice(editIndex, 0, { type: 'slot', name: 'beforeEditBtn' });
        }
        // 在 key='history' 前插入
        let historyIndex = findIndexByKey('history');
        if (historyIndex !== -1) {
            customButtonList.value.splice(historyIndex, 0, { type: 'slot', name: 'beforeRevisionHistory' });
        }
        // 在 key='more' 前插入，并在后面插入
        let moreIndex = findIndexByKey('more');
        if (moreIndex !== -1) {
            customButtonList.value.splice(moreIndex, 0, { type: 'slot', name: 'beforeMoreBtn' });
            customButtonList.value.splice(moreIndex + 2, 0, { type: 'slot', name: 'afterMoreBtn' });
        }


        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        // 新建配置项
		formatNewRelated(res.data.ADD);
		idFieldName.value = res.data.idFieldName;
		nameFieldName.value = res.data.nameFieldName;
		initData(detailLoadSeq.value);
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

// 详情页签
let detailTabsRefs = ref();

// 初始化数据
const initData = async (seq) => {
    const curSeq = seq ?? detailLoadSeq.value;
	loading.value = true;
    haveLayoutJson.value = false;
    // 获取审批信息
    let recordApprovalRes = await getRecordApprovalState(detailId.value);
    if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) return;
    let taskQueryFormLayoutId = "";
    if(recordApprovalRes){
        recordApproval.value = recordApprovalRes.data;
        globalDsv.value.flowVariables = recordApprovalRes.data?.flowVariables;
        let taskChildNodes = recordApprovalRes.data?.taskChildNodes || [];
        if(taskChildNodes.length > 0) {
            let taskConfig = taskChildNodes[0];
            if(taskConfig.wfUseTask) {
                taskConfig = Object.assign(taskConfig, taskConfig.wfUseTask);
            }
            taskQueryFormLayoutId = taskConfig?.queryFormLayoutId || "";
        }
    }
	let res = await getFormLayout(entityName.value, taskQueryFormLayoutId || (formId.value == 'reference-default' ? '' : formId.value || props.recordDetailFormId));
    if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) {
        loading.value = false;
        return;
    }
	noeData.value = false;
	if (res) {
		if (res.data?.layoutJson) {
            globalDsv.value.useFormId = res.data.formLayoutId;
			haveLayoutJson.value = true;
			optionData.value = res.data.optionData || {};
            if(res.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
            }
            if(res.data.cascaderOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.cascaderOptionData);
            }
			// 根据数据渲染出页面填入的值，填过
			nextTick(async () => {
                if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) return;
				globalDsv.value.formStatus = 'read';
				globalDsv.value.formEntityId = detailId.value;
                globalDsv.value.openDetailDialog = openDialog;
                vFormRef.value?.setFormJson(res.data.layoutJson);
                let buildFormFieldSchema = formatQueryByIdParam(vFormRef.value?.buildFormFieldSchema());
				let queryByIdRes = await queryById(detailId.value, buildFormFieldSchema.fieldNames, { queryDetailList: buildFormFieldSchema.queryDetailList });
                if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) return;
				if (queryByIdRes && queryByIdRes.data) {
                    globalDsv.value.recordData = queryByIdRes.data;
		            multipleSelection.value = [queryByIdRes.data];
					detailName.value = queryByIdRes.data[nameFieldName.value];
                    rowResData.value = queryByIdRes.data || {};
                    approvalStatus.value = queryByIdRes.data.approvalStatus;
                    let { dialogConfig } = styleConf.value;
                    if(dialogConfig){
                        let recordData = queryByIdRes.data || null;
                        let entity = {
                            name: entityName.value,
                            code: entityCode.value,
                            label: queryEntityLabelByName(entityName.value),
                        }
                        // 获取弹框配置
                        let newDialogConfig = new Function('row', 'entity', dialogConfig)(recordData, entity);
                        if(!newDialogConfig.editHeight && !newDialogConfig.editMaxHeight) {
                            newDialogConfig.editMaxHeight = '500px';
                        }
                        styleConf.value.newDialogConfig = newDialogConfig;
                    }
					nextTick(() => {
                        if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) return;
						vFormRef.value?.setFormData(formatFormVirtualField(rowResData.value));
						nextTick(() => {
                            if (detailLoadSeq.value !== curSeq || !detailDialog.isShow) return;
							vFormRef.value?.reloadOptionData();
							vFormRef.value?.setReadMode();
							globalDsv.value.openCreateDialog = openCreateDialog;
						});
					});
					noeData.value = false;
				} else {
					noeData.value = true;
				}
				loading.value = false;
                emits('onLayoutFinish')
			});
		} else {
			loading.value = false;
            emits('onLayoutFinish')
		}
	} else {
		loading.value = false;
        emits('onLayoutFinish')
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
let EditDepartmentRef = ref();
let isUser = ref(false);
const onEditRow = (localDsv, formId) => {
    isUser.value = false;
    let tempV = {
        detailId: detailId.value,
        idFieldName: idFieldName.value
    };
    !!localDsv && (tempV.localDsv = localDsv)
    tempV.formId = formId || props.recordEditFormId
    myLayoutConfig.value = {...sourceLayoutConfig.value};
    let cutEditEntity = queryEntityNameById(detailId.value);
    // 如果是修改部门
    if(cutEditEntity == 'Department'){
        EditDepartmentRef.value?.openDialog(detailId.value);
    }else {
        if(cutEditEntity == 'User') {
            isUser.value = true;
            tempV.disableWidgets = ["loginName", "loginPwd"];
        }
        editEmits(tempV)
    }
};

// 新建
const onAdd = (e, outerLayoutConfig) => {
	let tempV = {};
	tempV.entityName = e.entityName;
	tempV.fieldName = e.fieldName;
	tempV.fieldNameVale = detailId.value;
	tempV.fieldNameLabel = detailName.value;
	tempV.sourceRecord = multipleSelection.value[0];
    if(e.formId) {
        tempV.formId = e.formId;
    }
    if(e.localDsv) {
        tempV.localDsv = e.localDsv;
    }
    if(outerLayoutConfig) {
        myLayoutConfig.value = {...outerLayoutConfig};
    }
    editRefs.value.openDialog(tempV);
};



const editEmits = (obj) => {
    let tempObj = JSON.parse(JSON.stringify(obj));
    if(!tempObj.formId) {
        tempObj.formId = formId.value || props.recordEditFormId;
    }
    editRefs.value.openDialog(tempObj);
}

// DSV新建
const openCreateDialog = (entityName, fieldName) => {
	onAdd({ entityName, fieldName });
};

const editColumnConfirm = (v) => {
	if (v && v.isDel) {
		closeDialog();
		emits("onConfirm");
	} else {

		onConfirm();
	}
};

// 编辑确认
const onConfirm = () => {
	if (cutTab.value == "detail") {
		getLayoutList();
	} else if(cutTab.value.includes('detail_custom_component_all') || cutTab.value.includes('detail_custom_component_pc')) {
        // 如果是自定义组件可添加对应的方法用于刷新
        customComponentRefs.value?.refresh();
    }
    else {
		detailTabComRefs.value.initData();
	}
    customButtonAfterEventCb()
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

let isFullScreen = ref(false);
// 全屏
const onFullScreen = () => {
	isFullScreen.value = !isFullScreen.value;
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
        MoreRefs.value[0]?.allocationFn(type);
    }else if(type == 'reportForms'){
        MoreRefs.value[0]?.openReportForms();
    }else if(type == 'printer'){
        MoreRefs.value[0]?.openPrinter();
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

// 修改历史
let DetailRevisionHistoryRef = ref();
const toRevisionHistory = (recordId) => {
    DetailRevisionHistoryRef.value?.openDialog(recordId);
}

// 刷新自定义组件
let customComponentRefs = ref();
const refreshCustomComponent = () => {
    customComponentRefs.value?.refresh();
}

// 获取表单实例
const getFormRef = () => {
    return vFormRef?.value
}

const getGlobalDsv = () => {
    return globalDsv.value
}

// 刷新列表
const refreshTableList = () => {
    emits('onConfirm');
}




// 暴露方法给父组件调用
defineExpose({
	openDialog,
    getCurEntity,
    getCurDetailInfo,
    toEdit,
    toMoreAction,
    toRevisionHistory,
    closeDialog,
    refreshCustomComponent,
    getFormRef,
    getGlobalDsv,
    refresh,
    refreshTableList,
});
</script>

<style lang="scss" scoped>
:deep(.el-form-item--default),
:deep(.el-form-item) {
	margin-bottom: 5px !important;
}

:deep(.render-form) {
    .el-row {
        padding: 0 8px 0 8px;
    }
}
.detail-header {
	// border-bottom: 2px solid #f1f2f3;
	// padding-bottom: 20px;
	// box-sizing: border-box;
	padding: 16px;
	height: 56px;
	//background: #f0f0f0;
	.fr-box {
		// height: 60px;
		.fr-icon {
			cursor: pointer;
            position: relative;
            top: 3px;
			&:hover {
				color: var(--el-color-primary-dark-2);
			}
		}
        :deep(.el-button) {
            &:not(.is-disabled):hover {
                background-color: var(--el-color-primary-dark-2);
            }
        }
	}

	.detail-header-title {
		font-size: 18px;
		padding-left: 5px;
		border-left: 5px solid;
		border-left-color: var(--el-color-primary-dark-2);
        color: #fff;
        height: 26px;
        .title-span {
            float: left;
            line-height: 26px;
            max-width: 600px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .enable-pagination-span {
            position: relative;
            margin-right: 10px;
        }
	}
}
.detail-main {
	// padding: 20px;
	font-size: 14px;
    box-sizing: border-box;
    padding: 0 20px;
	.detail-right {
		.group-el-button {
			:deep(.el-button) {
				margin-bottom: 5px;
				min-width: 110px !important;
			}
		}
        .block-el-button{
            :deep(.el-button) {
                margin-bottom: 5px;
                min-width: 110px !important;
            }
            :deep(.el-dropdown) {
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
.detail-container {
    max-height: calc(100vh - 130px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 10px;;
    box-sizing: border-box;
    padding-right: 5px;
}
.detail-main.left-tabs {
    .detail-left-box {
        display: flex;
        .detail-container {
            width: 100%;
            padding-top: 20px;
            padding-bottom: 20px;
        }
        :deep(.el-tabs) {
            height: calc(100vh - 90px);
            .el-tabs__nav-wrap {
                padding-right: 0;
            }
            .el-tabs__item {
                height: 36px;
                line-height: 36px;
            }
        }
        :deep(.setting-tabs) {
            left: -10px;
            width: 20px;
            z-index: 2;
        }
    }
    .detail-right {
        padding-top: 10px!important;
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
        :deep(.el-button) {
            margin-bottom: 5px;
            min-width: 110px !important;
        }
    }
}
</style>
