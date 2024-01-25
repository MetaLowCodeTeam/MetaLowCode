<template>
    <!--  -->
    <el-collapse v-model="activeNames">
        <el-collapse-item name="1">
            <template #title>
                <h3>审批设置</h3>
            </template>
            <div class="work-flow-conditions mb-20">
                <div class="lable-title mb-3">谁可以发起此审批</div>
                <div class="mb-10 mt-10">
                    <el-radio-group
                        class="radio-need-block"
                        v-model="myFormData.nodeRoleType"
                        @change="nodeRoleTypeChange"
                    >
                        <el-radio :label="1">所有人</el-radio>
                        <el-radio :label="2">记录所属用户</el-radio>
                        <el-radio :label="3">指定用户</el-radio>
                    </el-radio-group>
                </div>
                <mlSelectUser
                    v-if="myFormData.nodeRoleType == 3"
                    v-model="myFormData.nodeRoleList"
                    multiple
                    clearable
                />
                <div class="lable-title mb-10 mt-20">发起条件</div>
                <div class="ml-a-span mb-3" @click="setCondition">{{ getSetConditionText() }}</div>
                <div class="info-text">符合条件的记录才可以使用/选择此流程</div>
            </div>
        </el-collapse-item>
    </el-collapse>

    <div v-if="dialogIsShow">
        <mlDialog title="发起条件" append-to-body width="37%" v-model="dialogIsShow">
            <mlSetConditions
                v-model="conditionConf"
                footer
                @cancel="dialogIsShow = false"
                @confirm="conditionConfirm"
                :entityName="entityCode"
            />
        </mlDialog>
    </div>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
const Router = useRouter();
const props = defineProps({
    formData: { Type: Object, default: () => {} },
});
const activeNames = ref(["1"]);
let myFormData = ref({
    type: 0,
    // 谁可以发起此审批
    nodeRoleType: 1,
    // 指定用户
    nodeRoleList: [],
    // 发起条件
    filter: {
        equation: "",
        items: [],
    },
});

watch(
    () => props.formData,
    () => {
        myFormData.value = Object.assign(myFormData.value, props.formData);
    },
    { deep: true }
);

let entityCode = ref("");

onMounted(() => {
    entityCode.value = Router.currentRoute.value.query.entityCode;
    myFormData.value = Object.assign(myFormData.value, props.formData);
});

const nodeRoleTypeChange = () => {
    if (myFormData.value.nodeRoleType !== 3) {
        myFormData.value.nodeRoleList = [];
    }
};

/**
 * 发起条件相关
 */
// 条件弹框
let dialogIsShow = ref(false);
// 条件对象
let conditionConf = reactive({});

// 获取设置条件文案
const getSetConditionText = () => {
    let { filter } = myFormData.value;
    let length = filter.items.length;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};
// 设置条件
const setCondition = () => {
    let { filter } = cloneDeep(myFormData.value);
    filter = initFilter(filter);
    conditionConf = filter;
    dialogIsShow.value = true;
};
const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
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
// 确认条件
const conditionConfirm = (conf) => {
    myFormData.value.filter = Object.assign(myFormData.value.filter, conf);
    dialogIsShow.value = false;
};

/**
 * 结束 获取数据
 */
const getFormData = () => {
    return { ...myFormData.value };
};

defineExpose({
    getFormData,
});
</script>
<style lang='scss' scoped>
</style>