<template>
    <mlDialog title="设置导航菜单" v-model="isShow" width="680px">
        <div v-loading="loading">
            <el-form label-width="70px" label-position="left" @submit.prevent>
                <el-form-item label="导航名称">
                    <el-input v-model="menuData.configName" placeholder="输入导航名称" clearable />
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
                    >
                        <div class="parent-li" v-for="(parent,inx) of menuData.list" :key="inx">
                            <div
                                class="paren-idv"
                                @click="nodeClick(parent)"
                                :class="{'is-active':cutMenu?.guid == parent.guid}"
                            >
                                <div class="mover fl">
                                    <el-icon size="20" class="icon">
                                        <ElIconRank />
                                    </el-icon>
                                </div>
                                <div class="fl item text-ellipsis">
                                    <el-icon class="icon" v-if="!parent.useIcon">
                                        <SetUp />
                                    </el-icon>
                                    <el-icon class="icon" v-else :color="parent.iconColor">
                                        <component :is="parent.useIcon" />
                                    </el-icon>
                                    {{ parent.name }}
                                </div>
                                <div class="action-icon">
                                    <span
                                        class="icon-span add-icon mr-5 is-disabled"
                                        v-if="parent.type != 1"
                                        title="非关联项不可添加子菜单"
                                    >
                                        <el-icon size="16">
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                    <span
                                        class="icon-span add-icon mr-5"
                                        v-else
                                        @click.stop="addChildrenMenu(parent)"
                                    >
                                        <el-icon size="16">
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                    <span class="icon-span" @click.stop="delMenu(parent,inx)">
                                        <el-icon size="16">
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>

                            <VueDraggableNext
                                ghost-class="subghost"
                                chosen-class="subchosenClass"
                                animation="300"
                                :force-fallback="false"
                                handle=".submover"
                                :list="parent.children"
                            >
                                <div
                                    class="child-div"
                                    v-for="(child,subInx) of parent.children"
                                    :key="subInx"
                                    @click="nodeClick(child)"
                                    :class="{'is-active':cutMenu?.guid == child.guid}"
                                >
                                    <div class="submover fl">
                                        <el-icon size="20" class="icon">
                                            <ElIconRank />
                                        </el-icon>
                                    </div>
                                    <div class="fl item text-ellipsis">
                                        <el-icon class="icon" v-if="!child.useIcon">
                                            <SetUp />
                                        </el-icon>
                                        <el-icon class="icon" v-else>
                                            <component :is="child.useIcon" />
                                        </el-icon>
                                        {{ child.name }}
                                    </div>
                                    <div class="action-icon">
                                        <span
                                            class="icon-span"
                                            @click.stop="delMenu(child,inx,subInx)"
                                        >
                                            <el-icon size="16">
                                                <ElIconCloseBold />
                                            </el-icon>
                                        </span>
                                    </div>
                                </div>
                            </VueDraggableNext>
                        </div>
                    </VueDraggableNext>
                </div>
                <div class="fl right-div" v-if="!cutMenu">点击左侧导航项进行编辑</div>
                <div class="fl right-div" v-else>
                    <el-tabs v-model="cutMenu.type">
                        <el-tab-pane label="关联项" :name="1"></el-tab-pane>
                        <el-tab-pane label="外部地址" :name="2" :disabled="cutMenu.children && cutMenu.children.length > 0"></el-tab-pane>
                        <el-tab-pane label="自定义页面" :name="3" :disabled="cutMenu.children && cutMenu.children.length > 0"></el-tab-pane>
                    </el-tabs>
                    <div
                        v-if="(cutMenu.type == 1 || cutMenu.type == 4) && (!cutMenu.children || (cutMenu.children && cutMenu.children.length < 1)) && cutMenu.entityCode != 'parentMenu'"
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
                                    v-for="(op,inx) of group.options"
                                    :key="inx"
                                    :value="op.entityCode"
                                    :label="op.label"
                                />
                            </el-option-group>
                        </el-select>
                    </div>
                    <div
                        v-if="(cutMenu.type == 1 || cutMenu.type == 4) && ((cutMenu.children && cutMenu.children.length > 0) || cutMenu.entityCode == 'parentMenu')"
                    >
                        <el-select v-model="parentMenu" filterable class="w-100" disabled></el-select>
                    </div>
                    <div v-if="cutMenu.type == 3">
                        <el-input
                            v-model="cutMenu.outLink"
                            placeholder="输入自定义页面名称，例：page"
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
                                    <el-icon class="icon" v-if="!cutMenu.useIcon">
                                        <SetUp />
                                    </el-icon>
                                    <el-icon class="icon" v-else :color="cutMenu.iconColor">
                                        <component :is="cutMenu.useIcon" />
                                    </el-icon>
                                </span>
                            </template>
                        </el-input>
                    </div>
                    <div class="mt-5" v-if="cutMenu.children && cutMenu.children.length > 0">
                        <el-checkbox v-model="cutMenu.isOpeneds" label="默认展开" />
                    </div>
                    <div class="mt-10">
                        <el-button @click="confirmMenu">确定</el-button>
                    </div>
                </div>
            </div>
            <div>
                <el-button @click="addMenu">
                    <el-icon>
                        <ElIconPlus />
                    </el-icon>添加菜单项
                </el-button>
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <div class="share-to fl">
                    <mlShareTo v-model="menuData.shareTo" />
                </div>
                <el-button @click="isShow = false" :loading="loading">取消</el-button>
                <el-button type="primary" @click="layoutSave" :loading="loading">保存</el-button>
            </div>
        </template>
    </mlDialog>
    <mlSelectIcon v-model="isShowIconDialog" :useIcon="cutMenuIcon" @confirmIcon="selectIcon" />
