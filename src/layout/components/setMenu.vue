<template>
	<mlDialog title="设置导航菜单" v-model="isShow" width="780px">
		<div v-loading="loading">
			<el-form label-width="70px" label-position="left" @submit.prevent>
				<el-form-item label="导航名称">
					<el-input
						v-model="menuData.configName"
						placeholder="输入导航名称"
						clearable
					/>
				</el-form-item>
			</el-form>
			<div class="clearfix">
				<div class="sortable-box fl">
					<VueDraggableNext
						ghost-class="ghost"
						chosen-class="chosenClass"
						animation="300"
						:force-fallback="false"
						handle=".mover"
						:list="menuData.list"
						group="menuItems"
					>
						<MenuItem
							v-for="(parent, inx) in menuData.list"
							:key="parent.guid"
							:item="parent"
							:index="inx"
							:depth="0"
							:max-depth="8"
							:selected-guid="cutMenu?.guid || ''"
							:select-item="nodeClick"
							:add-child="(item) => addChildrenMenu(item)"
							:delete-item="deleteMenuByGuid"
						/>
					</VueDraggableNext>
				</div>
				<div class="fl right-div" v-if="!cutMenu">
					点击左侧导航项进行编辑
				</div>
				<div class="fl right-div" v-else>
					<el-tabs v-model="cutMenu.type" @tab-change="useComponentChange">
						<el-tab-pane label="关联项" :name="1"></el-tab-pane>
						<el-tab-pane 
                            label="仪表盘" 
                            :name="5"
                            :disabled="
                                cutMenu.children && cutMenu.children.length > 0
                            "
                        > </el-tab-pane>
						<el-tab-pane
							label="外部地址"
							:name="2"
							:disabled="
								cutMenu.children && cutMenu.children.length > 0
							"
						></el-tab-pane>
						<el-tab-pane
							label="自定义页面"
							:name="3"
							:disabled="
								cutMenu.children && cutMenu.children.length > 0
							"
						></el-tab-pane>
						<el-tab-pane
							label="自定义表单"
							:name="6"
							:disabled="
								cutMenu.children && cutMenu.children.length > 0
							"
						></el-tab-pane>
					</el-tabs>
					<div
						v-if="
							(cutMenu.type == 1 || cutMenu.type == 4) &&
							(!cutMenu.children ||
								(cutMenu.children &&
									cutMenu.children.length < 1)) &&
							cutMenu.entityCode != 'parentMenu'
						"
					>
						<el-select
							v-model="cutMenu.entityCode"
							filterable
							placeholder="选择关联项"
							class="w-100"
							@change="associationChange"
						>
							<el-option-group
								v-for="group in getGroupEntityList()"
								:key="group.label"
								:label="group.label"
							>
								<el-option
									v-for="(op, inx) of group.options"
									:key="inx"
									:value="op.entityCode"
									:label="op.label"
								/>
							</el-option-group>
						</el-select>
					</div>
					<div
						v-if="
							(cutMenu.type == 1 || cutMenu.type == 4) &&
							((cutMenu.children &&
								cutMenu.children.length > 0) ||
								cutMenu.entityCode == 'parentMenu')
						"
					>
						<el-select
							v-model="parentMenu"
							filterable
							class="w-100"
							disabled
						></el-select>
					</div>
					<div v-if="cutMenu.type == 3">
                        <el-radio-group v-model="cutMenu.customPageType" class="mb-10">
                            <el-radio :value="1">自定义页面</el-radio>
                            <el-radio :value="2">路由</el-radio>
                        </el-radio-group>
						<el-input
							v-model="cutMenu.outLink"
							:placeholder="cutMenu.customPageType == 1 ? '输入自定义页面名称，例：page' : '输入路由地址，例：DemoContact/list'"
							clearable
						></el-input>
					</div>
					<div v-if="cutMenu.type == 2">
						<el-input
							v-model="cutMenu.outLink"
							placeholder="输入外部地址，例：https://www.baidu.com/"
							clearable
						></el-input>
					</div>
					<div v-if="cutMenu.type == 5">
						<el-select
							v-model="cutMenu.chartId"
							filterable
							placeholder="选择仪表盘"
							class="w-100"
						>
							<el-option
								v-for="(op, inx) of chartList"
								:key="inx"
								:value="op.chartId"
								:label="op.chartName"
							/>
						</el-select>
					</div>
					<div v-if="cutMenu.type == 6">
						<el-select
							v-model="cutMenu.formEntityCode"
							filterable
							placeholder="选择实体"
							class="w-100"
							@change="formEntityCodeChange"
						>
							<el-option-group
								v-for="group in getGroupEntityList(6)"
								:key="group.label"
								:label="group.label"
							>
								<el-option
									v-for="(op, inx) of group.options"
									:key="inx"
									:value="op.entityCode"
									:label="op.label"
								/>
							</el-option-group>
						</el-select>
						<div class="mt-10" v-loading="formLoading">
							<el-select
								v-model="cutMenu.formId"
								filterable
								placeholder="选择表单"
								class="w-100"
							>
								<el-option
									v-for="(op, inx) of formList"
									:key="inx"
									:value="op.formLayoutId"
									:label="op.layoutName"
								/>
							</el-select>
						</div>
					</div>
					<div
						v-if="
							cutMenu.type == 3 ||
							cutMenu.type == 2 ||
							cutMenu.type == 5 ||
							cutMenu.type == 6
						"
						class="mt-10"
					>
                        <el-row :gutter="10">
                            <el-col :span="21">
                                <el-select
                                    v-model="cutMenu.customCode"
                                    placeholder="权限Code"
                                    clearable
                                    filterable
                                    allow-create
                                >
                                    <el-option
                                        v-for="item in customRightList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-col>
                            <el-col :span="3">
                                <el-tooltip content="取反后，用户不包含选定条件菜单才会显示。" placement="top">
                                    <el-checkbox v-model="cutMenu.reversalCustomCode" label="取反" />
                                </el-tooltip>
                            </el-col>
                        </el-row>
					</div>
					<div class="mt-10">
						<el-input
							v-model="cutMenu.name"
							placeholder="菜单名称"
							class="ml-el-select-input"
							clearable
						>
							<template #prepend>
								<span
									class="select-icon-span"
									title="选择图标"
									@click="openSelectIconDialog"
								>
									<el-icon
										class="icon"
										v-if="!cutMenu.useIcon"
									>
										<SetUp />
									</el-icon>
									<el-icon
										class="icon"
										v-else
										:color="cutMenu.iconColor"
									>
										<component :is="cutMenu.useIcon" />
									</el-icon>
								</span>
							</template>
						</el-input>
					</div>
					<div class="mt-10" v-if="cutMenu.type == 2">
						<el-radio-group v-model="cutMenu.openType">
							<el-radio :value="0">新窗口打开</el-radio>
							<el-radio :value="1">嵌入式</el-radio>
						</el-radio-group>
                        <div>
                            <el-checkbox 
                                v-model="cutMenu.redirectCarrySessionId"
                                label="添加sessionId重定向"
                            />
                        </div>
					</div>
                    <div
						class="mt-10"
						v-if="
							cutMenu.type == 1 &&
							(!cutMenu.children || cutMenu.children.length < 1) &&
                            !filterUseCustomEntity.includes(cutMenu.entityName)
						"
					>
                        叠加自定义权限控制
					</div>
                    <div
                        v-if="
                            cutMenu.type == 1 && 
                            !filterUseCustomEntity.includes(cutMenu.entityName)"
						class="mt-10"
					>
                        <el-row :gutter="10">
                            <el-col :span="21">
                                <el-select
                                    v-model="cutMenu.customCode"
                                    placeholder="权限Code"
                                    clearable
                                    filterable
                                    allow-create
                                >
                                    <el-option
                                        v-for="item in customRightList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-col>
                            <el-col :span="3">
                                <el-tooltip content="取反后，用户不包含选定条件菜单才会显示。" placement="top">
                                    <el-checkbox v-model="cutMenu.reversalCustomCode" label="取反" />
                                </el-tooltip>
                            </el-col>
                        </el-row>
					</div>
                    <div
						class="mt-5"
						v-if="
							cutMenu.type == 1 &&
							(!cutMenu.children || cutMenu.children.length < 1) &&
                            !filterUseCustomEntity.includes(cutMenu.entityName)
						"
					>
						<el-checkbox
							v-model="cutMenu.useCustom"
							label="是否使用自定义列表模板"
						/>
					</div>
					<div
						class="mt-5"
						v-if="
                            cutMenu.type == 1 && 
                            cutMenu.useCustom &&
                            !filterUseCustomEntity.includes(cutMenu.entityName)"
					>
						<el-select
							v-model="cutMenu.useComponent"
							placeholder="选择自定义列表模板"
							style="width: 100%"
                            @change="useComponentChange"
						>
							<el-option
								v-for="item in customListEntry"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
                        <div class="mt-10 mb-5">
                            布局编码 
                            <el-tooltip placement="top">
                                <template #content>
                                    <div style="width: 300px;">
                                        同一个实体在菜单中使用不同布局编码，可以设置不同的布局设置（列显示，自定义按钮，自定义设置等）。
                                    </div>
                                </template>
                                <el-icon class="icon-top-2">
                                    <InfoFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                        <el-input v-model="cutMenu.modelName" placeholder="请输入布局编码" clearable/>
					</div>
                    
                    <div class="mt-5">
                        <el-checkbox
							v-model="cutMenu.pcShow"
							label="是否在PC端显示"
						/>
                        <el-checkbox
                            class="ml-5"
							v-model="cutMenu.mobileShow"
                            :disabled="disabledMobileShow"
							label="是否在移动端显示"
						/>
                    </div>
					<div
						class="mt-5"
						v-if="cutMenu.children && cutMenu.children.length > 0"
					>
						<el-checkbox
							v-model="cutMenu.isOpeneds"
							label="默认展开"
						/>
					</div>
					<div class="mt-10">
						<el-button type="primary" plain :icon="Select" @click="confirmMenu">确定</el-button>
					</div>
				</div>
			</div>
			<div>
				<el-button @click="addMenu">
					<el-icon> <ElIconPlus /> </el-icon>添加菜单项
				</el-button>
			</div>
		</div>
		<template #footer>
			<div class="footer-div">
				<div class="share-to fl">
					<mlShareTo v-model="menuData.shareTo" />
				</div>
				<el-button @click="isShow = false" :loading="loading">
					取消
				</el-button>
				<el-button
					type="primary"
					@click="layoutSave"
					:loading="loading"
					:icon="Finished"
				>
					保存
				</el-button>
			</div>
		</template>
	</mlDialog>
	<mlSelectIcon
		v-model="isShowIconDialog"
		:useIcon="cutMenuIcon"
		@confirmIcon="selectIcon"
	/>
