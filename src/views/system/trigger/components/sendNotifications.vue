<template>
    <!--  -->
    <div class="action-div" v-loading="contentLoading">
        <el-form-item class="mt-20" label="发送给谁">
            <el-radio-group v-model="trigger.actionContent.userType" @change="userTypeChange">
                <el-radio :label="1">内部用户</el-radio>
                <el-radio :label="2">外部人员</el-radio>
                <el-radio :label="3" :disabled="!querySendState[dingState]">钉钉机器人</el-radio>
            </el-radio-group>
            <div class="w-100 mt-5">
                <mlSelectUser
                    v-if="trigger.actionContent.userType == 1"
                    v-model="trigger.actionContent.inUserList"
                    multiple
                    clearable
                />
                <el-select
                    v-model="trigger.actionContent.outUserList"
                    multiple
                    placeholder="请选择"
                    style="width: 100%"
                    clearable
                    filterable
                    v-if="trigger.actionContent.userType == 2"
                >
                    <el-option
                        v-for="(op,opInx) in sendToFields"
                        :key="opInx"
                        :label="op.fieldLabel"
                        :value="op.fieldName"
                    />
                </el-select>
            </div>
        </el-form-item>
        <el-form-item class="mt-20" label="Webhook地址" v-if="trigger.actionContent.userType == 3">
            <el-input
                v-model="trigger.actionContent.dingdingRobotUrl"
                placeholder="钉钉机器人Webhook地址"
                clearable
            ></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="加签秘钥" v-if="trigger.actionContent.userType == 3">
            <el-input
                v-model="trigger.actionContent.dingdingSign"
                placeholder="钉钉机器人加签秘钥"
                clearable
            ></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="通知类型" v-if="trigger.actionContent.userType != 3">
            <el-checkbox-group v-model="typeSelecteds" @change="typeChange">
                <el-checkbox
                    v-for="(item,inx) of typeList"
                    :key="inx"
                    :label="item.value"
                    :disabled="trigger.actionContent.userType == 2 && item.value == 2"
                >
                    {{ item.label }}
                    <span
                        v-if="item.code"
                    >({{ querySendState[item.code] ? '可用' : "不可用"}})</span>
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>

        <el-form-item class="mt-20" v-if="typeSelecteds.includes(8)" label="邮件标题">
            <el-input v-model="trigger.actionContent.title" placeholder="你有一条新通知"></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="内容">
            <div class="input-box">
                <el-input
                    v-model="trigger.actionContent.content"
                    placeholder="数据校验未通过"
                    :autosize="{ minRows: 3}"
                    type="textarea"
                    @blur="formulaBlur"
                    ref="contentInputRef"
                ></el-input>
                <span ref="buttonRef" v-click-outside="onClickOutside" class="field-span">{&nbsp;}</span>
            </div>
            <el-col :span="24">
                <div class="info-text mt-3">
                    内容 (及标题) 支持字段变量，字段变量如
                    <span style="color: #e83e8c;">{createdOn}</span> (其中 createdOn 为源实体的字段内部标识)
                </div>
            </el-col>
        </el-form-item>
    </div>
    <el-popover
        ref="popoverRef"
        :virtual-ref="buttonRef"
        trigger="click"
        placement="left"
        popper-class="formula-popover"
        virtual-triggering
    >
        <div
            class="field-item text-ellipsis"
            v-for="(item,inx) of cutEntityFields"
            :key="inx"
            @click="fieldSelect(item)"
        >{{ item.fieldLabel }}</div>
    </el-popover>
</template>

<script setup>
import { onMounted, ref, unref, inject, reactive } from "vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { queryEntityFields } from "@/api/crud";
const buttonRef = ref();
const popoverRef = ref();
const $API = inject("$API");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);
// 数据源
let trigger = ref({
    actionContent: {},
});
// 通知类型list
let typeList = ref([
    {
        label: "通知",
        value: 2,
    },
    {
        label: "邮件",
        value: 8,
        code: "emailState",
    },
    {
        label: "短信",
        value: 4,
        code: "smsState",
    },
    {
        label: "钉钉",
        value: 16,
        code: "dingState",
    },
]);
// 选中集合
let typeSelecteds = ref([]);

onMounted(() => {
    trigger.value = props.modelValue;
    // 初始化 发送给谁
    if (!trigger.value.actionContent.userType) {
        trigger.value.actionContent.userType = 1;
    }
    // 初始化通知类型（二进制状态）
    initSendType();
    getCutEntityFields();
    // 初始化通知内容
    if (!trigger.value.actionContent.content) {
        trigger.value.actionContent.content = "";
    }
});

