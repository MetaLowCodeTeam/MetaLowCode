<template>
	<el-form
		ref="loginForm"
		:model="form"
		:rules="rules"
		label-width="0"
		size="large"
		@keyup.enter="login"
	>
		<el-form-item prop="phone">
			<el-input
				v-model="form.phone"
				prefix-icon="el-icon-iphone"
				clearable
				:placeholder="$t('login.mobilePlaceholder')"
			>
				<template #prepend>+86</template>
			</el-input>
		</el-form-item>
		<el-form-item prop="imgYzm">
			<div class="login-img-yzm">
				<div class="login-yzm-input">
					<el-input
						v-model="form.imgYzm"
						prefix-icon="el-icon-unlock"
						clearable
						:placeholder="$t('login.imgPlaceholder')"
					></el-input>
				</div>
				<div class="login-yzm-box">
					<img :src="imgCode" alt="imgCode" @click="codeSrc" />
				</div>
			</div>
		</el-form-item>
		<el-form-item prop="yzm" style="margin-bottom: 35px">
			<div class="login-msg-yzm">
				<el-input
					v-model="form.yzm"
					prefix-icon="el-icon-unlock"
					clearable
					:placeholder="$t('login.smsPlaceholder')"
				></el-input>
				<el-button
					@click="getYzm"
					:disabled="disabled"
					:loading="yzmLoading"
				>
					{{ this.$t("login.smsGet") }}
					<span v-if="disabled"> ({{ time }})</span>
				</el-button>
			</div>
		</el-form-item>
		<el-form-item>
			<el-button
				type="primary"
				style="width: 100%"
				:loading="islogin"
				round
				@click="login"
				>{{ $t("login.signIn") }}</el-button
			>
		</el-form-item>
		<div class="login-reg">
			{{ $t("login.noAccount") }}
			<router-link to="/web/user_register">{{
				$t("login.createAccount")
			}}</router-link>
		</div>
	</el-form>
</template>

<script>
import { sendSMSCode, codeLogin } from "@/api/user";
import useCommonStore from "@/store/modules/common";
const { getEntityList, setUserInfo } = useCommonStore();
export default {
	data() {
		return {
			form: {
				phone: "18811754868",
				yzm: "",
				imgYzm: "",
			},
			rules: {
				phone: [
					{ required: true, message: this.$t("login.mobileError") },
				],
				yzm: [{ required: true, message: this.$t("login.smsError") }],
				imgYzm: [
					{ required: true, message: this.$t("login.imgError") },
				],
			},
			disabled: false,
			time: 0,
			islogin: false,
			imgCode: "",
			yzmLoading: false,
		};
	},
	created() {
		this.codeSrc();
	},
	mounted() {},
	methods: {
		// 图片验证码获取
		codeSrc() {
			this.imgCode =
				import.meta.env.VITE_APP_BASE_API +
				"/user/imgVerificationCode?n=" +
				new Date().getTime();
		},
		async getYzm() {
			var validate = await this.$refs.loginForm
				.validateField("phone")
				.catch(() => {});
			if (!validate) {
				return false;
			}
			let { phone, imgYzm } = this.form;
			this.yzmLoading = true;
			let res = await sendSMSCode(phone, imgYzm);
			if (res && res.data && res.data.code == 200) {
                console.log(res.data,'res.data');
				this.$message.success(this.$t("login.smsSent") + res.data.data);
				this.disabled = true;
				this.time = 60;
				var t = setInterval(() => {
					this.time -= 1;
					if (this.time < 1) {
						clearInterval(t);
						this.disabled = false;
						this.time = 0;
					}
				}, 1000);
			}
			this.codeSrc();
			this.yzmLoading = false;
		},
		async login() {
			var validate = await this.$refs.loginForm
				.validate()
				.catch(() => {});
			if (!validate) {
				return false;
			}
			// this.islogin = true;

            let { phone, yzm } = this.form;
			var data = {
				mobilePhone: phone,
				code: yzm,
			};

			//eslint-disable-next-line
			//debugger

			//获取token
			var user = await codeLogin(data);
			// console.log(user,'user')
			// return
			if (user && user.data && user.data.code == 200) {
				let userData = user.data.data;
                console.log(user.data.id,'user.data.id')
				setUserInfo(userData);
				this.$TOOL.cookie.remove("userInfo");
				sessionStorage.setItem("userId", userData.userId); // 保存用户Id到本地会话
				this.$TOOL.cookie.set("uid", userData, {
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
		},
	},
};
</script>

<style lang="scss" scoped>
.login-img-yzm {
	display: flex;
	width: 100%;
	.login-yzm-input {
		flex-grow: 1;
		height: 38px;
	}
	.login-yzm-box {
		width: 110px;
		height: 38px;
		margin-left: 10px;
		background-color: #f5f5f5;
		border-radius: 4px;
		position: relative;
		top: 2px;
		cursor: pointer;
		img {
			width: 100%;
			height: 100%;
			border-radius: 4px;
		}
	}
}
</style>
