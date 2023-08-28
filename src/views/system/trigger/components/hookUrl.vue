<template>
    <!--  -->
    <div class="action-div" v-loading="contentLoading">
        <el-form-item class="mt-20" label="推送到(URL)">
            <el-input
                v-model="trigger.actionContent.hookUrl"
                placeholder="https://www.test.com/send"
            ></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="安全码">
            <el-input v-model="trigger.actionContent.hookSecret" placeholder="(选填)"></el-input>
            <div class="info-text mt-3">
                填写后，系统在调用时会携带在请求头 Header 中，Header 名称为
                <span
                    style="color: #e83e8c;font-size: 12px;"
                >X-RBHOOK-SECRET</span>
            </div>
        </el-form-item>
        <el-form-item class="mt-10" label=" ">
            <el-row class="w-100">
                <el-checkbox v-model="trigger.actionContent.forceSync" label="校验返回结果" />
            </el-row>
            <div class="info-text">
                启用后，调用返回结果必须为
                <span style="color: #e83e8c;font-size: 12px;">SUCCESS</span>
                ，否则将视为调用失败
            </div>
        </el-form-item>
        <el-form-item class="mt-10" label=" ">
            <el-row class="w-100">
                <el-checkbox v-model="trigger.actionContent.pushAllData" label="推送全量数据" />
            </el-row>
            <div class="info-text">更新时默认只推送修改的字段/数据，启用后会推送全部字段/数据</div>
        </el-form-item>
        <el-form-item class="mt-15" label=" ">
            <el-row class="w-100">
                <el-button
                    style="width: 80px;height: 36px;"
                    type="primary"
                    plain
                    @click="hookUrlTest"
                >推送测试</el-button>
            </el-row>
            <div class="text-div mt-5" v-if="testRes.code == 200">
                <div>STATUS : {{ testRes.code }}</div>
                <div>MESSAGE : {{ testRes.message }}</div>
                <div class="pre-div">{{ testRes.data }}</div>
            </div>
            <div class="text-div mt-5" v-else>
                <div>STATUS : {{ testRes.code }}</div>
                <div>MESSAGE : {{ testRes.message }}</div>
                <div class="pre-div">{{ testRes.error }}</div>
            </div>
        </el-form-item>
    </div>
</template>

<script setup>
import { onMounted, ref, inject } from "vue";

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
    console.log(trigger.value, "trigger.value");
});

// 推送返回
let testRes = ref({});

// 推送测试
const hookUrlTest = async () => {
    if (!trigger.value.actionContent.hookUrl) {
        $ElMessage.warning("请数要推送到的URL");
        return;
    }
    // let actionContent = JSON.stringify(trigger.value.actionContent);
    let res = await $API.trigger.detial.hookUrlTest(
        trigger.value.actionContent
    );
    testRes.value = res;
    // if(res.code == 200){
    //     testRes.value = res.data;
    // }else {
    //     testRes.value = res.error;
    // }
};
</script>
<style lang='scss' scoped>
.action-div {
    width: 70%;
    padding: 5px 60px 20px 40px;
    border-radius: 4px;
    background: #f7f7f7;
    .text-div {
        width: 100%;
        background: #4f4a68;
        color: #edebe6;
        border-radius: 4px;
        padding: 0 20px;
        max-height: 300px;
        overflow-y: auto;
        .pre-div {
            white-space: pre-line;
            overflow-x: auto;
        }
        &::-webkit-scrollbar-thumb {
            /*滚动条里面小方块*/
            border-radius: 10px;
            background-color: rgba(50, 50, 50, 0.3);
        }

        &::-webkit-scrollbar-track {
            /*滚动条里面轨道*/
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            background: #fff;
            border-radius: 10px;
        }
    }
}
</style>