<template>
    <ml-dialog
        v-model="dialogConf.isShow"
        :title="dialogConf.type == 1 ? '联网激活' : '离线激活'"
        width="600"
    >
        <div style="padding-right:20px" v-loading="dialogConf.loading">
            <el-form :label-width="dialogConf.type == 1 ? '70px' : '80px'">
                <template v-if="dialogConf.type == 1">
                    <el-form-item label="账号" required>
                        <el-input v-model="dialogConf.registerLicense.account" />
                    </el-form-item>
                    <el-form-item label="密钥" required>
                        <el-input v-model="dialogConf.registerLicense.secretKey" />
                    </el-form-item>
                    <el-form-item label="授权码" style="margin-bottom:22px" required>
                        <el-input v-model="dialogConf.registerLicense.licenseCode" />
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item label="设备号">
                        <span class="w-100">{{ licenseInfo.deviceNo }}</span>
                    </el-form-item>
                    <el-form-item label="离线授权" required>
                        <el-input
                            v-model="dialogConf.registerLicense.offlineSign"
                            type="textarea"
                            :rows="6"
                        />
                    </el-form-item>
                </template>
            </el-form>
        </div>
        <template #footer>
            <el-button
                @click="dialogConf.type = 1"
                type="success"
                v-if="dialogConf.type == 2"
                :loading="dialogConf.loading"
            >联网激活</el-button>
            <el-button
                @click="dialogConf.type = 2"
                type="info"
                v-if="dialogConf.type == 1"
                :loading="dialogConf.loading"
            >离线激活</el-button>
            <el-button @click="dialogConf.isShow = false" :loading="dialogConf.loading">取消</el-button>
            <el-button type="primary" @click="onActive" :loading="dialogConf.loading">激活</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { registerLicenseApi } from "@/api/setting";
import { getPublicSetting } from "@/api/setting";
import useCommonStore from "@/store/modules/common";
const { setPublicSetting } = useCommonStore();
// let dialogTitle = ref("在线激活");
const emits = defineEmits(["registerActiveConfirm"]);
const RegisterLicense = reactive({
    // 账号
    account: "",
    // 密钥
    secretKey: "",
    // 授权码
    licenseCode: "",
    // 离线授权码
    offlineSign: "",
});

let dialogConf = reactive({
    isShow: false,
    loading: false,
    // 1在线激活 2离线激活
    type: 1,
    registerLicense: {},
});

let licenseInfo = ref({});

const openDailog = (val) => {
    licenseInfo.value = { ...val };
    dialogConf.isShow = true;
    dialogConf.registerLicense = { ...RegisterLicense };
};

// 开始激活
const onActive = async () => {
    let { type, registerLicense } = dialogConf;
    let { account, secretKey, licenseCode, offlineSign } = registerLicense;
    if (type == 1 && (!account || !secretKey || !licenseCode)) {
        ElMessage.warning("账号、密钥、授权码为必填项。");
        return;
    }
    if (type == 2 && !offlineSign) {
        ElMessage.warning("离线授权码为必填项。");
        return;
    }
    let params = {};
    if (type == 1) {
        params = {
            account,
            secretKey,
            licenseCode,
        };
    } else {
        params = { offlineSign };
    }
    dialogConf.loading = true;
    let res = await registerLicenseApi(params);
    if (res) {
        let publicRes = await getPublicSetting();
        if (publicRes && publicRes.code == 200) {
            setPublicSetting(publicRes.data);
        }
        ElMessage.success("激活成功");
        dialogConf.isShow = false;
        dialogConf.loading = false;
        emits("registerActiveConfirm");
    } else {
        dialogConf.loading = false;
    }
};

defineExpose({
    openDailog,
});
</script>
<style lang='scss' scoped>
</style>