</template>

<script setup>
import { watch, ref, onMounted, reactive, inject } from "vue";
import useCommonStore from "@/store/modules/common";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import mlShareTo from "@/components/mlShareTo/index.vue";
import { getDataList } from "@/api/crud";
import { customListEntry } from "@/views/custom-page/customListEntry";
import { getFormLayoutList, getSystemConstants } from "@/api/system-manager";
import { VueDraggableNext } from "vue-draggable-next";
import { Select, Finished } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { t } from "@/locales";
import { useMenuOperations } from '@/composables/useMenuOperations';
import MenuItem from './MenuItem.vue';

// 注入缺失的工具
const $API = inject("$API");
const $TOOL = inject("$TOOL");

// 恢复 props 和 emits 定义
const props = defineProps({
  modelValue: null,
  menuInfo: { type: Object, default: () => ({}) },
  isAppManagement: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "saveSuccess"]);

// 恢复 store 引用
const { unSystemEntityList } = storeToRefs(useCommonStore());
const { queryEntityNameByCode } = useCommonStore();
const { getNavigationApi } = useLayoutConfigStore();
const { chosenNavigationId } = storeToRefs(useLayoutConfigStore());
const router = useRouter();

// 弹框是否显示
let isShow = ref(false);
let loading = ref(false);
// 菜单数据
let menuData = reactive({
	layoutConfigId: "",
	// 导航名字
	configName: "",
	// 导航数据
	list: [],
	// 要分享给谁
	shareTo: "ALL",
});

