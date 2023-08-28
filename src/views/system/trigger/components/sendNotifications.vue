<template>
    <!--  -->
    <div class="action-div" v-loading="contentLoading">
        <el-form-item class="mt-20" label="通知类型">
            <el-checkbox-group v-model="actionSelecteds" @change="typeChange">
                <el-checkbox label="2">通知</el-checkbox>
                <el-checkbox label="4">邮件(不可用)</el-checkbox>
                <el-checkbox label="8">短信(不可用)</el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item class="mt-20" label="标题">
            <el-input v-model="trigger.actionContent.title" placeholder="你有一条新通知"></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="内容">
            <div class="input-box">
                <el-input
                    v-model="trigger.actionContent.content"
                    placeholder="数据效验未通过"
                    :autosize="{ minRows: 3}"
                    type="textarea"
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
// 默认选中集合
let actionSelecteds = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;
    // 获取当前实体所有字段
    getCutEntityFields();
});


// 通知类型切换
const typeChange = (e)=>{
    console.log(e);
}

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