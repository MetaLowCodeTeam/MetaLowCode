<template>
    <mlDialog title="设置导航菜单" v-model="isShow" width="680px">
        <div v-loading="loading">
            <div class="clearfix">
                <div class="sortable-box fl">
                    <VueDraggableNext
                        ghost-class="ghost"
                        chosen-class="chosenClass"
                        animation="300"
                        :force-fallback="false"
                        handle=".mover"
                        :list="menuData"
                    >
                        <div class="parent-li" v-for="(parent,inx) of menuData" :key="inx">
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
                                <div class="fl item text-ellipsis">{{ parent.name }}</div>
                                <div class="action-icon">
                                    <span
                                        class="icon-span add-icon mr-5"
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
                                    <div class="fl item text-ellipsis">{{ child.name }}</div>
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
                <div class="fl right-div" v-if="!cutMenu">点击左侧菜单项进行编辑</div>
                <div class="fl right-div" v-else>
                    <el-tabs v-model="cutMenu.type">
                        <el-tab-pane label="关联项" :name="1"></el-tab-pane>
                        <el-tab-pane label="外部地址" :name="2"></el-tab-pane>
                    </el-tabs>
                    <div v-if="cutMenu.type == 1">
                        <el-select
                            v-model="cutMenu.association"
                            filterable
                            placeholder="选择关联项"
                            class="w-100"
                            @change="associationChange"
                        >
                            <el-option
                                v-for="(op,inx) of approveDialogEntityList"
                                :key="inx"
                                :value="op.entityCode"
                                :label="op.label"
                            />
                        </el-select>
                    </div>
                    <div v-if="cutMenu.type == 2">
                        <el-input
                            v-model="cutMenu.outLink"
                            placeholder="输入外部地址，例：https://www.baidu.com/"
                            clearable
                        ></el-input>
                    </div>
                    <div class="mt-10">
                        <el-input v-model="cutMenu.name" placeholder="菜单名称" clearable></el-input>
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
                <el-button @click="isShow = false">取消</el-button>
                <el-button type="primary" @click="textSave">保存</el-button>
            </div>
        </template>
    </mlDialog>
</template>

<script setup>
import { watch, ref, onMounted, inject, reactive } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { approveDialogEntityList } = storeToRefs(useCommonStore());