watch(
	() => isShow.value,
	(v) => {
		emit("update:modelValue", v);
	},
	{ deep: true }
);

onMounted(() => {
	isShow.value = props.modelValue;
	document.body.ondrop = function (event) {
		event.preventDefault();
		event.stopPropagation();
	};
	getMenuFn();
});

let parentMenu = ref("父级菜单");

// 格式化实体
const getEntityList = () => {
	return props.isAppManagement ? unSystemEntityList.value.filter(el => el.appAbbr == router.currentRoute.value.query.appAbbr) : unSystemEntityList.value.filter(el => !el.appAbbr);
};

// 自定列表模板过滤实体，这些实体不需要展示自定义列表模板
const filterUseCustomEntity = [
    "Department",
    "Role",
    "Team",
    "parentMenu",
    "approvalHandle",
    "approvalSubmit",
    "capprovalCc",
    "approvalApproved",
];

// 实体分组
const getGroupEntityList = (target) => {
	let systemOptions = [
		{
			label: "部门用户",
			entityCode: 22,
			name: "Department",
		},
		{
			label: "权限角色",
			entityCode: 23,
			name: "Role",
		},
		{
			label: "团队",
			entityCode: 24,
			name: "Team",
		},
        {
            label: "父级菜单",
            entityCode: "parentMenu",
            name: "parentMenu",
        },
		// {
		//     label: "跟进",
		//     entityCode: 54,
		//     name: "FollowUp",
		// },
		// {
		//     label: "待办",
		//     entityCode: 55,
		//     name: "TodoTask",
		// },
	];
	// 如果不是父级菜单
	// if (!cutMenu.value.parentGuid) {
	// 	systemOptions = [
	// 		...systemOptions,

	// 	];
	// }
	let newEntityList = [
		{
			label: "自定义实体",
			options: [...getEntityList()],
		},
		{
			label: "系统内置",
			options: [...systemOptions],
		},
	];
	if (target != 6) {
		newEntityList.push({
			label: "审批流程",
			options: [
				{
					label: "待我处理",
					name: "approvalHandle",
					entityCode: "approvalHandle",
				},
				{
					label: "我提交的",
					name: "approvalSubmit",
					entityCode: "approvalSubmit",
				},
				{
					label: "抄送我的",
					name: "capprovalCc",
					entityCode: "capprovalCc",
				},
                {
                    label: "审批过的",
                    name: "approvalApproved",
                    entityCode: "approvalApproved",
                },
			],
		});
	}
	return newEntityList;
};