// 初始化通知类型（二进制状态）
const initSendType = () => {
    if (
        !trigger.value.actionContent.type &&
        trigger.value.actionContent.userType == 1
    ) {
        trigger.value.actionContent.type = 2;
    }
    setTypeSelecteds();
};

// 设置通知类型选中
const setTypeSelecteds = () => {
    typeSelecteds.value = [];
    let { type } = trigger.value.actionContent;
    typeList.value.forEach((el) => {
        if ((type & el.value) > 0) {
            typeSelecteds.value.push(el.value);
        }
    });
};

// 通知类型切换
const typeChange = (e) => {
    let selectNum = 0;
    typeSelecteds.value.forEach((el) => {
        selectNum = selectNum | el;
    });
    trigger.value.actionContent.type = selectNum;
};
// 发送给谁切换
const userTypeChange = (e) => {
    // 如果选择外部人员，并且通知类型是勾选的。需要取消勾选
    if (e == 2 && (trigger.value.actionContent.type & 2) > 0) {
        trigger.value.actionContent.type = trigger.value.actionContent.type - 2;
        setTypeSelecteds();
    }
};

// 字段弹出
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
};

// 获取内容Input
let contentInputRef = ref("");
// 获取input光标位置
let blurIndex = ref(0);
const formulaBlur = (val) => {
    blurIndex.value = val.srcElement.selectionStart;
};

// 字段选择
const fieldSelect = (item) => {
    trigger.value.actionContent.content = insertStr(
        trigger.value.actionContent.content,
        blurIndex.value,
        `{${item.fieldName}}`
    );
    let setSelectionRange = blurIndex.value + item.fieldName.length + 2;
    contentInputRef.value.focus();
    setTimeout(() => {
        contentInputRef.value.ref.setSelectionRange(
            setSelectionRange,
            setSelectionRange
        );
    }, 0);
    popoverRef.value.hide();
};

const insertStr = (source, start, newStr) => {
    return source.slice(0, start) + newStr + source.slice(start);
};

// 源实体所有字段
let cutEntityFields = ref([]);
// 通知类型是否可用
let querySendState = reactive({
    // 邮件是否可用
    emailState: false,
    // 短信是否可用
    smsState: false,
    // 钉钉是否可用
    dingState:false,
});
// 外部人员字段
let sendToFields = ref([]);
const getCutEntityFields = async () => {
    contentLoading.value = true;
    let res = await queryEntityFields(trigger.value.entityCode, true, true);
    if (res) {
        cutEntityFields.value = res.data;
        sendToFields.value = res.data.filter((el) => el.fieldType == "Text");
        let querySendStateRes = await $API.trigger.detial.querySendState();
        querySendState.emailState = querySendStateRes.data?.emailState;
        querySendState.smsState = querySendStateRes.data?.smsState;
        querySendState.dingState = querySendStateRes.data?.dingState;
        // 如果是内部用户
        if (trigger.value.actionContent.userType == 1) {
            if (trigger.value.actionContent.sendTo?.length > 0) {
                let idToIdNameRes = await $API.trigger.detial.idToIdName(
                    trigger.value.actionContent.sendTo
                );
                if (idToIdNameRes) {
                    trigger.value.actionContent.inUserList = idToIdNameRes.data;
                    trigger.value.actionContent.outUserList = [];
                }
            } else {
                trigger.value.actionContent.inUserList = [];
                trigger.value.actionContent.outUserList = [];
            }
        } else {
            trigger.value.actionContent.inUserList = [];
        }
    }
    contentLoading.value = false;
};
</script>
<style lang='scss' scoped>
.action-div {
    width: 70%;
    padding: 0px 60px 20px 40px;
    border-radius: 4px;
    background: #f7f7f7;
    .input-box {
        width: 100%;
        position: relative;
        .field-span {
            position: absolute;
            right: 5px;
            bottom: 5px;
            width: 22px;
            height: 22px;
            line-height: 18px;
            text-align: center;
            background: #a6a6a6;
            color: #ededed;
            cursor: pointer;
            border-radius: 4px;
            &:hover {
                background: #212121;
                color: #fff;
            }
        }
    }
}
.field-item {
    line-height: 26px;
    padding-left: 20px;
    cursor: default;
    margin-bottom: 5px;
    &:hover {
        background: #eee;
    }
}
</style>