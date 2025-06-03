<template>
    <!--  -->
    <ml-dialog title="默认查询设置" v-model="isShow" append-to-body width="37%">
        <div v-loading="loading" style="min-height: 420px;">
            <el-tabs v-model="activeName">
                <el-tab-pane label="条件设置" name="first">
                    <mlSetConditions
                        ref="mlSetConditionsRef"
                        v-model="conditionConf"
                        @cancel="isShow = false"
                        @confirm="conditionConfirm"
                        :entityName="entityName"
                        enableSql
                    />
                </el-tab-pane>
                <el-tab-pane label="后置事件" name="second">
                    <mlCodeEditor v-model="javaScriptVal" funcParam="defaultFilter, exposed"/>
                </el-tab-pane>
            </el-tabs>
        </div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary" @click="onConfirm()">确定</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref, inject } from "vue";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
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

let activeName = ref("first");

let javaScriptVal = ref("");


const openDialog = (entity) => {
    activeName.value = "first";
    let { layoutConfigId, config } = entity.defaultFilterSetting;
    layoutId.value = layoutConfigId;
    let filter = {
        items: [],
    };
    if (config) {
        filter = JSON.parse(config);
        javaScriptVal.value = filter.javaScriptVal;
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

const mlSetConditionsRef = ref(null);
// 确认
const onConfirm = async () => {
    await mlSetConditionsRef.value.confirm();
}

// 条件确认
const conditionConfirm = async (conf) => {
    if(javaScriptVal.value){
        conf.javaScriptVal = javaScriptVal.value;
    }
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