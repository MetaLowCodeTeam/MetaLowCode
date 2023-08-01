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
import useCheckStatusStore from "@/store/modules/checkStatus";
import http from "@/utils/request";
import { useRouter } from "vue-router";
const router = useRouter();
const { setNewMsgNum } = useCheckStatusStore();
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
                color$TOOL.lighten(app_color, i / 10)
            );
        }
        for (let i = 1; i <= 9; i++) {
            document.documentElement.style.setProperty(
                `--el-color-primary-dark-${i}`,
                color$TOOL.darken(app_color, i / 10)
            );
        }
    }
    getNewMsgNum();
    // 轮循
    // roundRobin(5000);
});
const getNewMsgNum = async () => {
    let checkStatusRes = await http.get("/crud/checkStatus");
    if(!checkStatusRes){
        return
    }
    if (checkStatusRes.code === 200) {
        setNewMsgNum(checkStatusRes.data.noteCount);
    } else if (checkStatusRes.code === 403) {
        router.replace({ path: "/login" });
    }
};
const roundRobin = (ms) => {
    setInterval(() => {
        getNewMsgNum();
    }, ms);
};
</script>

<style lang="scss">
@import "@/style/style.scss";
</style>
