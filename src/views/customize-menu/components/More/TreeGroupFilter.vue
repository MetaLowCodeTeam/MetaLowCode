<template>
    <!--  -->
    <ml-dialog title="树状分组筛选设置" v-model="isShow" append-to-body width="37%">
        <div v-loading="loading">树状分组筛选设置</div>
    </ml-dialog>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import useCommonStore from "@/store/modules/common";

/**
 * API
 */
import { getFieldSet } from "@/api/system-manager";

const { queryEntityNameByCode } = useCommonStore();
const props = defineProps({
    modelValue: null,
    entityCode: { type: Number },
});

const emits = defineEmits(["update:modelValue"]);

let isShow = ref(false);

watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
        loadFields();
    },
    { deep: true }
);

watch(
    () => isShow.value,
    () => {
        emits("update:modelValue", isShow.value);
    },
    { deep: true }
);

onMounted(() => {
    isShow.value = props.modelValue;
    loadFields();
});

/**
 * 加载字段数据
 */
let loading = ref(false);
let entityName = ref("");
// 所有字段
let fieldList = ref([]);

// 加载字段
const loadFields = async () => {
    // 弹框显示才调接口
    if (!isShow.value) {
        return;
    }
    entityName.value = queryEntityNameByCode(props.entityCode);
    loading.value = true;
    let res = await getFieldSet(entityName.value);
    if (res && res.code == 200) {
        // 这些类型无法选择
        let needType = [
            // 引用
            "Reference",
            // 布尔
            "Boolean",
            // 整数
            "Integer",
            // 精度小数
            "Decimal",
            // 百分比
            "Percent",
            // 金额
            "Money",
            // 文本
            "Text",
            // 单选项
            "Option",
            // 多选项
            "Tag",
            // 地区选择
            "AreaSelect",
            // 时间
            "Date",
        ];
        fieldList.value = res.data.filter((el) => needType.includes(el.type));
        console.log(fieldList.value, "可选字段");
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
</style>