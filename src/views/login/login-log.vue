<template>
    <!--  -->
    <mlSingleList
        title="登录日志"
        mainEntity="TriggerLog"
        fieldsList="loginUser,ip,browserName,createdOn,logoutType,logoutTime,logout"
        :sortFields="sortFields"
        fieldName="loginUser.userName"
        :tableColumn="tableColumn"
        queryUrl="/user/userLoginLog"
        @highlightClick="highlightClick"
        :filterItems="filterItems"
    ></mlSingleList>
    <Detail ref="detailRefs" />
</template>
   
<script setup>
import { ref } from "vue";
import { $fromNow } from "@/utils/util";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityName } = storeToRefs(useCommonStore());
import Detail from "@/views/customize-menu/detail.vue";
// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([
    {
        fieldName: "ip",
        op: "LK",
        value:"",
    },
    {
        fieldName: "browserName",
        op: "LK",
        value:"",
    },
]);
let tableColumn = ref([
    {
        prop: "loginUser",
        label: "登录用户",
        align: "center",
        formatter: (row) => {
            return row.loginUser?.name;
        },
    },
    {
        prop: "ip",
        label: "登录IP",
        align: "center",
    },
    {
        prop: "browserName",
        label: "登录浏览器",
        align: "center",
    },
    {
        prop: "logout",
        label: "登出状态",
        align: "center",
        elTag: true,
        width:'120',
        formatter: (row) => {
            return {
                type: row.logout ? "info" : null,
                label: row.logout ? "已注销" : null,
            };
        },
    },
    {
        prop: "logoutType",
        label: "登出类型",
        align: "center",
    },
    {
        prop: "logoutTime",
        label: "登出时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.logoutTime);
        },
    },
]);
// 详情组件
let detailRefs = ref("");
// 高亮字段点击
const highlightClick = (item) => {
    let detailObj = {};
    detailObj.tab = {};
    detailObj.detailId = item.recordId.id;
    detailObj.detailTitle = item.recordId.name;
    detailRefs.value.openDialog(detailObj);
};
</script>
<style>
</style>