// 节点选中
const nodeClick = (node) => {
	cutMenu.value = Object.assign({}, node);
	cutMenu.value.useIcon = cutMenu.value.useIcon || "";
	if (cutMenu.value.type == 4) {
		cutMenu.value.type = 1;
	}
    if(cutMenu.value.pcShow == undefined){
        cutMenu.value.pcShow = true;
    }
    if(cutMenu.value.mobileShow == undefined){
        cutMenu.value.mobileShow = true;
    }
    useComponentChange();
    
    if(cutMenu.value.type == 6) {
        formEntityCodeChange(cutMenu.value.formEntityCode,'init');
    }
    if(!cutMenu.value.customPageType) {
        cutMenu.value.customPageType = 1;
    }
};

let isShowIconDialog = ref(false);
// 当前菜单ICON
let cutMenuIcon = ref({});
// 选择图标
const selectIcon = ({ name, color }) => {
	cutMenu.value.useIcon = name;
	cutMenu.value.iconColor = color;
	isShowIconDialog.value = false;
};
// 打开选择图标弹框
const openSelectIconDialog = () => {
	isShowIconDialog.value = true;
	cutMenuIcon.value = {
		name: cutMenu.value.useIcon,
		color: cutMenu.value.iconColor || "",
	};
};

/**
 * ********************************************** 添加、编辑 菜单项相关  beg
 */