const props = defineProps({
    modelValue: null,
    // 菜单信息
    menuInfo: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");
// const $API = inject("$API");
import { VueDraggableNext } from "vue-draggable-next";

// 弹框是否显示
let isShow = ref(false);
let loading = ref(false);
// 菜单数据
let menuData = ref([]);

watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);

onMounted(() => {
    isShow.value = props.modelValue;
    console.log("进来");
    getMenuFn();
});

// 测试保存
const textSave = () => {
    let saveMenu = [];
    // 循环菜单
    menuData.value.forEach((el) => {
        // 必须存在关联或者外部链接才是菜单
        if (el.association || el.outLink) {
            let isMenu = { ...el };
            // 如果存在子节点
            if (el.children && el.children.length > 0) {
                isMenu.children = [];
                el.children.forEach((subEl) => {
                    // 子节点也必须存在关联或者外部链接才是菜单
                    if (subEl.association || subEl.outLink) {
                        isMenu.children.push(subEl);
                    }
                });
            }
            saveMenu.push(isMenu);
        }
    });
    // console.log(saveMenu,'saveMenu')
    localStorage.setItem("menuData", JSON.stringify({ content: saveMenu }));
    isShow.value = false;
    location.reload();
};

// 节点选中
const nodeClick = (node) => {
    cutMenu.value = Object.assign({}, node);
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
    association: "",
    // 外部地址
    outLink: "",
    // key
    guid: "",
    // 父节点
    parentGuid: "",
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
    let linkEntity = approveDialogEntityList.value.filter(
        (el) => el.entityCode == entityCode
    );
    cutMenu.value.name = linkEntity[0].label;
    cutMenu.value.param = linkEntity[0].name;
    cutMenu.value.entityCode = linkEntity[0].entityCode;
    cutMenu.value.entityName = linkEntity[0].name;
};

// 添加父菜单
const addMenu = () => {
    defaultMenu.guid = getGuid();
    menuData.value.push(Object.assign({}, defaultMenu));
    cutMenu.value = Object.assign({}, defaultMenu);
};
// 添加子菜单
const addChildrenMenu = (menu) => {
    if (!menu.children) {
        menu.children = [];
    }
    let setMenu = Object.assign({}, defaultMenu);
    setMenu.parentGuid = menu.guid;
    setMenu.guid = getGuid();
    menu.children.push(setMenu);
    cutMenu.value = Object.assign({}, setMenu);
};
// 确认菜单
const confirmMenu = () => {
    if (cutMenu.value.type == 1 && !cutMenu.value.association) {
        $ElMessage.warning("请选择关联项");
        return;
    }
    if (cutMenu.value.type == 2 && !cutMenu.value.outLink) {
        $ElMessage.warning("请输入外部地址");
        return;
    }
    // 是父级菜单
    if (!cutMenu.value.parentGuid) {
        let inx = getMenuInx(menuData.value, cutMenu.value.guid);
        // 如果节点被删掉了
        if (inx == -1) {
            menuData.value.push(Object.assign({}, cutMenu.value));
        } else {
            menuData.value[inx] = Object.assign(
                menuData.value[inx],
                cutMenu.value
            );
        }
    }
    // 子集菜单
    else {
        let parentInx = getMenuInx(menuData.value, cutMenu.value.parentGuid);
        // 如果父节点被删掉了
        if (parentInx == -1) {
            cutMenu.value.parentGuid = "";
            menuData.value.push(Object.assign({}, cutMenu.value));
        } else {
            let inx = getMenuInx(
                menuData.value[parentInx].children,
                cutMenu.value.guid
            );
            // 如果子节点被删掉了
            if (inx == -1) {
                menuData.value[parentInx].children.push(
                    Object.assign({}, cutMenu.value)
                );
            } else {
                menuData.value[parentInx].children[inx] = Object.assign(
                    {},
                    cutMenu.value
                );
            }
        }
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
        menuData.value.splice(inx, 1);
    }
    // 子级菜单删除
    else {
        menuData.value[inx].children.splice(subInx, 1);
    }
};

/**
 * ********************************************** 添加、编辑 菜单项相关  end
 */

function getMenuFn() {
    console.log(props.menuInfo,'menuInfo')
    let config = JSON.parse(props.menuInfo.config);
    console.log(config);
    // console.log($TOOL.data.get('menuData'),'m')
    // if()
    // loading.value = true;
    // console.log("获取导航菜单");
    // setTimeout(() => {
    //     menuData.value = [...$TOOL.data.get("menuData")];
    //     loading.value = false;
    // }, 1000);

    // menuData.value = [
    // {
    //     name: "test",
    //     redirect: "/test-list/ceshi1-1",
    //     path: "/test-list/:name",
    //     meta: {
    //         title: "测试父级",
    //     },
    //     children: [
    //         {
    //             name: "test1-1",
    //             path: "/test-list/ceshi1-1",
    //             meta: {
    //                 title: "测试1-1",
    //             },
    //             component: "customize-menu/list",
    //         },
    //         {
    //             name: "test1-2",
    //             path: "/test2-list/ceshi1-2",
    //             meta: {
    //                 title: "测试1-2",
    //             },
    //             component: "customize-menu/list2",
    //         },
    //     ],
    // },
    // {
    //     name: "test1",
    //     path: "/test-list/xxx-xxxxxxxxxx",
    //     meta: {
    //         title: "测试父级1",
    //     },
    //     component: "customize-menu/list",
    // },
    // {
    //     name: "test2",
    //     path: "/test-list/ceshi2-1",
    //     meta: {
    //         title: "测试父级2",
    //     },
    //     component: "customize-menu/list",
    // },
    // ];
}
</script>

<style lang="scss" scoped>
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
    }
}

.mover,
.submover {
    width: 32px;
    height: 36px;
    line-height: 36px;
    background: #4285f4;
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
</style>