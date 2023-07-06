<template>
    <mlDialog :title="title" append-to-body width="37%" v-model="dialogIsShow">
        <div class="mlfield-box">
            <el-row :gutter="10">
                <el-col :span="6" v-for="(field,inx) of fieldList" :key="inx">
                    <div class="mlfield-item">
                        <div class="mlfield-check-box fl">
                            <el-checkbox v-model="field.isSelected" />
                        </div>
                        <div
                            class="mlfield-label fr"
                            @click="field.isSelected = !field.isSelected"
                        >{{ field.label }}</div>
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
const api = inject("$API");
const message = inject("$ElMessage");
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
    title: { type: String, defalut: "123" },
});
const emit = defineEmits(["update:modelValue"]);
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
    }
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
    let param = { entity: "DemoContact" };
    let hasFields = selectedFields.value.map((el) => el.name);
    let res = await api.approval.setConditions.getFieldSet(param);
    if (res.code == 200) {
        fieldList.value = res.data.map((el) => {
            el.isSelected = false;
            el.required = false;
            if (hasFields.includes(el.name)) {
                el.isSelected = true;
            }
            return el;
        });
    } else {
        message.error("获取数据失败，请尝试刷新页面后重试");
    }
    loading.value = false;
};

// 确认
const confirm = () => {
    selectedFields.value = fieldList.value.filter((el) => el.isSelected);
    emit("update:modelValue", selectedFields.value);
    dialogIsShow.value = false;
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
            margin-top: -1px;
        }
    }
}
</style>