// 当前要操作的对象
let cutMenu = ref(null);

// 关联项切换
// 移除原 associationChange 定义，因为现在从 composable 中导入
// const associationChange = (entityCode, target, isInit) => { ... };

// 表单组件
let formList = ref([]);
let formLoading = ref(false);

// 自定义表单实体切换
const formEntityCodeChange = async (entityCode, target) => {
	associationChange(entityCode, 6, target);
    // 不是初始化清空表单ID
    if(target != 'init') {
        cutMenu.value.formId = "";
    }
	formLoading.value = true;
	let res = await getFormLayoutList(queryEntityNameByCode(entityCode));
	if (res) {
		formList.value = res.data;
	}
	formLoading.value = false;
};

// 系统内置
const systemEntityName = ref([
	"Department",
	"Role",
	"Team",
	"approvalHandle",
	"approvalSubmit",
	"capprovalCc",
    "approvalApproved",
]);
const systemEntityPath = reactive({
	Department: "entity-user",
	Role: "entity-role",
	Team: "entity-team",
	approvalHandle: "approval-handle",
	approvalSubmit: "approval-submit",
	capprovalCc: "approval-cc",
    approvalApproved: "approval-approved"
});

// 使用 composable，同步参数（基于用户变化，移除重复函数）
const { 
    addMenu, 
    associationChange, 
    confirmMenu, 
    formatMenuList,
    getGuid,
    defaultMenu
} = useMenuOperations(
    menuData, 
    cutMenu, 
    getGroupEntityList, 
    systemEntityName, 
    systemEntityPath, 
    filterUseCustomEntity, 
    ElMessage
);

// 源数据
let sourceData = reactive({});

// 自定义权限
let customRightList = ref([]);
// 获取数据
const getMenuFn = () => {
	menuData = Object.assign(menuData, props.menuInfo);
	sourceData = Object.assign({}, props.menuInfo);
	menuData.list = menuData.config ? JSON.parse(menuData.config) : [];
	// // 获取仪表盘数据
	// getChartList();
    // // 获取自定义权限
    // getCustomRightList();
    loading.value = true;
    Promise.all([getCustomRightList(), getChartList()]).then(() => {
        loading.value = false;
    })
};

const getCustomRightList = async () => {
    let res = await getSystemConstants('customRight');
    if(res && res.data) {
        customRightList.value = res.data;
    }
}

let chartList = ref([]);
// 获取仪表盘数据
let getChartList = async () => {
	
	let filter = {
		equation: "AND",
		items: [{ fieldName: "chartData", op: "NT", value: "" }],
	};
	let res = await getDataList("Chart", "chartName,defaultChart", filter);
	if (res && res.data) {
		chartList.value = res.data.dataList || [];
	}
	// loading.value = false;
};

