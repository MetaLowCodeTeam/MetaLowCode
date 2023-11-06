<template>
    <!--  -->
    <el-tooltip
        ref="tooltipRef"
        placement="bottom"
        effect="light"
        trigger="click"
        popper-class="ml-select-popper"
    >
        <template #content>
            <div
                class="op-item"
                :class="{'active':!isShowSlots && selectValue == op.value}"
                v-for="(op,inx) of myOptions"
                :key="inx"
                @click="selectedItem(op)"
            >{{ op.label }}</div>
        </template>
        <div class="ml-select" v-if="!isShowSlots">
            {{ getItemText() }}
            <span class="ml-select-icon">
                <el-icon>
                    <ElIconArrowDown />
                </el-icon>
            </span>
        </div>
        <div v-else>
            <slot name="default"></slot>
        </div>
    </el-tooltip>
</template>

<script setup>
import { onMounted, ref, watch, useSlots,reactive  } from "vue";
const props = defineProps({
    modelValue: null,
    options: { type: Array, default: () => [] },
    noFilterText: { type: String, default: "无权限" },
});
const emits = defineEmits(["update:modelValue","onChange"]);
let selectValue = ref("");
let myOptions = ref([]);
const tooltipRef = ref(null);
// 嵌入内容
let contentSlots = reactive({});
let isShowSlots = ref(false);
watch(
    () => props.modelValue,
    () => {
        selectValue.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    selectValue.value = props.modelValue;
    myOptions.value = props.options;
    contentSlots = useSlots();
    if (contentSlots.default) {
        isShowSlots.value = true;
    }
});

// 获取文本
const getItemText = () => {
    let filterValue = myOptions.value.filter(
        (el) => el.value == selectValue.value
    );
    if (filterValue.length > 0) {
        return filterValue[0].label;
    }
    return props.noFilterText;
};
// op选中
const selectedItem = (op) => {
    selectValue.value = op.value;
    if(contentSlots.default){
        emits("onChange", selectValue.value);
    }else{
        emits("update:modelValue", selectValue.value);
    }
    tooltipRef.value.hide();
};
</script>
<style lang='scss' scoped>
.ml-select {
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    text-align: left;
    height: 24px;
    line-height: 24px;
    font-size: 13px;
    border-radius: 4px;
    padding: 0 5px;
    .ml-select-icon {
        float: right;
        margin-top: 2px;
    }
}

.op-item {
    font-size: 14px;
    height: 34px;
    line-height: 34px;
    padding: 0 32px 0 20px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    &.active {
        color: var(--el-color-primary);
        font-weight: 700;
    }
    &:hover {
        background-color: var(--el-fill-color-light);
    }
}
</style>