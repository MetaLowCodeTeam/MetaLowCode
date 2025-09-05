<template>
    <div class="branch-wrap">
        <div class="branch-box-wrap">
            <div class="branch-box">
                <span class="add-branch"></span>
                <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
                    <div class="condition-node">
                        <div class="condition-node-box">
                            <div class="auto-judge" @click="show(index)" :class="{'execute-path-branch': executePath == item.executePath}">
                                <div class="title branch">
                                    <div class="title-left">
                                        <span class="trigger-reason">{{ item.triggerReason }}</span>
                                        <span class="node-title" :title="item.nodeName">{{ item.nodeName }}</span>
                                    </div>
                                    <el-button
                                        type="primary"
                                        circle
                                        size="small"
                                        class="small-circle-button"
                                        title="打开详情弹窗"
                                        @click="openRefDialog(item)"
                                    >
                                        <el-icon>
                                            <TopRight />
                                        </el-icon>
                                    </el-button>
                                </div>
                                <div class="content branch">
                                    <div class="default-div">
                                        <div>
                                            触发器类型：{{ item.actionType }}
                                        </div>
                                        <div class="mt-5">
                                            执行结果：
                                            <el-tag v-if="item.executeFlag" type="success">成功</el-tag>
                                            <el-tag v-else type="danger" @click="errorClick(item)">失败</el-tag>
                                        </div>
                                        <div class="mt-5">
                                            执行时间：{{ item.executionOn }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <add-node v-model="item.childNode" :isHighlight="nodeConfig.isHighlight"></add-node>
                        </div>
                    </div>
                    <slot v-if="item.childNode" :node="item"></slot>
                    <div class="top-left-cover-line" v-if="index==0"></div>
                    <div class="bottom-left-cover-line" v-if="index==0"></div>
                    <div
                        class="top-right-cover-line"
                        v-if="index==nodeConfig.conditionNodes.length-1"
                    ></div>
                    <div
                        class="bottom-right-cover-line"
                        v-if="index==nodeConfig.conditionNodes.length-1"
                    ></div>
                </div>
            </div>
            <add-node v-model="nodeConfig.childNode" :isHighlight="nodeConfig.isHighlight"></add-node>
        </div>
    </div>
</template>

<script setup>
import addNode from "./addNode.vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
    executePath: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "errorClick"]);
let nodeConfig = ref({});
let entityCode = ref("");
watch(
    () => props.modelValue,
    () => {
        nodeConfig.value = props.modelValue;
    },
    {
        deep: true,
    }
);
onMounted(() => {
    nodeConfig.value = props.modelValue;
    entityCode.value = router.currentRoute.value.query?.entityCode;
});

const show = (index) => {
    // 20250902 --- 注释 不需要任何点击效果
};


const errorClick = (item) => {
    emit("errorClick", item);
};

const openRefDialog = (item) => {
    const appPath = import.meta.env.VITE_APP_PATH;
    const routeUrl = router.resolve({
        path: appPath + "trigger-detail",
        query: {
            triggerConfigId: item.triggerConfigId,
            meteAppendTitle: item.nodeName,
        },
    });
    window.open(routeUrl.href, "_blank");
}
</script>

<style lang="scss" scoped>
.last-nodes {
    position: absolute;
    top: 62px;
    left: 0;
    height: 34px;
    line-height: 34px;
    background: #f7b904;
    width: 100%;
    font-size: 14px;
    color: #fff;
    padding: 0 20px;
}
.add-branch {
    display: inline-block;
    padding: 0 !important;
    width: 2px;
    height: 20px;
    top: -20px !important;
    background: rgb(202, 202, 202);

}

.auto-judge {
    .title {
        height: 32px !important;
        line-height: 32px !important;
        padding-left: 5px !important;
        padding-right: 6px !important;
        display: flex;
        align-items: center;
        .trigger-reason {
            display: inline-block;
            height: 20px;
            line-height: 20px;
            margin-right: 10px;
            padding: 0 10px;
            background: #F0F8EB;
            border-radius: 10px;
            color: #68C23A;
            font-size: 12px;
            flex: 0 0 auto;
        }
        .title-left {
            display: inline-flex;
            align-items: center;
            min-width: 0;
            gap: 8px;
            flex: 1 1 auto;
            .node-title {
                display: inline-block;
                flex: 1 1 auto;
                min-width: 0;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        > .small-circle-button {
            margin-left: 0;
            flex: 0 0 24px;
            width: 24px;
            height: 24px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
    }
    .content {
        .default-div {
            padding: 15px 10px !important;
        }
    }
    &.execute-path-branch {
        .title,.content {
            background: #FCAC22 !important;
        }
    }
}
</style>
