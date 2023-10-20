<template>
    <el-card shadow="never" header="修改密码">
        <el-alert
            title="密码更新成功后，您将被重定向到登录页面，您可以使用新密码重新登录。"
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
                <div class="el-form-item-msg">请输入包含英文、数字的6-20位密码</div>
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
export default {
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
        validatePass2(rule, value, callback) {
            if (value !== this.form.newPassword) {
                callback(new Error("两次输入密码不一致"));
            } else {
                callback();
            }
        },
        save() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    let regEx = /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/;
                    if(!regEx.test(this.form.newPassword)){
                        this.$message.error("必须包含数字、英文。密码长度为：6-20位")
                        return
                    }
                    let res = await http.get("/user/updatePassword", {
                        userName: tool.data.get("USER_INFO").userName,
                        password: this.form.userPassword,
                        newPassword: this.form.newPassword,
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
                                this.$router.replace({
                                    path: "/web/login",
                                });
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
