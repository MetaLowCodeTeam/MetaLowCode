<template>
    <el-config-provider
        :locale="zhCn"
        :size="$CONFIG.size"
        :zIndex="$CONFIG.zIndex"
        :button="$CONFIG.button"
    >
        <router-view v-if="isShowBody"></router-view>
        <div class="app-loading" v-else>
            <div class="app-loading__logo"></div>
            <div class="app-loading__loader"></div>
            <div class="app-loading__title">Loading...</div>
        </div>
    </el-config-provider>
    <div class="web-ver">{{ publicSetting.webVer }}</div>
    <mlCustomerService v-if="publicSetting.trialVersionFlag" />
</template>

<script setup>
import {
    getCurrentInstance,
    computed,
    reactive,
    onBeforeMount,
    inject,
    ref,
    nextTick,
    onMounted
} from "vue";
import mlCustomerService from "@/components/mlCustomerService/index.vue";
import colorTool from "@/utils/color";
import useCheckStatusStore from "@/store/modules/checkStatus";
import { getPublicSetting } from "@/api/setting";
import http from "@/utils/request";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getLoginUser } from "@/api/user";
import { useRouter } from "vue-router";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
const { getEntityList, setPublicSetting, setUserInfo } = useCommonStore();
const { setNewMsgNum } = useCheckStatusStore();
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
const instance = getCurrentInstance();
const $CONFIG = inject("$CONFIG");
const $TOOL = inject("$TOOL");
let { proxy } = instance;
let isShowBody = ref(false);
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
    // return $TOOL.data.get("APP_LANG");
    return ""
});

onBeforeMount(() => {
    const app_color =
        $CONFIG.COLOR || publicSetting.value.APP_COLOR || "#409EFF";
    colorPrimary(app_color);
    // 获取公开系统配置
    queryPublicSetting();
    if(location.pathname == '/web/inReport'){
        isShowBody.value = true;
        return
    }
    if(!$TOOL.data.get("APP_LANG")) {
        $TOOL.data.set("APP_LANG",'zh-cn')
    }
    initApi();
    const quickNavigation = $TOOL.data.get("QuickNavigation");
    if(quickNavigation){
        $TOOL.data.remove("QuickNavigation");
        jumpLink(quickNavigation.type, quickNavigation.url);
    }
});




const jumpLink = (type, url) => {
    // 如果是当前页面
    if (type == 1) {
        window.location(url);
    }
    // 如果是新页面打开
    else {
        window.open(url);
    }
}

const initApi = async () => {
    $TOOL.cookie.set("TOKEN", getQueryString("loginToken"));
    let res = await getLoginUser(getQueryString("loginToken"));
    if (res && res.data) {
        if (res.data.data) {
            isShowBody.value = false;
            setUserInfo(res.data.data);
            // 轮循获取新消息
            roundRobin(5000);
            // 获取新消息
            getNewMsgNum();
            // 获取实体列表
            await getEntityList();
            isShowBody.value = true;
        } else {
            isShowBody.value = true;
            router.push({ path: "/web/login" });
        }
    }
};

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

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
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty("--vf-color-primary", val); //同步主题色
    for (let i = 1; i <= 9; i++) {
        setProperty("light", "lighten", val, i);
        setProperty("dark", "darken", val, i);
    }
};

// 设置主题样式
const setProperty = (theme, type, val, inx) => {
    document.documentElement.style.setProperty(
        `--el-color-primary-${theme}-${inx}`,
        colorTool[type](val, inx / 10)
    );
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
.web-ver {
    width: 0;
    height: 0;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: -1;
}
.app-loading {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #fff;
}
.app-loading__logo {
    margin-bottom: 30px;
}
.app-loading__logo img {
    width: 90px;
    vertical-align: bottom;
}
.app-loading__loader {
    box-sizing: border-box;
    width: 35px;
    height: 35px;
    border: 5px solid transparent;
    border-top-color: #000;
    border-radius: 50%;
    animation: 0.5s loader linear infinite;
    position: relative;
}
.app-loading__loader:before {
    box-sizing: border-box;
    content: "";
    display: block;
    width: inherit;
    height: inherit;
    position: absolute;
    top: -5px;
    left: -5px;
    border: 5px solid #ccc;
    border-radius: 50%;
    opacity: 0.5;
}
.app-loading__title {
    font-size: 24px;
    color: #333;
    margin-top: 30px;
}
@keyframes loader {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
