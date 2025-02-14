<template>
    <!--  -->
    <div class="printer">
        <div class="printer-content" v-loading="loading">
            <div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px;">{{ printerTitle }}</div>
            <div class="v-form-box">
                <v-form-render v-if="haveLayoutJson"
							   :option-data="optionData"
							   :global-dsv="globalDsv"
							   :responsiveLayoutDisabled="true"
							   ref="vFormRef" />
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
import { globalDsvDefaultData } from "@/utils/util";
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
    initVformCom();
});

let vFormRef = ref();
let fromBoxRef = ref();
let globalDsv = ref(globalDsvDefaultData());
// 加载vform表单
const initVformCom = async () => {
    loading.value = true;
    let res = await getFormLayout(queryEntityNameById(entityId.value));
    haveLayoutJson.value = false;
    if (res && res.data?.layoutJson) {
        haveLayoutJson.value = true;
        optionData.value = res.data.optionData || {};
        // 根据数据渲染出页面填入的值，填过
        nextTick(async () => {
			globalDsv.value.formStatus = 'read'
			globalDsv.value.formEntityId = entityId.value;
            let queryByIdRes = await queryById(entityId.value);
            if (queryByIdRes && queryByIdRes.data) {
                globalDsv.value.recordData = queryByIdRes.data;
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
        width: 100%;
        // margin: 0 auto;
        // border: 1px solid #d5d5d5;
        box-sizing: border-box;
        // padding: 10px 20px;
        .title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }
    }
}
:deep(.render-form) {
    .el-row {
        padding: 0 8px 0 8px !important;
    }
}

</style>
