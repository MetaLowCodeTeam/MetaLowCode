<template>
    <!--  -->
    <div class="printer">
        <div class="printer-content" v-loading="loading">
            <div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px;">{{ printerTitle }}</div>
            <div class="v-from-box">
                <v-form-render v-if="haveLayoutJson" :option-data="optionData" ref="vFormRef" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
import { getFormLayout } from "@/api/system-manager";
import { queryById } from "@/api/crud";
import Print from "@/utils/print";
const { queryEntityNameById,getEntityList } = useCommonStore();
const router = useRouter();
let entityId = ref("");
let optionData = ref({});
let haveLayoutJson = ref(false);
let loading = ref(false);
let nameFieldName = ref("");

// 打印标题
let printerTitle = ref("");

onMounted(async () => {
    entityId.value = router.currentRoute.value.query.entityId;
    nameFieldName.value = router.currentRoute.value.query.nameFieldName;
    if (entityId.value) {
        router.go(-1);
    }
    await getEntityList();
    // 加载vform表单
    initVfromCom();
});

let vFormRef = ref();
let fromBoxRef = ref();
// 加载vform表单
const initVfromCom = async () => {
    loading.value = true;
    let res = await getFormLayout(queryEntityNameById(entityId.value));
    haveLayoutJson.value = false;
    if (res && res.data?.layoutJson) {
        haveLayoutJson.value = true;
        optionData.value = res.data.optionData || {};
        // 根据数据渲染出页面填入的值，填过
        nextTick(async () => {
            let queryByIdRes = await queryById(entityId.value);
            if (queryByIdRes && queryByIdRes.data) {
                vFormRef.value.setFormJson(res.data.layoutJson);
                let resData = queryByIdRes.data || {};
                printerTitle.value = resData[nameFieldName.value];
                // resData.logo = resData.logo || [];
                vFormRef.value.resetForm();
                vFormRef.value.setFormData(resData);
                nextTick(() => {
                    if (JSON.stringify(optionData.value) == "{}") {
                        vFormRef.value.reloadOptionData();
                    }
                    vFormRef.value.setReadMode();
                    globalDsv.value.formStatus = 'read'
                    // 
                    setTimeout(() => {
                        Print('.printer-content')
                        // window.print();
                    }, 500);
                    // printMe();
                });
            }
        });
    }
    loading.value = false;
};


</script>
<style lang='scss' scoped>
@media print {
    @page {
        size: 1920 1080
    }
}
.printer {
    padding-top: 30px;
    background: #FFF;
    min-height: 100%;
    .printer-content {
        width: 52%;
        margin: 0 auto; 
        .title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }
    }
}
</style>