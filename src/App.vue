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
            <div class="app-loading__title">加载中...</div> 
        </div>
    </el-config-provider>
    <div class="web-ver">{{ publicSetting.webVer }}</div>
    <mlCustomerService v-if="publicSetting.trialVersionFlag || publicSetting?.productType?.value == 1" />
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
    onMounted,
    onBeforeUnmount
} from "vue";
import mlCustomerService from "@/components/mlCustomerService/index.vue";
import colorTool from "@/utils/color";
import useCheckStatusStore from "@/store/modules/checkStatus";
import { getPublicSetting } from "@/api/setting";
import http from "@/utils/request";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getLoginUser, tokenLogin } from "@/api/user";
import { useRouter } from "vue-router";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import loginManager from "@/utils/loginManager";
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
const appPath = import.meta.env.VITE_APP_PATH;
onBeforeMount(async () => {
    const app_color =
        $CONFIG.COLOR || publicSetting.value.APP_COLOR || "#409EFF";
    colorPrimary(app_color);
    
    // 如果有 loginToken，使用登录管理器
    if(getQueryString("loginToken")) {
        loginManager.startLogin();
        
        try {
            let res = await tokenLogin(getQueryString("loginToken"));
            if(res && res.data) {
                const url = new URL(window.location.href);
                // 删除 loginToken 参数
                url.searchParams.delete("loginToken");
                window.location.href = url.toString();
                // 页面会重新加载，所以这里不需要 completeLogin
                return
            }
        } catch (error) {
            console.error('Token login failed:', error);
        }
        
        // 如果登录失败或没有数据，完成登录处理
        loginManager.completeLogin();
        return
    }
    
    // 获取公开系统配置
    await queryPublicSetting();
    if(location.pathname == appPath + 'inReport'){
        isShowBody.value = true;
        return
    }
    if(!$TOOL.data.get("APP_LANG")) {
        $TOOL.data.set("APP_LANG",'zh-cn')
    }
    await initApi();
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
            let query = {};
            if(getQueryString("tenantCode")) {
                query.tenantCode = getQueryString("tenantCode");
            }
            if(getQueryString("tenantId")) {
                query.tenantId = getQueryString("tenantId");
            }
            router.push({ 
                path: appPath + "login",
                query
            });
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
    let res = await getPublicSetting(getQueryString("tenantId"));
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
    if (checkStatusRes && checkStatusRes.code == 200) {
        setNewMsgNum(checkStatusRes.data?.noteCount);
    }else {
        clearInterval(timer.value);
    }
};
let timer = ref(null);
// 轮循获取新消息
const roundRobin = (ms) => {
    timer.value = setInterval(() => {
        getNewMsgNum();
    }, ms);
};

onBeforeUnmount(() => {
    clearInterval(timer.value);
});
</script>

<style lang="scss">
@use "@/style/style.scss";
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
