<template>
    <el-form ref="form" label-width="120px" label-position="left" style="padding:0 20px;">
        <el-alert
            title="以下配置可实时预览，开发者可在 config/index.js 中配置默认值，非常不建议在生产环境下开放布局设置"
            type="error"
            :closable="false"
        ></el-alert>
        <el-divider></el-divider>
        <el-form-item :label="$t('user.nightmode')">
            <el-switch v-model="dark"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('user.language')">
            <el-select v-model="lang">
                <el-option label="简体中文" value="zh-cn"></el-option>
                <el-option label="English" value="en"></el-option>
            </el-select>
        </el-form-item>
        <el-divider></el-divider>
        <el-divider></el-divider>
        <el-form-item label="框架布局">
            <el-select v-model="layout" placeholder="请选择">
                <el-option label="默认" value="default"></el-option>
                <el-option label="通栏" value="header"></el-option>
                <el-option label="经典" value="menu"></el-option>
                <el-option label="功能坞" value="dock"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="折叠菜单">
            <el-switch v-model="menuIsCollapse"></el-switch>
        </el-form-item>
        <el-form-item label="标签栏">
            <el-switch v-model="layoutTags"></el-switch>
        </el-form-item>
        <el-divider></el-divider>
    </el-form>
</template>

<script>
import colorTool from "@/utils/color";
import useGlobalStore from "@/store/modules/global";
import { storeToRefs } from "pinia";
const { layout, menuIsCollapse, layoutTags } = storeToRefs(useGlobalStore());
const { SET_layout } = useGlobalStore();
export default {
    data() {
        return {
            layout: layout.value,
            menuIsCollapse: menuIsCollapse.value,
            layoutTags: layoutTags.value,
            lang: this.$TOOL.data.get("APP_LANG") || this.$CONFIG.LANG,
            dark: this.$TOOL.data.get("APP_DARK") || false,
            colorList: [
                "#409EFF",
                "#009688",
                "#536dfe",
                "#ff5c93",
                "#c62f2f",
                "#fd726d",
            ],
        };
    },
    watch: {
        layout(val) {
            SET_layout(val);
        },
        menuIsCollapse() {
            TOGGLE_menuIsCollapse();
        },
        layoutTags() {
            TOGGLE_layoutTags();
        },
        dark(val) {
            if (val) {
                document.documentElement.classList.add("dark");
                this.$TOOL.data.set("APP_DARK", val);
            } else {
                document.documentElement.classList.remove("dark");
                this.$TOOL.data.remove("APP_DARK");
            }
        },
        lang(val) {
            this.$i18n.locale = val;
            this.$TOOL.data.set("APP_LANG", val);
        },
    },
};
</script>

<style>
</style>
