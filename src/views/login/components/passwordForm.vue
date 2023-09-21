<template>
    <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
        @keyup.enter="login"
    >
        <el-form-item prop="user">
            <el-input
                v-model="form.user"
                prefix-icon="el-icon-user"
                clearable
                :placeholder="$t('login.userPlaceholder')"
            >
                <template #append>
                    <el-select v-model="userType" style="width: 130px;">
                        <el-option :label="$t('login.admin')" value="admin"></el-option>
                        <el-option :label="$t('login.user')" value="user"></el-option>
                    </el-select>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input
                v-model="form.password"
                prefix-icon="el-icon-lock"
                clearable
                show-password
                :placeholder="$t('login.PWPlaceholder')"
            ></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px;">
            <el-col :span="12">
                <el-checkbox :label="$t('login.rememberMe')" v-model="form.autologin"></el-checkbox>
            </el-col>
            <el-col :span="12" class="login-forgot">
                <router-link to="/reset_password">{{ $t('login.forgetPassword') }}？</router-link>
            </el-col>
        </el-form-item>
        <el-form-item>
            <el-button
                type="primary"
                style="width: 100%;"
                :loading="islogin"
                round
                @click="login"
            >{{ $t('login.signIn') }}</el-button>
        </el-form-item>
        <div class="login-reg">
            {{$t('login.noAccount')}}
            <router-link to="/user_register">{{$t('login.createAccount')}}</router-link>
        </div>
    </el-form>
</template>

<script>
import useCommonStore from "@/store/modules/common";
const { getEntityLable } = useCommonStore();
import http from "@/utils/request";
export default {
    data() {
        return {
            userType: "admin",
            form: {
                user: "admin",
                password: "admin",
                autologin: false,
            },
            rules: {
                user: [
                    {
                        required: true,
                        message: this.$t("login.userError"),
                        trigger: "blur",
                    },
                ],
                password: [
                    {
                        required: true,
                        message: this.$t("login.PWError"),
                        trigger: "blur",
                    },
                ],
            },
            islogin: false,
        };
    },
    watch: {
        userType(val) {
            if (val == "admin") {
                this.form.user = "admin";
                this.form.password = "admin";
            } else if (val == "user") {
                this.form.user = "test006";
                this.form.password = "123456";
            }
        },
    },
    mounted() {},
    methods: {
        async login() {
            // console.log(http,'http')
            var validate = await this.$refs.loginForm
                .validate()
                .catch(() => {});
            if (!validate) {
                return false;
            }

            // this.islogin = true;
            var data = {
                user: this.form.user,
                password: this.form.password,
                //username: this.form.user
                //password: this.$TOOL.crypto.MD5(this.form.password)
            };

            //eslint-disable-next-line
            //debugger

            //获取token
            var user = await this.$API.auth.token.post(data);
            if (user) {
                this.$TOOL.cookie.set("TOKEN", user.data.token, {
                    expires: this.form.autologin ? 24 * 60 * 60 : 0,
                });
                //this.$TOOL.data.set("USER_INFO", user.data.userInfo)
                let userInfo = {
                    userName: this.form.user,
                    userId: user.data,
                    dashboard: "1",
                };
                this.$TOOL.data.set("USER_INFO", userInfo);

                sessionStorage.setItem("userId", user.data); // 保存用户Id到本地会话
                this.$TOOL.cookie.set("uid", user.data, {
                    expires: 24 * 60 * 60,
                });
                /**
                 * 登录成功调用
                 */
                // 获取所有权限
                this.getRightMap();
                // 获取所有实体并格式化Label
                this.getEntityLable()
                this.$router.replace({
                    path: "/",
                });
                this.$message.success("Login Success 登录成功");
            } 
            this.islogin = false;
            
        },
        getEntityLable(){
            getEntityLable()
        },
        async getRightMap() {
            let getRightMapRes = await http.get("/user/getRightMap");
            if (getRightMapRes) {
                this.$TOOL.data.set("rightMap", getRightMapRes.data || {});
            }
        },
    },
};
</script>

<style>
</style>
