<template>
    <div 
        class="quick-nav-widget" 
        @click.stop="setSelected" 
        v-loading="loading"
        :class="cutField?.options?.customClass"
    >
        <div v-if="myQuickNavConf.inletList.length > 0" class="clearfix">
            <div v-for="(item,inx) of myQuickNavConf.inletList" :key="inx" class="list-box fl" :style="getItemStyle()">
                <!-- 列表 -->
                <div
                    :class="['li-item',myQuickNavConf.type == 1 ? 'list-item' : 'card-item',myQuickNavConf.borderIsShow ? '': 'not-border']"
                    :style="{'borderColor':item.iconColor}"
                    @click.stop="navClick(item)"
                    v-if="designer || item.type != 3 || (item.type == 3 && item.pcShow)"
                >
                    <div class="item-icon" :style="{'background':item.iconColor || '#ddd',}">
                        <el-icon
                            class="icon-span"
                            v-if="!item.useIcon"
                            :color="contrastTextColor(item.iconColor)"
                        >
                            <SetUp />
                        </el-icon>
                        <el-icon
                            class="icon-span"
                            v-else
                            :color="contrastTextColor(item.iconColor)"
                        >
                            <component :is="item.useIcon" />
                        </el-icon>
                    </div>
                    <div class="item-span text-ellipsis" :title="item.name">{{ item.name }}</div>
                </div>
            </div>
        </div>
        <div class="no-data" v-else>
            请通过右侧
            <span class="lh">添加入口</span> 来添加数据
        </div>
    </div>
</template>
<script setup>
import { nextTick, onMounted, ref, watch, inject } from "vue";
import { contrastTextColor } from "./CalculateColor";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from "pinia";
import layoutConfigApi from "@/api/layoutConfig.js";
const $TOOL = inject("$TOOL");
defineOptions({
    name: "quickNav-widget",
});
const props = defineProps({
    field: Object,
    designer: Object,
});

const Router = useRouter();

let cutField = ref({});
let loading = ref(false);
// 当前设备，用于判断是PC还是移动
let cutDevice = ref("pc");

let myQuickNavConf = ref({
    // 入口集
    inletList: [],
    // 入口类型 1 列表 2卡片
    type: 1,
});

watch(
    () => props.field,
    () => {
        cutField.value = props.field;
        initOption();
    },
    { deep: true }
);
onMounted(() => {
    cutField.value = props.field;
    let queryType = Router.currentRoute.value.query.type;
    if (queryType == "mobile") {
        cutDevice.value = "mobile";
    } else {
        cutDevice.value = "pc";
    }

    initOption();
});

const initOption = () => {
    myQuickNavConf.value = cutField.value.options?.setQuickNavConf;
};

const setSelected = () => {
    props.designer?.setSelected(props.field);
};
const appPath = import.meta.env.VITE_APP_PATH;
const navClick = async (item) => {
    // 如果存在设计表示是在设计页面，无法点击
    if (props.designer) {
        return;
    }

    // 内部实体
    if (item.type == 1) {
        let path = appPath + item.entityName + "/list";
        jumpLink(1, item.openType == 1 ? 1 : 2, path);
    }
    // 外部链接
    else if (item.type == 2) {
        jumpLink(2, item.openType == 1 ? 1 : 2, item.outLink);
    }
    // 自定义页面
    else if (item.type == 3) {
        const { chosenNavigationId } = storeToRefs(useLayoutConfigStore());
        if(item.navigationId == chosenNavigationId.value){
            jumpLink(
                2,
                item.openType == 1 ? 1 : 2,
                appPath + "custom-page/" + item.outLink
            )  
        }else {
            let res = await layoutConfigApi.saveUserLayoutCache("NAV", item.navigationId);
            if(res) {
                location.reload();
                $TOOL.data.set("QuickNavigation", {
                    type: item.openType == 1 ? 1 : 2,
                    url: appPath + "custom-page/" + item.outLink
                });
            }
        }
    } else {
        ElMessage.warning(item.type + " 未找到.");
    }
};
/**
 * func 跳转方式 1 路由 2 window
 * target 跳转类型 1 当前页面 2 新窗口
 * url 跳转的链接
 */
const jumpLink = (func, target, url) => {
    // 如果是路由跳转
    if (func == 1) {
        // 如果是当前页面
        if (target == 1) {
            Router.push(url);
        }
        // 如果是新页面打开
        else {
            let newUrl = Router.resolve({
                path: url,
            });
            window.open(newUrl.href);
        }
    }
    // 如果是 window跳转
    else {
        // 如果是当前页面
        if (target == 1) {
            window.location.href = url;
        }
        // 如果是新页面打开
        else {
            window.open(url);
        }
    }
};

//
// 获取列宽
const getItemStyle = () => {
    let itemStyle = {
    };
    // 如果是PC
    if (cutDevice.value == "pc") {
        itemStyle.width = myQuickNavConf.value.itemWidth
            ? myQuickNavConf.value.itemWidth + "px"
            : "100px";
    }
    // 如果是移动
    else {
        // 如果是删格12
        if (myQuickNavConf.value.itemCol == 1) {
            itemStyle.width = "50%";
        }
        // 如果是删格24
        else {
            itemStyle.width = "100%";
        }
    }
    return itemStyle;
};

const getData = () => {
    return myQuickNavConf.value;
}
defineExpose({
    getData
})
</script>
<style lang="scss" scoped>
.quick-nav-widget {
    width: 100%;
    height: 100%;
    .list-box {
        box-sizing: border-box;
        padding: 0 5px;
    }
    .li-item {
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        box-sizing: border-box;
        float: left;
        // margin-right: 10px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
        &:hover {
            background: #f5f6f8;
            .item-span {
                color: var(--el-color-primary);
            }
        }
        .item-icon {
            width: 26px;
            height: 26px;
            line-height: 26px;
            text-align: center;
            border-radius: 4px;
            .icon-span {
                font-size: 15px;
                position: relative;
                top: 2px;
            }
        }
        &.list-item {
            height: 40px;
            line-height: 40px;
            border-radius: 4px;
            // width: 200px;
            width: 100%;
            padding: 0 10px;
            .item-icon {
                float: left;
                margin-top: 7px;
                margin-right: 5px;
            }
            .item-span {
                display: inline-block;
                width: calc(100% - 31px);
            }
        }
        &.card-item {
            height: 70px;
            // width: 180px;
            width: 100%;
            box-sizing: border-box;
            padding-top: 10px;
            text-align: center;
            box-shadow: var(--el-box-shadow-light);
            .item-icon {
                display: inline-block;
                line-height: 26px;
            }
            .item-span {
                margin-top: 5px;
                padding: 0 20px;
            }
        }
        &.not-border {
            border: 0;
        }
    }
}
.no-data {
    font-size: 14px;
    .lh {
        color: var(--el-color-primary);
    }
}
</style>
