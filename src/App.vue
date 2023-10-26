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
    ref,
} from "vue";
import colorTool from "@/utils/color";
import useCheckStatusStore from "@/store/modules/checkStatus";
import { getPublicSetting } from "@/api/setting";
import http from "@/utils/request";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { getEntityList, setPublicSetting } = useCommonStore();
const { setNewMsgNum } = useCheckStatusStore();
const { publicSetting } = storeToRefs(useCommonStore());

const instance = getCurrentInstance();
const $CONFIG = inject("$CONFIG");
const $TOOL = inject("$TOOL");
let { proxy } = instance;
let config = reactive({
    size: "default",
    zIndex: 2000,
    button: {
        autoInsertSpace: false,
    },
});
let loading = ref(false);
// computed()
let locale = computed(() => {
    return proxy.$i18n.messages[proxy.$i18n.locale].el;
});

onBeforeMount(() => {
    const app_color = $CONFIG.COLOR || publicSetting.value.APP_COLOR || '#409EFF';
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
    // 有用户信息
    if ($TOOL.data.get("USER_INFO")?.userName) {
        // 获取实体列表
        getEntityList();
        getRightMap();
    }
});

const getRightMap = async () => {
    let getRightMapRes = await http.get("/user/getRightMap");
    if (getRightMapRes) {
        $TOOL.data.set("rightMap", getRightMapRes.data || {});
    }
};

// /crud/getRightMap
// 获取公开系统配置
const queryPublicSetting = async () => {
    let res = await getPublicSetting();
    if (res) {
        let resData = res.data || {};
        resData.themeColor = res.data.themeColor || "#409EFF";
        colorPrimary(resData.themeColor);
        setPublicSetting(resData);
    }
};

const colorPrimary = (val) => {
    if (!val) {
        val = "#409EFF";
    }
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty("--vf-color-primary", val); //同步主题色
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
