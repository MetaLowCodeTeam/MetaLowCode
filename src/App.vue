<template>
    <el-config-provider
        :locale="locale"
        :size="$CONFIG.size"
        :zIndex="$CONFIG.zIndex"
        :button="$CONFIG.button"
    >
        <router-view></router-view>
    </el-config-provider>
</template>

<script setup>
import {
    getCurrentInstance,
    computed,
    reactive,
    onBeforeMount,
    inject,
} from "vue";
import colorTool from "@/utils/color";
import useCheckStatusStore from "@/store/modules/checkStatus";

import http from "@/utils/request";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
const { getEntityLable } = useCommonStore();
const router = useRouter();
const { setNewMsgNum } = useCheckStatusStore();

const instance = getCurrentInstance();
const $CONFIG = inject("$CONFIG");
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");
let { proxy } = instance;
let config = reactive({
    size: "default",
    zIndex: 2000,
    button: {
        autoInsertSpace: false,
    },
});
// computed()
let locale = computed(() => {
    return proxy.$i18n.messages[proxy.$i18n.locale].el;
});

onBeforeMount(() => {
    const app_color = $CONFIG.COLOR || $TOOL.data.get("APP_COLOR");
    if (app_color) {
        document.documentElement.style.setProperty(
            "--el-color-primary",
            app_color
        );
        for (let i = 1; i <= 9; i++) {
            document.documentElement.style.setProperty(
                `--el-color-primary-light-${i}`,
                colorTool.lighten(app_color, i / 10)
            );
        }
        for (let i = 1; i <= 9; i++) {
            document.documentElement.style.setProperty(
                `--el-color-primary-dark-${i}`,
                colorTool.darken(app_color, i / 10)
            );
        }
    }
    // 获取新消息
    getNewMsgNum();
    // // 轮循获取新消息
    // roundRobin(5000);

    // 获取公开系统配置
    queryPublicSetting();
    if($TOOL.data.get('USER_INFO')?.userName){
        // 获取所有实体并格式化Label
        getEntityLable();
    }
});

// /crud/getRightMap
// 获取公开系统配置
const queryPublicSetting = async () => {
    let res = await http.get("/setting/queryPublicSetting");
    if (res) {
        $TOOL.data.set("APP_NAME", res.data.appName);
        $TOOL.data.set("APP_VER", res.data.dbVersion);
        $TOOL.data.set("APP_LOGO", res.data.logo);
        $TOOL.data.set("APP_PAGE_FOOTER", res.data.pageFooter);
        $TOOL.data.set("APP_TITLE", res.data.appTitle);
        $TOOL.data.set("APP_SUB_TITLE", res.data.appSubtitle);
        $TOOL.data.set("APP_INTRO", res.data.appIntro);
        $TOOL.data.set("APP_WATERMARK", res.data.watermark);
        colorPrimary(res.data.themeColor);
    }
};

const colorPrimary = (val) => {
    if (!val) {
        val = "#409EFF";
    }
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty("--vf-color-primary", val);  //同步主题色
    for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
            `--el-color-primary-light-${i}`,
            colorTool.lighten(val, i / 10)
        );
    }
    for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
            `--el-color-primary-dark-${i}`,
            colorTool.darken(val, i / 10)
        );
    }
    $TOOL.data.set("APP_COLOR", val);
};

// 获取新消息
const getNewMsgNum = async () => {
    let checkStatusRes = await http.get("/crud/checkStatus");
    if (checkStatusRes) {
        setNewMsgNum(checkStatusRes.data?.noteCount);
    }
};
// 轮循获取新消息
const roundRobin = (ms) => {
    setInterval(() => {
        getNewMsgNum();
    }, ms);
};
</script>

<style lang="scss">
@import "@/style/style.scss";
</style>
