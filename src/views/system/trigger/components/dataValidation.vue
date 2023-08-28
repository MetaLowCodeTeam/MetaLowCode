<template>
    <!--  -->
    <div class="action-div" v-loading="contentLoading">
        <el-form-item class="mt-20" label="校验条件">
            <el-row>
                <el-col :span="24">
                    <div class="text-btn" @click="setCondition">{{ getSetConditionText() }}</div>
                </el-col>
                <el-col :span="24">
                    <div class="info-text">符合校验条件的数据/记录在操作时会提示失败</div>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item class="mt-20" label="提示内容">
            <div class="input-box">
                <el-input
                    v-model="trigger.actionContent.tipContent"
                    placeholder="数据效验未通过"
                    :autosize="{ minRows: 3}"
                    type="textarea"
                ></el-input>
                <span ref="buttonRef" v-click-outside="onClickOutside" class="field-span">{&nbsp;}</span>
            </div>
            <el-col :span="24">
                <div class="info-text mt-3">
                    校验未通过时的提示内容。内容支持字段变量，如
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
    <div v-if="dialogIsShow">
        <mlDialog title="校验条件" append-to-body width="37%" v-model="dialogIsShow">
            <mlSetConditions
                v-model="conditionConf"
                footer
                @cancel="dialogIsShow = false"
                @confirm="conditionConfirm"
            />
        </mlDialog>
    </div>
</template>

<script setup>
import { onMounted, ref, unref, inject } from "vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { queryEntityFields } from "@/api/crud";
const buttonRef = ref();
const popoverRef = ref();
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);
// 数据源
let trigger = ref({
    actionContent: {},
});
onMounted(() => {
    trigger.value = props.modelValue;
    // 初始化 效验条件
    if (!trigger.value.actionContent.filter) {
        trigger.value.actionContent.filter = {
            items: [],
        };
    }
    // 获取当前实体所有字段
    getCutEntityFields();
});

// 字段弹出
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
};

// 字段选择
const fieldSelect = (item) => {
    trigger.value.actionContent.tipContent = `${
        trigger.value.actionContent.tipContent || ""
    }{${item.fieldName}}`;
    popoverRef.value.hide();
};

// 源实体所有字段
let cutEntityFields = ref([]);

const getCutEntityFields = async () => {
    let res = await queryEntityFields(trigger.value.entityCode, true);
    if (res.code === 200) {
        cutEntityFields.value = res.data;
    } else {
        $ElMessage.error("获取当前实体字段数据失败：" + res.error);
    }
};

/**
 * ********************************************** 效验条件 相关 beg
 */

let dialogIsShow = ref(false);
// 条件框传值
let conditionConf = ref({});
// 设置条件
const setCondition = () => {
    let { filter } = trigger.value.actionContent;
    filter = initFilter(filter);
    conditionConf.value = filter;
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
    let { filter } = trigger.value.actionContent;
    let length = filter && filter.items ? filter.items.length : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    trigger.value.actionContent.filter = e;
    dialogIsShow.value = false;
};

/**
 * ********************************************** 效验条件 相关 end
 */
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