// 导航保存
const layoutSave = async () => {
	let { layoutConfigId, configName } = menuData;
	if (!configName) {
		ElMessage.warning("请输入菜单名称");
		return;
	}
	let newMenuList = [...formatMenuList()];
	if (newMenuList.length < 1) {
		ElMessage.warning("请至少添加一个菜单项");
		return;
	}
    // return
	menuData.config = JSON.stringify(newMenuList);
	let param = {};
	// 检测数据有没变化
	if ($TOOL.checkIsEdit(sourceData.configName, menuData.configName)) {
		param.configName = menuData.configName;
	}
	// 检测数据有没变化
	if ($TOOL.checkIsEdit(sourceData.config, menuData.config)) {
		param.config = menuData.config;
	}
	if ($TOOL.checkIsEdit(sourceData.shareTo, menuData.shareTo)) {
		param.shareTo = menuData.shareTo;
	}
	if (JSON.stringify(param) == "{}") {
		ElMessage.success("保存成功");
		loading.value = false;
		isShow.value = false;
		return;
	}
    if(props.isAppManagement) {
        param.appAbbr = router.currentRoute.value.query.appAbbr;
    }
	loading.value = true;
	let res = await $API.layoutConfig.saveConfig(layoutConfigId, "NAV", param);
	if (res) {
        if(props.isAppManagement) {
            loading.value = false;
            isShow.value = false;
            ElMessage.success("保存成功");
            emit("saveSuccess");
            return;
        }
		router.go(0);
	}
	loading.value = false;
};

// 禁止在移动端显示
let disabledMobileShow = ref(false);
// 自定义列表模板切换
const useComponentChange = () => {
    disabledMobileShow.value = false;
    let useComponent = customListEntry.find(el => el.value == cutMenu.value.useComponent);
    if(cutMenu.value.type == 1 && useComponent && useComponent.isMobileSupported != undefined && !useComponent.isMobileSupported) {
        disabledMobileShow.value = true;
        cutMenu.value.mobileShow = false;
    }
}

// 更新添加子菜单逻辑，添加深度限制检查
const addChildrenMenu = (menu) => {
  // 计算当前菜单的深度
  const currentDepth = calculateMenuDepth(menu);
  const maxDepth = 8;
  
  if (currentDepth >= maxDepth) {
    ElMessage.warning(`最多支持${maxDepth}级菜单`);
    return;
  }
  
  if (!menu.children) menu.children = [];
  const newChild = { ...defaultMenu, guid: getGuid(), parentGuid: menu.guid };
  menu.children.push(newChild);
  cutMenu.value = newChild;
};

// 辅助函数：计算菜单项的深度
const calculateMenuDepth = (targetMenu, currentItems = menuData.list, depth = 0) => {
  for (let item of currentItems) {
    if (item.guid === targetMenu.guid) {
      return depth;
    }
    if (item.children) {
      const childDepth = calculateMenuDepth(targetMenu, item.children, depth + 1);
      if (childDepth !== -1) {
        return childDepth;
      }
    }
  }
  return -1;
};

// 更新删除逻辑（递归查找并删除）
const delMenu = (menuToDelete, parentInx, childInx) => {
  ElMessageBox.confirm('是否确认删除？', '提示').then(() => {
    if (!menuToDelete.parentGuid) {
      menuData.list.splice(parentInx, 1);
    } else {
      const parent = findParent(menuData.list, menuToDelete.parentGuid);
      if (parent) parent.children.splice(childInx, 1);
    }
    if (cutMenu.value?.guid === menuToDelete.guid) cutMenu.value = null;
  }).catch(() => {});
};

// 辅助函数：递归查找父级
const findParent = (items, guid) => {
  for (let item of items) {
    if (item.guid === guid) return item;
    if (item.children) {
      const found = findParent(item.children, guid);
      if (found) return found;
    }
  }
  return null;
};

// 基于 GUID 删除菜单项
const deleteMenuByGuid = (menuToDelete) => {
  ElMessageBox.confirm('是否确认删除？', '提示').then(() => {
    const removeFromArray = (items, targetGuid) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].guid === targetGuid) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children && removeFromArray(items[i].children, targetGuid)) {
          return true;
        }
      }
      return false;
    };
    
    removeFromArray(menuData.list, menuToDelete.guid);
    
    if (cutMenu.value?.guid === menuToDelete.guid) {
      cutMenu.value = null;
    }
  }).catch(() => {});
};

