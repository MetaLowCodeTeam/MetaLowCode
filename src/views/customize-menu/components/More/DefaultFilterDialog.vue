<template>
    <!--  -->
    <ml-dialog title="默认查询设置" v-model="isShow" append-to-body width="37%">
        <div v-loading="loading">
            <mlSetConditions
                v-model="conditionConf"
                footer
                @cancel="isShow = false"
                @confirm="conditionConfirm"
                :entityName="entityName"
                enableSql
            />
        </div>
    </ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref, inject } from "vue";
const $API = inject("$API");
const emits = defineEmits(["defaultFilterChange"]);
const props = defineProps({
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },

})
let isShow = ref(false);
let entityName = ref("");
let entityCode = ref("");
let loading = ref(false);

let layoutId = ref("");
// 条件
let conditionConf = ref({});

const openDialog = (entity) => {
    let { layoutConfigId, config } = entity.defaultFilterSetting;
    layoutId.value = layoutConfigId;
    let filter = {
        items: [],
    };
    if (config) {
        filter = JSON.parse(config);
    }
    entityName.value = entity.name;
    entityCode.value = entity.code;
    conditionConf = initFilter(filter);
    isShow.value = true;
};

const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};

// 条件确认
const conditionConfirm = async (conf) => {
    let param = {
        config: JSON.stringify(conf),
        entityCode: entityCode.value,
    };
    loading.value = true;
    let res = await $API.layoutConfig.saveConfig(
        layoutId.value,
        "DEFAULT_FILTER",
        param,
        props.modelName,
    );
    if (res) {
        ElMessage.success("保存成功");
        emits("defaultFilterChange");
        isShow.value = false;
    }
    loading.value = false;
};

defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
</style>