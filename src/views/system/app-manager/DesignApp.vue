<template>
    <Tags isDesign></Tags>
    <el-select v-model="selectValue" :placeholder="t('appManager.1400')" @change="handleSelectChange">
        <el-option v-for="item in selectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <router-view></router-view>
</template>

<script setup>
import { ref } from "vue";
import { t } from "@/locales";
import { useRouter } from "vue-router";

import Tags from "@/layout/components/tags.vue";

const router = useRouter();


let selectValue = ref("DesignEntity");

const selectList = ref([
    {
        label: t("appManager.1400"),
        value: "DesignEntity",
    },
    {
        label: t("appManager.1401"),
        value: "DesignSingleOption",
    },
    {
        label: t("appManager.1402"),
        value: "DesignMultipleOption",
    },
    {
        label: t("appManager.1403"),
        value: "DesignApprovalProcess",
    },
    {
        label: t("appManager.1404"),
        value: "DesignTrigger",
    },
    {
        label: t("appManager.1405"),
        value: "DesignDashboard",
    },
    {
        label: t("appManager.1406"),
        value: "DesignReportDesign",
    },
    {
        label: t("appManager.1407"),
        value: "DesignExternalForm",
    },
    {
        label: t("appManager.1408"),
        value: "DesignMenuNavigation",
    },
]);

const handleSelectChange = (value) => {
    router.push({
        name: value,
    });
};
</script>

