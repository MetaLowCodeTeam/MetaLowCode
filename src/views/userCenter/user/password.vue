<template>
    <el-card shadow="never" header="修改密码">
        <el-alert
            :title="infoText"
            type="info"
            show-icon
            style="margin-bottom: 15px;"
        />
        <el-form
            ref="form"
            :model="form"
            :rules="rules"
            label-width="120px"
            style="margin-top:20px;"
        >
            <el-form-item label="当前密码" prop="userPassword">
                <el-input
                    v-model="form.userPassword"
                    type="password"
                    show-password
                    placeholder="请输入当前密码"
                ></el-input>
                <div class="el-form-item-msg">必须提供当前登录用户密码才能进行更改</div>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input
                    v-model="form.newPassword"
                    type="password"
                    show-password
                    placeholder="请输入新密码"
                ></el-input>
                <sc-password-strength v-model="form.newPassword"></sc-password-strength>
                <div class="el-form-item-msg">{{ formatPasswordRuleLabel() }}</div>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmNewPassword">
                <el-input
                    v-model="form.confirmNewPassword"
                    type="password"
                    show-password
                    placeholder="请再次输入新密码"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="save">保存密码</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
import scPasswordStrength from "@/components/scPasswordStrength/index.vue";
import http from "@/utils/request";
import tool from "@/utils/tool";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { encrypt } from "@/utils/util";
import { checkPassword, getPasswordRuleLabel } from "@/hooks/usePasswordStrength";
const { publicSetting } = storeToRefs(useCommonStore());
const appPath = import.meta.env.VITE_APP_PATH;
export default {
    props: {
        infoText: {
            type: String,
            default: "密码更新成功后，您将被重定向到登录页面，您可以使用新密码重新登录。",
        },
    },
    components: {
        scPasswordStrength,
    },
    data() {
        return {
            form: {
                userPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            },
            rules: {
                userPassword: [{ required: true, message: "请输入当前密码" }],
                newPassword: [{ required: true, message: "请输入新密码" }],
                confirmNewPassword: [
                    { required: true, message: "请再次输入新密码" },
                    { validator: this.validatePass2 },
                ],
            },
        };
    },
    methods: {
        formatPasswordRuleLabel() {
            return getPasswordRuleLabel(publicSetting.value.userPasswordRuleLevel);
        },
        validatePass2(rule, value, callback) {
            if (value !== this.form.newPassword) {
                callback(new Error("两次输入密码不一致"));
            } else {
                callback();
            }
        },
        save() {
            if(publicSetting.value.trialVersionFlag){
                this.$message.error("试用版本已禁用修改密码功能，敬请谅解");
                return
            }
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    // let regEx = /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/;
                    // if(!regEx.test(this.form.newPassword)){
                    //     this.$message.error("必须包含数字、英文。密码长度为：6-20位")
                    //     return
                    // }
                    let { passed, message } = checkPassword(this.form.newPassword, publicSetting.value.userPasswordRuleLevel);
                    if(!passed){
                        this.$message.error(message);
                        return
                    }
                    let encryptPassword = await encrypt(this.form.userPassword);
                    let encryptNewPassword = await encrypt(this.form.newPassword);
                    let res = await http.get("/user/updatePassword", {
                        userName: tool.data.get("USER_INFO").loginName,
                        password: encryptPassword,
                        newPassword: encryptNewPassword,
                    });
                    if (res) {
                        this.$alert(
                            "密码修改成功，是否跳转至登录页使用新密码登录",
                            "修改成功",
                            {
                                type: "success",
                                center: true,
                            }
                        )
                            .then(() => {
                                this.$router.replace(appPath + "login");
                            })
                            .catch(() => {});
                    }
                } else {
                    return false;
                }
            });
        },
    },
};
</script>

<style>
</style>
