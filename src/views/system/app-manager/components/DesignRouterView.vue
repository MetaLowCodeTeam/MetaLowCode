<template>
    <OptionManager v-if="currentRoute.name == 'DesignSingleOption'"></OptionManager>
    <TagManager v-if="currentRoute.name == 'DesignMultipleOption'"></TagManager>
    <ApprovalFlowManager v-if="currentRoute.name == 'DesignApprovalProcess'" is-design></ApprovalFlowManager>
    <TriggerManager v-if="currentRoute.name == 'DesignTrigger'"></TriggerManager>
    <DashboardManager v-if="currentRoute.name == 'DesignDashboard'"></DashboardManager>
    <TemplatesList v-if="currentRoute.name == 'DesignReportDesign'"></TemplatesList>
    <ExternalFormManager v-if="currentRoute.name == 'DesignExternalForm'"></ExternalFormManager>
    123

</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 单选项管理
import OptionManager from "@/views/system/data-dict/option-manager.vue";
// 多选项管理
import TagManager from "@/views/system/data-dict/tag-manager.vue";
// 审批流程管理
import ApprovalFlowManager from "@/views/system/approval-process/process-list.vue";
// 触发器管理
import TriggerManager from "@/views/system/trigger/trigger-list.vue";
// 仪表盘管理
import DashboardManager from "@/views/system/dashboard-design/chart.vue";
// 报表设计管理
import TemplatesList from "@/views/system/report-templates/templates-list.vue";
// 外部表单管理
import ExternalFormManager from "@/views/system/external-integration/external-list.vue";

const router = useRouter();

let currentRoute = ref({});

onMounted(() => {
    currentRoute.value = router.currentRoute.value;
    initRouter();
});

// 监听路由变化
watch(() => router.currentRoute.value, (newVal, oldVal) => {
    currentRoute.value = newVal;
    initRouter();
});

const initRouter = () => {
    console.log(currentRoute.value,'路由信息');
}

</script>
