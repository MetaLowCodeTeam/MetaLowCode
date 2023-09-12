<template>
    <!-- 就执行操作 -->
    <div class="perform-operations">
        <el-form label-width="124px">
            <el-form-item label="执行操作">
                <span class="blod">{{ trigger.actionType?.label}}</span>
            </el-form-item>
            <el-form-item label="操作内容">
                <fieldUpdate v-model="trigger" v-if="trigger.actionType?.value == 1" />
                <fieldAggregation v-model="trigger" v-if="trigger.actionType?.value == 2" />
                <dataValidation v-model="trigger" v-if="trigger.actionType?.value == 4" />
                <sendNotifications v-model="trigger" v-if="trigger.actionType?.value == 5" />
                <autoApproval v-model="trigger" v-if="trigger.actionType?.value == 6" />
                <autoRevokeApproval v-model="trigger" v-if="trigger.actionType?.value == 7" />
                <autoAllocation v-model="trigger" v-if="trigger.actionType?.value == 8" />
                <autoDelete v-model="trigger" v-if="trigger.actionType?.value == 12" />
                <hookUrl v-model="trigger" v-if="trigger.actionType?.value == 14" />
            </el-form-item>
            <el-form-item label="执行优先级">
                <el-input-number
                    v-model="trigger.priority"
                    @change="priorityChange"
                    :min="-99999"
                    :max="99999"
                />
                <div class="w-100 info-text" style="line-height: 24px;">优先级高 (数字大) 的会被先执行</div>
            </el-form-item>
            <el-form-item label=" " class="mt-30">
                <el-button type="primary" @click="onSave" style="width:100px;height: 36px;">保存</el-button>
                <el-dropdown
                    trigger="click"
                    @command="handleCommand"
                    v-if="trigger.actionType?.value == 1 || trigger.actionType?.value == 2"
                >
                    <el-button style="width:40px;height: 36px;">
                        <el-icon>
                            <ElIconMoreFilled />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="execute">立即执行</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
// 字段更新
import fieldUpdate from "./fieldUpdate.vue";
// 字段聚合
import fieldAggregation from "./fieldAggregation.vue";
// 数据效验
import dataValidation from "./dataValidation.vue";
// 发送通知
import sendNotifications from "./sendNotifications.vue";
// 自动分配
import autoAllocation from "./autoAllocation.vue";
// 自动审批
import autoApproval from "./autoApproval.vue";
// 自动撤销审批
import autoRevokeApproval from './autoRevokeApproval.vue';
// 自动删除
import autoDelete from "./autoDelete.vue";
// 回调URL
import hookUrl from "./hookUrl.vue";
const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue", "onSave"]);

watch(
    () => props.modelValue,
    () => {
        trigger.value = props.modelValue;
    },
    { deep: true }
);
let trigger = ref({});

onMounted(() => {
    trigger.value = props.modelValue;
});

// 优先级
const priorityChange = () => {
    emit("update:modelValue", trigger.value);
};

// 保存调用
const onSave = () => {
    // 需要定期执行
    // if ((trigger.whenNum & 512) > 0) {
    //     trigger.cron = triggerTakeActionRef.value.getCronVal();
    // }

    // console.log(trigger.value, "保存调用...");
    emit("onSave");
    // saveRecord
};

// 下拉调用
const handleCommand = (e) => {
    if (e == "execute") {
        emit("onSave", "execute");
    }
};


</script>
<style lang="scss" scoped>
.action-div {
    width: 70%;
    padding: 20px 60px 20px 40px;
    border-radius: 4px;
    background: #f7f7f7;
}
.blod {
    font-weight: bold;
}

.uptade-rule {
    .info-text {
        font-size: 13px;
    }
}
:deep(.el-form-item__content) {
    padding-left: 10px;
}
:deep(.el-textarea__inner) {
    //el_input中的隐藏属性
    resize: none; //禁止拉伸
    color: #f07178;
}
.uptade-rule-row {
    .uptade-rule-span {
        display: inline-block;
        background: #fbbc05;
        line-height: 20px;
        color: #fff;
        padding: 5px 10px;
        border-radius: 2px;
        &.toFixed {
            background: #fff;
            color: #000;
            border: 1px solid #dcdfe6;
        }
        &.forCompile {
            color: #f07178;
        }
    }
    .uptade-rule-col-last {
        .del-icon {
            margin-left: 2px;
            color: #9999b1;
            cursor: pointer;
            position: relative;
            z-index: -1;
            &:hover {
                color: #000;
            }
        }
    }
    &:hover {
        .del-icon {
            z-index: 1;
        }
    }
}
</style>