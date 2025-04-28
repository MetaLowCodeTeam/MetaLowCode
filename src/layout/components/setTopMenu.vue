<template>
    <mlDialog title="设置顶部导航菜单" v-model="isShow" width="680px">
        <div v-loading="loading">
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
                                class="paren-div"
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
                                    {{ parent.configName }}
                                </div>
                                <div class="action-icon">
                                    <span class="icon-span" @click.stop="delMenu(parent,inx)">
                                        <el-icon size="16">
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </VueDraggableNext>
                </div>
                <div class="fl right-div" v-if="!cutMenu">点击左侧导航项进行编辑</div>
                <div class="fl right-div" v-else>
                    <el-tabs v-model="cutMenu.type">
                        <el-tab-pane label="关联项" :name="1"></el-tab-pane>
                        <el-tab-pane label="外部地址" :name="2"></el-tab-pane>
                    </el-tabs>
                    <div
                        v-if="(cutMenu.type == 1 || cutMenu.type == 4) && (!cutMenu.children || (cutMenu.children && cutMenu.children.length < 1)) && cutMenu.entityCode != 'parentMenu'"
                    >
                        <el-select
                            v-model="cutMenu.layoutConfigId"
                            filterable
                            placeholder="选择关联项"
                            class="w-100"
                            @change="associationChange"
                        >
                            <el-option
                                v-for="(op,inx) of getAllNav()"
                                :key="inx"
                                :value="op.layoutConfigId"
                                :label="op.configName"
                            />
                        </el-select>
                    </div>
                    <div
                        v-if="(cutMenu.type == 1 || cutMenu.type == 4) && ((cutMenu.children && cutMenu.children.length > 0) || cutMenu.entityCode == 'parentMenu')"
                    >
                        <el-select v-model="parentMenu" filterable class="w-100" disabled></el-select>
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
                            v-model="cutMenu.configName"
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
                    <div class="mt-10" v-if="cutMenu.type == 2">
                        <el-radio-group v-model="cutMenu.openType">
                            <el-radio :value="0">新窗口打开</el-radio>
                            <el-radio :value="1">嵌入式</el-radio>
                        </el-radio-group>
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
					<el-checkbox v-model="isHideWorkbench">隐藏工作台</el-checkbox>
				</div>
                <el-button @click="isShow = false" :loading="loading">取消</el-button>
                <el-button type="primary" @click="layoutSave" :loading="loading">保存</el-button>
            </div>
        </template>
    </mlDialog>
    <mlSelectIcon v-model="isShowIconDialog" :useIcon="cutMenuIcon" @confirmIcon="selectIcon" />
</template>

<script setup>
import { ref, inject, reactive, watch, onMounted } from "vue";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import { VueDraggableNext } from "vue-draggable-next";

import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { useRouter } from "vue-router";

const { getAllNav, getTopNavigation, getNavigationApi } =
    useLayoutConfigStore();

const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue"]);
const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const $TOOL = inject("$TOOL");

// 弹框是否显示
let isShow = ref(false);
let loading = ref(false);
// 是否隐藏工作台
let isHideWorkbench = ref(false);
watch(
    () => props.modelValue,
    () => {
        initDailog();
    },
    { deep: true }
);

watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);

onMounted(() => {
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    initDailog();
});

// 初始化弹框
const initDailog = () => {
    isShow.value = props.modelValue;
    if (isShow.value) {
        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
        getMenuFn();
    }
};

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

let parentMenu = ref("父级菜单");
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
    configName: "未命名",
    // 1 关联性  2 外部地址
    type: 1,
    // 关联项
    layoutConfigId: null,
    // 外部地址
    outLink: "",
    // 0 外部打开 1 内嵌（iframe）
    openType: 0,
    // key
    guid: "",
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
const associationChange = (value) => {
    let findNav = getAllNav().filter((el) => el.layoutConfigId == value);
    cutMenu.value.configName = findNav[0].configName;
    cutMenu.value.layoutConfigId = findNav[0].layoutConfigId;
};

// 添加父菜单
const addMenu = () => {
    defaultMenu.guid = getGuid();
    menuData.list.push(Object.assign({}, defaultMenu));
    cutMenu.value = Object.assign({}, defaultMenu);
};

// 确认菜单
const confirmMenu = () => {
    if (cutMenu.value.type == 1 && !cutMenu.value.layoutConfigId) {
        $ElMessage.warning("请选择关联项");
        return;
    }
    if (cutMenu.value.type == 2 && !cutMenu.value.outLink) {
        $ElMessage.warning("请输入外部地址");
        return;
    }

    // // 是父级菜单
    // if (!cutMenu.value.parentGuid) {
    let inx = getMenuInx(menuData.list, cutMenu.value.guid);
    // 如果节点被删掉了
    if (inx == -1) {
        menuData.list.push(Object.assign({}, cutMenu.value));
    } else {
        menuData.list[inx] = Object.assign(menuData.list[inx], cutMenu.value);
    }
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
    menuData = Object.assign(menuData, getTopNavigation());
    sourceData = Object.assign({}, getTopNavigation());
    menuData.list = JSON.parse(JSON.stringify(menuData.navList));
    if(sourceData.config){
        let formatConfig = JSON.parse(sourceData.config);
        isHideWorkbench.value = formatConfig.isHideWorkbench;
    }
    cutMenu.value = null;
};

// 导航保存
const layoutSave = async () => {
    let { layoutConfigId, list } = menuData;
    let newConfig = {
        navList: list.filter((el) => el.layoutConfigId || el.type == 2),
        isHideWorkbench: isHideWorkbench.value
    };
    menuData.config = JSON.stringify(newConfig);
    let param = {};
    // 检测数据有没变化
    if ($TOOL.checkIsEdit(sourceData.config, menuData.config)) {
        param.config = menuData.config;
    }
    if (JSON.stringify(param) == "{}") {
        loading.value = false;
        isShow.value = false;
        return;
    }
    loading.value = true;
    let res = await $API.layoutConfig.saveConfig(
        layoutConfigId,
        "TOP_NAV",
        param
    );
    if (res && res.data) {
        getNavigationApi();
        $ElMessage.success("保存成功");
        isShow.value = false;
        router.go(0);
    }
    loading.value = false;
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
    color: #303030;
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