</template>

<script setup>
import { watch, ref, onMounted, inject, reactive } from "vue";
import useCommonStore from "@/store/modules/common";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import mlShareTo from "@/components/mlShareTo/index.vue";
const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const { unSystemEntityList } = storeToRefs(useCommonStore());
const { getNavigationApi } = useLayoutConfigStore();
const { chosenNavigationId } = storeToRefs(useLayoutConfigStore());
const props = defineProps({
    modelValue: null,
    // 菜单信息
    menuInfo: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);

import { VueDraggableNext } from "vue-draggable-next";

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
    return unSystemEntityList.value.filter((el) => !el.detailEntityFlag);
};

// 实体分组
const getGroupEntityList = () => {
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
    if (!cutMenu.value.parentGuid) {
        systemOptions = [
            ...systemOptions,
            {
                label: "父级菜单",
                entityCode: "parentMenu",
                name: "parentMenu",
            },
        ];
    }
    let newEntityList = [
        {
            label: "自定义实体",
            options: [...getEntityList()],
        },
        {
            label: "系统内置",
            options: [...systemOptions],
        },
        {
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
            ],
        },
    ];
    return newEntityList;
};

// 节点选中
const nodeClick = (node) => {
    cutMenu.value = Object.assign({}, node);
    cutMenu.value.useIcon = cutMenu.value.useIcon || "";
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

let defaultMenu = reactive({
    // 菜单名称
    name: "未命名",
    // 1 关联性  2 外部地址
    type: 1,
    // 关联项
    entityCode: null,
    // 外部地址
    outLink: "",
    // key
    guid: "",
    // 父节点
    parentGuid: "",
    // 是否默认展开
    isOpeneds: false,
    // 使用图标
    useIcon: "",
    // 图标颜色
    iconColor: "",
});

const getGuid = () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
// 当前要操作的对象
let cutMenu = ref(null);

// 关联项切换
const associationChange = (entityCode) => {
    let linkEntity;
    for (let index = 0; index < getGroupEntityList().length; index++) {
        const element = getGroupEntityList()[index];
        for (let j = 0; j < element.options.length; j++) {
            const subEl = element.options[j];
            if (subEl.entityCode == entityCode) {
                linkEntity = subEl;
                continue;
            }
        }
    }
    cutMenu.value.name = linkEntity.label;
    cutMenu.value.entityCode = linkEntity.entityCode;
    cutMenu.value.entityName = linkEntity.name;
};

// 添加父菜单
const addMenu = () => {
    defaultMenu.guid = getGuid();
    menuData.list.push(Object.assign({}, defaultMenu));
    cutMenu.value = Object.assign({}, defaultMenu);
};
// 添加子菜单
const addChildrenMenu = (menu) => {
    if (!menu.children) {
        menu.children = [];
    }
    if(!menu.guid){
        menu.guid = getGuid();
    }
    let setMenu = Object.assign({}, defaultMenu);
    setMenu.parentGuid = menu.guid;
    setMenu.guid = getGuid();
    menu.children.push(setMenu);
    cutMenu.value = Object.assign({}, setMenu);
};

// 系统内置
const systemEntityName = ref([
    "Department",
    "Role",
    "Team",
    "approvalHandle",
    "approvalSubmit",
    "capprovalCc",
]);
const systemEntityPath = reactive({
    Department: "entity-user",
    Role: "entity-role",
    Team: "entity-team",
    approvalHandle: "approval-handle",
    approvalSubmit: "approval-submit",
    capprovalCc: "approval-cc",
});

// 确认菜单
const confirmMenu = () => {
    if (
        cutMenu.value.type == 1 &&
        !cutMenu.value.entityCode &&
        (!cutMenu.value.children || cutMenu.value.children.length < 1)
    ) {
        $ElMessage.warning("请选择关联项");
        return;
    }
    if (cutMenu.value.type == 2 && !cutMenu.value.outLink) {
        $ElMessage.warning("请输入外部地址");
        return;
    }
    if (cutMenu.value.type == 3 && !cutMenu.value.outLink) {
        $ElMessage.warning("请输入自定义页面名称");
        return;
    }
    // 如果是系统内置
    if (systemEntityName.value.includes(cutMenu.value.entityName)) {
        cutMenu.value.type = 4;
        cutMenu.value.outLink = systemEntityPath[cutMenu.value.entityName];
    }
    console.log(cutMenu.value,'cutMenu.value')
    // 是父级菜单
    if (!cutMenu.value.parentGuid) {
        let inx = getMenuInx(menuData.list, cutMenu.value.guid);
        // 如果节点被删掉了
        if (inx == -1) {
            menuData.list.push(Object.assign({}, cutMenu.value));
        } else {
            menuData.list[inx] = Object.assign(
                menuData.list[inx],
                cutMenu.value
            );
        }
    }
    // 子集菜单
    else {
        let parentInx = getMenuInx(menuData.list, cutMenu.value.parentGuid);
        // 如果父节点被删掉了
        if (parentInx == -1) {
            cutMenu.value.parentGuid = "";
            menuData.list.push(Object.assign({}, cutMenu.value));
        } else {
            let inx = getMenuInx(
                menuData.list[parentInx].children,
                cutMenu.value.guid
            );
            // 如果子节点被删掉了
            if (inx == -1) {
                menuData.list[parentInx].children.push(
                    Object.assign({}, cutMenu.value)
                );
            } else {
                menuData.list[parentInx].children[inx] = Object.assign(
                    {},
                    cutMenu.value
                );
            }
        }
    }
    // console.log(menuData,'menuData')
    cutMenu.value = null;
};
// 获取数据索引
const getMenuInx = (array, guid) => {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.guid == guid) {
            return index;
        }
    }
    return -1;
};

