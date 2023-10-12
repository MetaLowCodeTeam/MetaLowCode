<template>
    <mlDialog :title="title" append-to-body width="37%" v-model="dialogIsShow">
        <div class="mlfield-box">
            <el-row :gutter="10">
                <el-col :span="6" v-for="(field,inx) of fieldList" :key="inx">
                    <div class="mlfield-item">
                        <div class="mlfield-check-box fl">
                            <el-checkbox
                                v-model="field.isSelected"
                                :disabled="!isQuickQuery && field.reserved"
                            />
                        </div>
                        <div class="mlfield-label fr" @click="fieldSelect(field)">{{ field.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </div>
        <template #footer>
            <el-button type="primary" @click="confirm">确认</el-button>
            <el-button @click="dialogIsShow = false">取消</el-button>
        </template>
    </mlDialog>
</template>

<script setup>
import { watch, ref, onMounted, inject } from "vue";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
    title: { type: String, defalut: "123" },
    isQuickQuery: { type: Boolean, defalut: false },
    quickQueryConf: { type: Object, default: () => {} },
    entityName: { type: String, defalut: "DemoContact" },
});
const emit = defineEmits(["update:modelValue", "onConfirm"]);
// 选中的数据列表
let selectedFields = ref([]);
// 弹框是否显示
let dialogIsShow = ref(false);
// 加载loadin
let loading = ref(false);
// 数据库字段列表
let fieldList = ref([]);
watch(
    () => props.modelValue,
    () => {
        selectedFields.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    selectedFields.value = props.modelValue;
});

// 打开弹框
const openDialg = () => {
    dialogIsShow.value = true;
    getAllFields();
};

// 获取所有字段
const getAllFields = async () => {
    loading.value = true;
    let param = { entity: props.entityName };
    let hasFields = selectedFields.value.map((el) => el.name);
    let res = await $API.common.getFieldListOfEntity(param);
    if (res) {
        let resList = [];
        res.data.forEach((el) => {
            if (el.type !== "PrimaryKey") {
                el.isSelected = false;
                if (hasFields.includes(el.name)) {
                    let filterFields = selectedFields.value.filter(
                        (subEl) => el.name == subEl.name
                    );
                    (el.isRequired = filterFields[0].isRequired),
                        (el.isEdit = filterFields[0].isEdit),
                        (el.isSelected = true);
                }
                // 如果是快速查询字段，且没有默认值，且是名称字段
                if (
                    props.isQuickQuery &&
                    selectedFields.value.length < 1 &&
                    el.nameFieldFlag
                ) {
                    el.isSelected = true;
                }
                resList.push(el);
            }
        });
        fieldList.value = resList;
    }
    loading.value = false;
};

// 选择字段
const fieldSelect = (field) => {
    if (field.reserved && !props.isQuickQuery) {
        return;
    }
    field.isSelected = !field.isSelected;
};

// 确认
const confirm = async () => {
    selectedFields.value = fieldList.value.filter((el) => el.isSelected);
    selectedFields.value.forEach((el) => {
        el.isEdit = true;
        el.isRequired = false;
    });
    if (props.isQuickQuery) {
        if (selectedFields.value.length < 1) {
            $ElMessage.warning("请至少选择 1 个搜索字段");
            return;
        }
        let { entityCode, layoutConfigId } = props.quickQueryConf;
        let param = {
            config: JSON.stringify([...selectedFields.value]),
            entityCode,
            applyType: "SEARCH",
        };
        loading.value = true;
        let res = await $API.layoutConfig.saveConfig(
            layoutConfigId,
            "SEARCH",
            param
        );
        if (res) {
            $ElMessage.success("保存成功！");
            dialogIsShow.value = false;
            emit('onConfirm')
        }
        loading.value = false;
    } else {
        emit("update:modelValue", selectedFields.value);
        dialogIsShow.value = false;
    }
};

// 暴露方法给父组件调用
defineExpose({
    openDialg,
});
</script>

<style lang="scss" scoped>
.mlfield-box {
    .mlfield-item {
        cursor: pointer;
        .mlfield-label {
            display: inline-block;
            width: calc(100% - 20px);
            margin-top: -3px;
        }
    }
}
</style>