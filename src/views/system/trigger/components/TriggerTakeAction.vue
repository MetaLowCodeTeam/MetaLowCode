<template>
    <!-- 当发生动作 -->
    <div class="trigger-take-action">
        <el-form label-width="120px">
            <el-form-item label="源实体">
                <span class="blod">{{ allEntityLabel[trigger.entityCode] }}</span>
            </el-form-item>
            <el-form-item label="触发动作">
                <div>
                    <el-checkbox-group v-model="actionSelecteds" @change="actionTypeChange">
                       
                        <el-row :gutter="20">
                            <el-col
                                :span="item.span ? item.span : 3"
                                v-for="(item,inx) of actionList"
                                :key="inx"
                            >
                                <el-checkbox :label="item.code" :disabled="trigger.disabledActive?.includes(item.code)">
                                    {{ item.label }}
                                    <el-tooltip
                                        effect="dark"
                                        content="审批通过后管理可以撤销重审"
                                        placement="top"
                                        v-if="item.code == 256"
                                    >
                                        <el-icon class="item-tip" size="14">
                                            <ElIconQuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </el-checkbox>
                            </el-col>
                        </el-row>
                    </el-checkbox-group>
                </div>
                <div class="w-100 mt-10" v-if="cronPopoverIsShow()">
                    <el-input
                        style="width: 200px;margin-right:5px;"
                        v-model="trigger.whenCron"
                        placeholder="0 * * * * ?"
                        @blur="cronFormat"
                        clearable
                    ></el-input>
                    <el-button type="primary" @click="cronDialogIsShow=true">配置</el-button>
                    <mlDialog title="CRON表达式" append-to-body width="37%" v-model="cronDialogIsShow">
                        <mlCron
                            max-height="400px"
                            i18n="cn"
                            @onConfirm="setCron"
                            @close="cronDialogIsShow = false"
                        ></mlCron>
                    </mlDialog>
                    <div class="info-text mt-5">
                        注意：定期执行将会对
                        <span class="blod">{{ allEntityLabel[trigger.entityCode] }}</span> 中所有数据执行操作。设置的执行周期请勿过于频繁！
                    </div>
                </div>
            </el-form-item>
            <el-form-item></el-form-item>
            <el-form-item label="附加过滤条件">
                <el-row>
                    <el-col :span="24">
                        <div class="ml-a-span" @click="setCondition">{{ getSetConditionText() }}</div>
                    </el-col>
                    <el-col :span="24">
                        <div class="info-text">符合条件的记录才可以使用/选择此流程</div>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
        <div v-if="dialogIsShow">
            <mlDialog title="附加过滤条件" append-to-body width="37%" v-model="dialogIsShow">
                <mlSetConditions
                    v-model="conditionConf"
                    footer
                    @cancel="dialogIsShow = false"
                    @confirm="conditionConfirm"
                    :entityName="trigger.entityCode"
                />
            </mlDialog>
        </div>
    </div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityLabel } = storeToRefs(useCommonStore());
import mlCron from "@/components/mlCron/index.vue";

const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue","actionTypeChange"]);

let trigger = ref({});
// 触发动作合集
let actionList = ref([
    {
        label: "新建时",
        code: 2,
    },
    {
        label: "更新时",
        code: 8, 
    },
    {
        label: "删除时",
        code: 4,
        span: 18,
    },
    {
        label: "分配时",
        code: 16,
    },
    {
        label: "共享时",
        code: 32,
    },
    {
        label: "取消共享时",
        code: 64,
        span: 18,
    },
    {
        label: "审批通过时",
        code: 128,
    },
    {
        label: "审批撤销",
        code: 256,
    },
    {
        label: "审批提交时",
        code: 1024,
    },
    {
        label: "审批驳回/撤回",
        code: 2048,
        span: 15,
    },
    {
        label: "定期执行",
        code: 512,
    },
]);
// 已勾选的合集
let actionSelecteds = ref([]);
// 选择条件弹框
let dialogIsShow = ref(false);
// 条件框传值
let conditionConf = ref({});
watch(
    () => props.modelValue,
    () => {
        trigger.value = props.modelValue;
        // 格式化触发动作
        formatActionType();
    },
    { deep: true }
);
onMounted(() => {
    trigger.value = props.modelValue;
    // 格式化触发动作
    formatActionType();
});

/***
 *  ****************************************** 触发动作相关 beg
 */

// 格式化触发动作
const formatActionType = () => {
    actionSelecteds.value = [];
    actionList.value.forEach((el) => {
        if ((trigger.value.whenNum & el.code) > 0) {
            actionSelecteds.value.push(el.code);
        }
    });
};

// 触发动作切换
const actionTypeChange = () => {
    let whenNum = 0;
    actionSelecteds.value.forEach((el) => {
        whenNum = whenNum | el;
    });
    trigger.value.whenNum = whenNum;
    cronPopoverIsShow();
    emit("update:modelValue", trigger.value);
    emit('actionTypeChange')
};

/***
 *  ****************************************** 触发动作相关 end
 */

/***
 *  ****************************************** cron表达式相关 beg
 */

let cronDialogIsShow = ref(false);

// cron表达式是否显示
const cronPopoverIsShow = () => {
    return actionSelecteds.value.includes(512);
};

// 确认设置表达式
const setCron = (v) => {
    trigger.value.whenCron = v;
    cronDialogIsShow.value = false;
    emit("update:modelValue", trigger.value);
};

// 格式化CRON  第一位默认0
const cronFormat = () => {
    if (trigger.value.whenCron) {
        let myCron = trigger.value.whenCron.slice(1);
        // console.log(myCron,'myCron')
        trigger.value.whenCron = "0" + myCron;
    }
};

/***
 *  ****************************************** cron表达式相关 end
 */

/***
 *  ****************************************** 过滤条件相关 beg
 */
// 设置条件
const setCondition = () => {
    let { actionFilter } = Object.assign({}, trigger.value);
    actionFilter = initFilter(actionFilter);

    conditionConf.value = JSON.parse(JSON.stringify(actionFilter));
    dialogIsShow.value = true;
};
// 初始化条件
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

// 获取设置条件文案
const getSetConditionText = () => {
    let { actionFilter } = trigger.value;
    let length =
        actionFilter && actionFilter.items ? actionFilter.items.length : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    trigger.value.actionFilter = Object.assign({}, e);
    dialogIsShow.value = false;
    emit("update:modelValue", trigger.value);
};

/***
 *  ****************************************** 过滤条件相关 end
 */
</script>

<style lang="scss" scoped>
.trigger-take-action {
    padding-bottom: 30px;
}
.blod {
    font-weight: bold;
}
.item-tip {
    position: relative;
    top: 1px;
}
:deep(.el-form-item) {
    margin-bottom: 8px;
}
:deep(.el-form-item__content) {
    padding-left: 10px;
}
</style>