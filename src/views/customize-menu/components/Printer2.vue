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
import { globalDsvDefaultData, formatFormVirtualField, formatQueryByIdParam } from "@/utils/util";
const { queryEntityNameById,getEntityList } = useCommonStore();
const router = useRouter();
let entityId = ref("");
let optionData = ref({});
let haveLayoutJson = ref(false);
let loading = ref(false);
let nameFieldName = ref("");

// 打印标题
let printerTitle = ref("");
// 指定表单
let formId = ref("");

onMounted(async () => {
    entityId.value = router.currentRoute.value.query.entityId;
    nameFieldName.value = router.currentRoute.value.query.nameFieldName;
    formId.value = router.currentRoute.value.query.formId;
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
    let res = await getFormLayout(queryEntityNameById(entityId.value), formId.value);
    haveLayoutJson.value = false;
    if (res && res.data?.layoutJson) {
        globalDsv.value.useFormId = res.data.formLayoutId;
        haveLayoutJson.value = true;
        optionData.value = res.data.optionData || {};
        if(res.data.codeOptionData) {
            optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
        }
        if(res.data.cascaderOptionData) {
            optionData.value = Object.assign(optionData.value, res.data.cascaderOptionData);
        }
        // 根据数据渲染出页面填入的值，填过
        nextTick(async () => {
			globalDsv.value.formStatus = 'read'
			globalDsv.value.formEntityId = entityId.value;
            vFormRef.value?.setFormJson(res.data.layoutJson);
            let buildFormFieldSchema = formatQueryByIdParam(vFormRef.value?.buildFormFieldSchema());
            let queryByIdRes = await queryById(entityId.value, buildFormFieldSchema.fieldNames, { queryDetailList: buildFormFieldSchema.queryDetailList });
            if (queryByIdRes && queryByIdRes.data) {
                globalDsv.value.recordData = queryByIdRes.data;
                
                let resData = queryByIdRes.data || {};
                printerTitle.value = resData[nameFieldName.value];
                // resData.logo = resData.logo || [];
                vFormRef.value?.resetForm();
                vFormRef.value?.setFormData(formatFormVirtualField(resData));
                nextTick(() => {
                    if (JSON.stringify(optionData.value) == "{}") {
                        vFormRef.value?.reloadOptionData();
                    }
                    vFormRef.value?.setReadMode();
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
    box-sizing: border-box;
    width: 794px;
    margin: 0 auto;
    padding: 0 20px;
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


</style>
<style>
    @media print {
        #app, body, html {
            height: 98%;
            /* 可选：给内容容器加内边距，避免内容贴边 */
            padding: 5mm; /* 内容内边距，可根据需求调整 */
            box-sizing: border-box; /* 确保内边距不超出高度/宽度 */
        }
        html {
            transform: scale(1);
            transform-origin: top center;
        }
    }

    /* 核心：给纸张设置边距 */
    @page {
        size: 100mm 100mm;
        /* 统一四边边距，可自定义数值（mm/cm/in/px） */
        margin: 5mm; 
        /* 也可单独设置上下左右：margin: 3mm 5mm 3mm 5mm; (上 右 下 左) */
        /* 若只需要左右/上下边距：margin: 0 5mm; (上下0，左右5mm) */
    }
</style>