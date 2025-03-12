<template>
    <!--  -->
    <div class="action-div" v-loading="contentLoading" element-loading-text="推送测试中...">
        <el-form-item class="mt-20" label="回调类型">
            <el-radio-group v-model="trigger.actionContent.callBackType" class="ml-4">
                <el-radio value="URL">URL回调</el-radio>
                <el-radio value="liteFlowJavaScript">脚本回调</el-radio>
                <el-radio value="FUNCTION">函数回调</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item
            class="mt-20"
            label="回调函数"
            v-if="trigger.actionContent.callBackType == 'FUNCTION'"
            v-loading="functionListLoading"
        >
            <el-select v-model="trigger.actionContent.functionName" class="m-2" placeholder="选择回调函数">
                <el-option
                    v-for="item in functionList"
                    :key="item"
                    :label="item"
                    :value="item"
                />
            </el-select>
        </el-form-item>
        <el-form-item
            class="mt-20"
            label="推送到(URL)"
            v-if="trigger.actionContent.callBackType == 'URL'"
        >
            <el-input
                v-model="trigger.actionContent.hookUrl"
                placeholder="https://www.test.com/send"
            ></el-input>
        </el-form-item>
        <el-form-item class="mt-20" label="安全码" v-if="trigger.actionContent.callBackType == 'URL'">
            <el-input v-model="trigger.actionContent.hookSecret" placeholder="(选填)"></el-input>
            <div class="info-text mt-3">
                填写后，系统在调用时会携带在请求头 Header 中，Header 名称为
                <span
                    style="color: #e83e8c;font-size: 12px;"
                >X-RBHOOK-SECRET</span>
            </div>
        </el-form-item>
        <el-form-item class="mt-10" label=" " v-if="trigger.actionContent.callBackType == 'URL'">
            <el-row class="w-100">
                <el-checkbox v-model="trigger.actionContent.forceSync" label="校验返回结果" />
            </el-row>
            <div class="info-text">
                启用后，调用返回结果必须为
                <span style="color: #e83e8c;font-size: 12px;">SUCCESS</span>
                ，否则将视为调用失败
            </div>
        </el-form-item>
        <el-form-item class="mt-10" label=" " v-if="trigger.actionContent.callBackType != 'liteFlowJavaScript'">
            <el-row class="w-100">
                <el-checkbox v-model="trigger.actionContent.pushAllData" label="推送全量数据" />
            </el-row>
            <div class="info-text">更新时默认只推送修改的字段/数据，启用后会推送全部字段/数据</div>
        </el-form-item>
        <el-form-item class="mt-15" label=" " v-if="trigger.actionContent.callBackType == 'URL'">
            <el-row class="w-100">
                <el-button
                    style="width: 80px;height: 36px;"
                    type="primary"
                    plain
                    @click="callBackTest"
                >推送测试</el-button>
            </el-row>
            <div class="text-div mt-5" v-if="testRes">
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
        <el-form-item class="mt-15" label="回调脚本" v-if="trigger.actionContent.callBackType == 'liteFlowJavaScript'">
            <lite-flow-java v-model="trigger.actionContent.script" style="width: 100%;"/>
        </el-form-item>
        <!-- <lite-flow-java v-if="trigger.actionContent.callBackType == 'liteFlowJavaScript'" label="回调脚本"> -->

    </div>
</template>

<script setup>
import http from "@/utils/request";
import { onMounted, ref, inject } from "vue";
import LiteFlowJava from "@/components/mlFormula/LiteFlowJava.vue";
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
    // 初始化回调类型
    if (!trigger.value.actionContent.callBackType) {
        trigger.value.actionContent.callBackType = "URL";
    }
    getFunctionList();
});

// 推送返回
let testRes = ref({});

// 推送测试
const callBackTest = async () => {
    if (!trigger.value.actionContent.hookUrl) {
        $ElMessage.warning("请输入要推送到的URL");
        return;
    }
    contentLoading.value = true;
    // let actionContent = JSON.stringify(trigger.value.actionContent);
    let res = await $API.trigger.detail.callBackTest(
        trigger.value.actionContent
    );
    if(res) {
        testRes.value = res;
    }
    contentLoading.value = false;
};

let functionListLoading = ref(false);
let functionList = ref([])
const getFunctionList =async ()=>{
    functionListLoading.value = true;
    let res =await http.get("/plugins/metaTrigger/trigger/queryFunctionList");
    if(res){
        functionList.value = res.data;
    }
    functionListLoading.value = false;
}


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