// 需要生成GUID的函数
// const getGuid = () => {
//   return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
//     var r = (Math.random() * 16) | 0,
//       v = c == "x" ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// };

// defaultMenu 定义
// const defaultMenu = reactive({
//   name: "未命名",
//   type: 1,
//   entityCode: null,
//   outLink: "",
//   openType: 0,
//   guid: "",
//   parentGuid: "",
//   isOpeneds: false,
//   useIcon: "",
//   iconColor: "",
//   chartId: "",
//   useCustom: false,
//   useComponent: "",
//   formEntityCode: "",
//   formId: "",
//   pcShow: true,
//   mobileShow: true,
//   redirectCarrySessionId: false,
//   customPageType: 1,
// });
</script>

<style lang="scss" scoped>
div {
	box-sizing: border-box;
}
.sortable-box {
	height: 388px;
	border: 1px solid #eee;
	padding: 2px;
	z-index: 1;
	margin-bottom: 12px;
	overflow-x: auto;
	width: 268px;
	&::-webkit-scrollbar {
		display: none;
	}
	&:hover {
		&::-webkit-scrollbar {
			display: block;
		}
	}
}

.right-div {
	width: calc(100% - 288px);
	margin-left: 20px;
}

.parent-li {
	// height: 888px;
	font-size: 13px;
	color: #303030;
	text-decoration: none;
	background: none repeat scroll 0 0 #fff;

	.paren-div {
		height: 36px;
		margin-bottom: 3px;
		position: relative;
		&:hover {
			.action-icon {
				display: block;
			}
		}
		&.is-active {
			background: #dedede;
		}
	}
}

.child-div {
	// padding-left: 16px;
	width: calc(100% - 16px);
	margin-left: 16px;
	height: 36px;
	font-size: 13px;
	color: #303030;
	text-decoration: none;
	background: none repeat scroll 0 0 #fff;
	// background: red;
	margin-bottom: 3px;
	position: relative;
	&.is-active {
		background: #dedede;
	}
	&:hover {
		.action-icon {
			display: block;
		}
	}
}

.action-icon {
	position: absolute;
	right: 10px;
	top: 10px;
	display: none;
	.icon-span {
		cursor: pointer;
		display: inline-block;
		color: #a1a1a1;
		&.add-icon {
			transform: rotate(45deg);
			position: relative;
			top: -1px;
		}
		&:hover {
			color: #666;
		}
		&.is-disabled {
			color: #aeb1b7;
		}
	}
}

.mover,
.submover {
	width: 32px;
	height: 36px;
	line-height: 36px;
	background: var(--el-color-primary);
	text-align: center;
	color: #fff;
	.icon {
		float: left;
		margin-left: 6px;
		margin-top: 8px;
	}
	&:hover {
		cursor: move;
		background: var(--el-color-primary-light-3);
	}
}
.item {
	height: 36px;
	line-height: 36px;
	border: 1px solid #dedede;
	border-left: 0;
	width: calc(100% - 32px);
	box-sizing: border-box;
	padding: 0 10px;
	.icon {
		position: relative;
		top: 2px;
	}
}

.ghost {
	background: #fff !important;
	border: 1px dashed #999;
	.mover,
	.item {
		opacity: 0;
	}
}
.chosenClass {
	background: #fff;
	// background-color: #f1f1f1;
}

.subghost {
	border: 1px dashed #999;
	background: #fff !important;
	.submover,
	.item {
		opacity: 0;
	}
}
.share-to {
	font-size: 13px;
	padding-left: 20px;
	text-align: left;
}

.select-icon-span {
	// padding: 0 10px;
	// background: #fff;
	border-radius: 4px 0 0 4px;
	cursor: pointer;
	position: relative;
	width: 30px;
	height: 32px;
	.icon {
		font-size: 18px;
		position: absolute;
		left: 6px;
		top: 7px;
		// color: #404040;
	}
	&:hover {
		background: #eeeeee;
	}
}
</style>
