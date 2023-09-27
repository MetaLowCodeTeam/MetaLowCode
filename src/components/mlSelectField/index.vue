<template>
    <mlDialog :title="title" append-to-body width="37%" v-model="dialogIsShow">
        <div class="mlfield-box">
            <el-row :gutter="10">
                <el-col :span="6" v-for="(field,inx) of fieldList" :key="inx" >
                    <div class="mlfield-item">
                        <div class="mlfield-check-box fl">
                            <el-checkbox v-model="field.isSelected" :disabled="field.reserved"/>
                        </div>
                        <div
                            class="mlfield-label fr"
                            @click="fieldSelect(field)"
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
    },
    { deep: true }
);
onMounted(() => {
    selectedFields.value = props.modelValue;
    console.log(selectedFields.value,'selectedFields.value')
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
    let res = await api.common.getFieldListOfEntity(param);
    if (res) {
        let resList = [];
        res.data.forEach(el=>{
            if(el.type !== 'PrimaryKey'){
                el.isSelected = false;
                if (hasFields.includes(el.name)) {
                    let filterFields = selectedFields.value.filter((subEl) => el.name == subEl.name);
                    el.isRequired = filterFields[0].isRequired,
                    el.isEdit = filterFields[0].isEdit,
                    el.isSelected = true;
                }
                resList.push(el)
            }
        })
        fieldList.value = resList;
    }
    loading.value = false;
};

// 选择字段
const fieldSelect = (field) => {
    if(field.reserved){
        return
    }
    field.isSelected = !field.isSelected;
}

// 确认
const confirm = () => {
    selectedFields.value = fieldList.value.filter((el) => el.isSelected);
    selectedFields.value.forEach(el => {
        el.isEdit = true;
    })
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
            margin-top: -3px;
        }
    }
}
</style>