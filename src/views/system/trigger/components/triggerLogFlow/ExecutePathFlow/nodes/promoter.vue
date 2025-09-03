<template>
    <div class="node-wrap">
        <div class="node-wrap-box start-node" :class="{'is-highlight': nodeConfig.highlightBefore}" @click="show">
            <div class="title promoter">
                <span class="ml-2">{{ nodeConfig.nodeName }}</span>
            </div>
            <div class="content promoter">
                <div class="default-div">
                    执行时间：{{ nodeConfig.executionOn }}
                </div>
            </div>
        </div>
        <add-node v-model="nodeConfig.childNode" :isHighlight="nodeConfig.isHighlight"></add-node>
    </div>
</template>

<script setup>
import { onMounted,ref, watch } from "vue";
import addNode from "./addNode.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});

const emit = defineEmits(["update:modelValue"]);
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

const show = () => {
    // 20250902 --- 注释 不需要任何点击效果
};
</script>

<style lang="scss" scoped>
.node-wrap-box {
    .title {
        height: 32px !important;
        line-height: 32px !important;
        padding-left: 5px !important;
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
        }
    }
}
</style>