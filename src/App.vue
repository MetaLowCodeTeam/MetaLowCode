<template>
    <el-config-provider
        :locale="locale"
        :size="$CONFIG.size"
        :zIndex="$CONFIG.zIndex"
        :button="$CONFIG.button"
    >
        <router-view></router-view>
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
} from "vue";
import mlCustomerService from "@/components/mlCustomerService/index.vue";
import colorTool from "@/utils/color";
import useCheckStatusStore from "@/store/modules/checkStatus";
import { getPublicSetting } from "@/api/setting";
import http from "@/utils/request";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { ElLoading } from "element-plus";
import { getLoginUser } from "@/api/user";
import { useRouter } from "vue-router";
const { getEntityList, setPublicSetting } = useCommonStore();
const { setNewMsgNum } = useCheckStatusStore();
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
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
    const app_color =
        $CONFIG.COLOR || publicSetting.value.APP_COLOR || "#409EFF";
    colorPrimary(app_color);
    // 获取公开系统配置
    queryPublicSetting();
    initApi();
});

const initApi = async () => {
    let res = await getLoginUser();
    if (res && res.data) {
        if (res.data.data) {
            let user = res.data.data;
            let userInfo = {
                userName: user.userName,
                loginName: user.loginName,
                userId: user.userId,
                dashboard: "1",
                departmentId: user.departmentId,
                jobTitle: user.jobTitle,
                email: user.email,
                mobilePhone: user.mobilePhone,
                ownerTeam: user.ownerTeam,
            };
            $TOOL.data.set("USER_INFO", userInfo);
            // 轮循获取新消息
            roundRobin(5000);
            // 获取实体列表
            getEntityList();
            // 获取新消息
            getNewMsgNum();
        } else {
            router.push({ path: "/web/login" });
        }
    }
};

// 获取公开系统配置
const queryPublicSetting = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)",
    });
    let res = await getPublicSetting();
    if (res) {
        let resData = res.data || {};
        resData.themeColor = res.data.themeColor || "#409EFF";
        colorPrimary(resData.themeColor);
        setPublicSetting(resData);
        loading.close();
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
</style>