// 删除菜单
const delMenu = (menu, inx, subInx) => {
    // 父级菜单删除
    if (!menu.parentGuid) {
        menuData.list.splice(inx, 1);
    }
    // 子级菜单删除
    else {
        menuData.list[inx].children.splice(subInx, 1);
    }
    // 如果删除的是当前选中
    if (
        cutMenu.value &&
        cutMenu.value.guid &&
        menu.guid == cutMenu.value.guid
    ) {
        cutMenu.value = null;
    }
};

/**
 * ********************************************** 添加、编辑 菜单项相关  end
 */
// 源数据
let sourceData = reactive({});

// 获取数据
const getMenuFn = () => {
    menuData = Object.assign(menuData, props.menuInfo);
    sourceData = Object.assign({}, props.menuInfo);
    menuData.list = menuData.config ? JSON.parse(menuData.config) : [];
};

// 导航保存
const layoutSave = async () => {
    let { layoutConfigId, configName } = menuData;
    if (!configName) {
        $ElMessage.warning("请输入菜单名称");
        return;
    }
    let newMenuList = [...formatMenuList()];
    if (newMenuList.length < 1) {
        $ElMessage.warning("请至少添加一个菜单项");
        return;
    }
    newMenuList.forEach((el) => {
        if (el.children && el.children.length > 0) {
            el.entityCode = "parentMenu";
            el.entityName = "parentMenu";
        }
    });
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
        $ElMessage.success("保存成功");
        loading.value = false;
        isShow.value = false;
        return;
    }
    loading.value = true;
    let res = await $API.layoutConfig.saveConfig(layoutConfigId, "NAV", param);
    if (res) {
        // 如果默认选中导航就是当前修改导航 并且 如果数据有变化
        if (
            chosenNavigationId.value &&
            chosenNavigationId.value == menuData.layoutConfigId &&
            $TOOL.checkIsEdit(sourceData.config, menuData.config)
        ) {
            router.go(0);
        } else {
            getNavigationApi();
            isShow.value = false;
        }
    }
    loading.value = false;
};

// 格式化菜单数据
const formatMenuList = () => {
    let saveMenu = [];
    // 循环菜单
    menuData.list.forEach((el) => {
        // 必须存在关联或者外部链接才是菜单
        if (
            el.entityCode ||
            el.outLink ||
            (el.children && el.children.length > 0)
        ) {
            let isMenu = { ...el };
            // 如果存在子节点
            if (el.children && el.children.length > 0) {
                isMenu.children = [];
                el.children.forEach((subEl) => {
                    // 子节点也必须存在关联或者外部链接才是菜单
                    if (subEl.entityCode || subEl.outLink) {
                        isMenu.children.push(subEl);
                    }
                });
            }
            saveMenu.push(isMenu);
        }
    });
    saveMenu.forEach((el, inx) => {
        if (
            el.entityCode == "parentMenu" &&
            (!el.children || el.children.length < 1)
        ) {
            saveMenu.splice(inx, 1);
        }
        if (!el.entityCode && !el.outLink && el.children.length < 1) {
            saveMenu.splice(inx, 1);
        }
    });
    return saveMenu;
};
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
    width: 42%;
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
    width: calc(58% - 20px);
    margin-left: 20px;
}

.parent-li {
    // height: 888px;
    font-size: 13px;
    color: #303030;
    text-decoration: none;
    background: none repeat scroll 0 0 #fff;

    .paren-idv {
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
    background: var(--el-color-primary-light-3);
    text-align: center;
    color: #fff;
    .icon {
        float: left;
        margin-left: 6px;
        margin-top: 8px;
    }
    &:hover {
        cursor: move;
        background: #5a95f5;
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
