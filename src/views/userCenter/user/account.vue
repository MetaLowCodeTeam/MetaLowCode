<template>
    <!-- <el-alert title="异步组件动态加载使用了正处于试验阶段的<Suspense>组件, 其API和使用方式可能会改变. <Suspense> is an experimental feature and its API will likely change." type="warning" show-icon style="margin-bottom: 15px;"/> -->

    <el-card shadow="never" header="个人信息">
        <el-form ref="form" label-width="120px" style="margin-top:20px;">
            <el-form-item label="用户头像" required>
                <!-- <el-input v-model="userInfo.avatar"></el-input> -->
                <ml-upload
                    accept="image/*"
                    @on-success="onLogoSuccess"
                    class="ml-upload"
                    uploadUrl="/picture/upload"
                    style="width: 70px;"
                >
                    <template #trigger>
                        <div class="avatar-box" v-if="userInfo.avata">
                            <!-- <mlLogo class="avatar" :logoUrl="confData[item.key]" /> -->
                        </div>
                        <el-icon v-else class="avatar-uploader-icon">
                            <ElIconPlus />
                        </el-icon>
                    </template>
                </ml-upload>
            </el-form-item>
            <el-form-item label="登录账号名">
                <el-input v-model="userInfo.loginName" disabled></el-input>
                <div class="el-form-item-msg">账号信息用于登录，系统不允许修改</div>
            </el-form-item>
            <el-form-item label="用户名称" required>
                <el-input v-model="userInfo.userName"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
                <el-input v-model="userInfo.mobilePhone"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="userInfo.email"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary">保存</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup>
import { ref } from "vue";

let userInfo = ref({
    
});

// export default {
// 	data() {
// 		return {
// 			form: {
// 				user: "administrator@scuiadmin.com",
// 				name: "Sakuya",
// 				sex: "0",
// 				about: "正所谓富贵险中求"
// 			}
// 		}
// 	}
// }
</script>

<style lang="scss" scoped>
.avatar-box {
    position: relative;
    box-sizing: border-box;
    width: 70px;
    height: 70px;
    border: 1px dashed var(--el-border-color);
    padding: 10px;
    transition: var(--el-transition-duration-fast);
    img {
        width: 100%;
        height: 100%;
    }
    &:hover {
        border-color: var(--el-color-primary);
    }
    &.is-error {
        border-color: var(--el-color-error);
    }
}
.avatar-uploader-icon {
    border: 1px dashed var(--el-border-color);
    font-size: 28px;
    color: #8c939d;
    width: 70px;
    height: 70px;
    text-align: center;
    transition: var(--el-transition-duration-fast);
    &:hover {
        border-color: var(--el-color-primary);
    }
    &.is-error {
        border-color: var(--el-color-error);
    }
}
</style>
