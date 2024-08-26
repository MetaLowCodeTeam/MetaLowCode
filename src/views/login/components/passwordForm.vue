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
            ></el-input>
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
                <el-checkbox :label="$t('login.rememberPassword')" v-model="form.autologin"></el-checkbox>
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
    </el-form>
</template>

<script>
import useCommonStore from "@/store/modules/common";
const { getEntityList, setUserInfo } = useCommonStore();
export default {
    data() {
        return {
            userType: "admin",
            form: {
                user: "",
                password: "",
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
    mounted() {
        // console.log()
        let userInfo = this.$TOOL.cookie.get("userInfo");
        if (userInfo) {
            userInfo = JSON.parse(userInfo);
            this.form.user = userInfo.loginName;
            this.form.password = userInfo.password;
            this.form.autologin = userInfo.autologin;
        }
    },
    methods: {
        async login() {
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
            };

            //eslint-disable-next-line
            //debugger

            //获取token
            var user = await this.$API.auth.token.post(data);
            // console.log(user,'user')
            // return
            if (user) {
                let userData = user.data;
                userData.loginName = this.form.user;
                setUserInfo(userData);
                this.$TOOL.cookie.remove("userInfo");
                // 勾选了记住密码
                if (this.form.autologin) {
                    let userInfo = this.$TOOL.data.get('USER_INFO');
                    userInfo.password = this.form.password;
                    userInfo.autologin = this.form.autologin;
                    this.$TOOL.cookie.set(
                        "userInfo",
                        JSON.stringify(userInfo),
                        {
                            expires: 24 * 60 * 60 * 3,
                        }
                    );
                }
                sessionStorage.setItem("userId", user.data.userId); // 保存用户Id到本地会话
                this.$TOOL.cookie.set("uid", user.data, {
                    expires: 24 * 60 * 60 * 3,
                });
                /**
                 * 登录成功调用
                 */
                // 调用实体数据
                getEntityList();
                this.$router.replace({
                    path: "/",
                });
                console.log("2. 点击了登录...");
                this.$message.success(this.$t("login.loginSuccess"));
            }
            this.islogin = false;
        },
    },
};
</script>

<style>
</style>
