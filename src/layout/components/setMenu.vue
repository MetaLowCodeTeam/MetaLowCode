<template>
    <mlDialog title="设置导航菜单" v-model="isShow" width="680px">
        <div v-loading="loading" class="clearfix">
            <div class="sortable-box fl">
                <!-- @start="onStart"
                @end="onEnd"-->
                <VueDraggableNext
                    ghost-class="ghost"
                    chosen-class="chosenClass"
                    animation="300"
                    :force-fallback="false"
                    handle=".mover"
                    :list="menuData"
                >
                    <div class="parent-li" v-for="(parent,inx) of menuData" :key="inx">
                        <div class="paren-idv">
                            <div class="mover fl">
                                <el-icon size="20" class="icon">
                                    <ElIconRank />
                                </el-icon>
                            </div>
                            <div class="fl item text-ellipsis">{{ parent.meta.title }}</div>
                        </div>
                        <VueDraggableNext
                            ghost-class="subghost"
                            chosen-class="subchosenClass"
                            animation="300"
                            :force-fallback="false"
                            handle=".submover"
                            :list="parent.child"
                        >
                            <div
                                class="child-div"
                                v-for="(child,subInx) of parent.child"
                                :key="subInx"
                            >
                                <div class="submover fl">
                                    <el-icon size="20" class="icon">
                                        <ElIconRank />
                                    </el-icon>
                                </div>
                                <div class="fl item text-ellipsis">{{ child.meta.title }}</div>
                            </div>
                        </VueDraggableNext>
                    </div>
                </VueDraggableNext>
            </div>
            <div class="fl right-div">点击左侧菜单项进行编辑</div>
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
const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue"]);
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");
import { VueDraggableNext } from "vue-draggable-next";

// 弹框是否显示
let isShow = ref(false);
// 加载状态
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
    getMenuFn();
});

function getMenuFn() {
    loading.value = true;
    // console.log($TOOL.data.get('menuData'),'m')
    // if()
    setTimeout(() => {
        console.log("获取导航菜单");
        // [...$TOOL.data.get('menuData')]
        menuData.value = [
            {
                name: "test",
                redirect:"/test-list/ceshi1-1",
                "path": "/test-list/:name",
                meta: {
                    title: "测试父级",
                },
                children: [
                    {
                        name: "test1-1",
                        path: "/test-list/ceshi1-1",
                        meta: {
                            title: "测试1-1",
                        },
                        component: "customize-menu/list"
                    },
                    {
                        name: "test1-2",
                        path: "/test2-list/ceshi1-2",
                        meta: {
                            title: "测试1-2",
                        },
                        component: "customize-menu/list2"
                    },
                ],
            },
            {
                name: "test1",
                path: "/test-list/xxx-xxxxxxxxxx",
                meta: {
                    title: "测试父级1",
                },
                component: "customize-menu/list"
            },
            {
                name: "test2",
                path: "/test-list/ceshi2-1",
                meta: {
                    title: "测试父级2",
                },
                component: "customize-menu/list"
            },
        ];

        loading.value = false;
    }, 300);
}


// 测试保存
const textSave = ()=>{
    localStorage.setItem('menuData',JSON.stringify({content:menuData.value}));
    isShow.value = false;
    location.reload();
}

//拖拽开始的事件
const onStart = () => {
    console.log("开始拖拽");
};

//拖拽结束的事件
const onEnd = () => {
    console.log("结束拖拽");
};
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
    background: #fff;
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
    background: #fff;
    .submover,
    .item {
        opacity: 0;
    }
}

.sbubchosenClass {
    background: green;
    // background-color: #f1f1f1;
}
</style>