<template>
    <el-container>
        <el-header style="height:50px;">
            <div class="common-header-left">
                <div class="common-header-logo">
                    <mlLogo />
                    <label>{{ publicSetting.APP_NAME }}</label>
                </div>
                <div class="common-header-title">{{title}}</div>
            </div>
            <div class="common-header-right">
                <router-link :to="appPath + 'login'">返回登录</router-link>
            </div>
        </el-header>
        <el-main>
            <div class="common-container">
                <h2 class="common-title">{{title}}</h2>
                <div class="common-main el-card">
                    <slot></slot>
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const props = defineProps({
    title: { type: String, default: "" },
});
const appPath = import.meta.env.VITE_APP_PATH;
</script>

<style>
</style>
