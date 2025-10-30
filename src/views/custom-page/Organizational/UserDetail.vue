<!--
 * @Descripttion: 自定义实体详情组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/nqyxilpbxch417c8?singleDoc#
 * @Author: 邪七
 * @Date: 2024年05月28日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2024年05月28日11:30:56
-->
<template>
	<!--  -->
	<EntityListDetail 
        ref="EntityListDetailRefs" 
        :detailConf="detailConf"
        @onLayoutFinish="updateData"
        :recordIds="recordIds"
    >
		<!-- 更多插槽看 第4行 API -->
		<template #beforeEditBtn>
			<AddMembers
				@addMembers="refreshCustomComponent"
				:paramId="detailId"
				:paramName="detailEntity == 'Team' ? '成员' : '角色'"
				:paramType="detailEntity == 'Team' ? 'User' : 'Role'"
				:isDisabled="!checkRole(3)"
			/>
		</template>
		<template #beforeRevisionHistory>
			<el-row v-if="detailEntity == 'User'">
				<el-button
					type="primary"
					plain
					icon="Key"
					@click="openResetPasswordDialog"
				>
					重置密码
				</el-button>
			</el-row>
			<el-row>
				<el-button type="primary" plain icon="Delete" @click="delClick">
					删除
				</el-button>
			</el-row>
		</template>
	</EntityListDetail>
	<!-- 重置密码 -->
	<ml-dialog
		title="重置密码"
		v-model="resetPasswordDialogIsShow"
		appendToBody
		width="450px"
	>
		<el-input v-model="newPassword" placeholder="输入密码" clearable>
			<template #append>
				<span class="generate-pwd" @click="generatePwd">
					生成随机密码
				</span>
			</template>
		</el-input>
		<template #footer>
			<el-button @click="resetPasswordDialogIsShow = false">
				取消
			</el-button>
			<el-button type="primary" @click="confirmResetPassword">
				确定
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
/**
 * 自定义实体详情
 */
import { ref, inject } from "vue";
// 1 引入详情组件
import EntityListDetail from "@/views/customize-menu/detail.vue";
// 引入添加角色、成员
import AddMembers from "@/views/user/components/AddMembers.vue";
// 引入VUE相关组件
import useCommonStore from "@/store/modules/common";
import { ElMessage, ElMessageBox } from "element-plus";
import http from "@/utils/request";
// API
import { deleteUserById, getUserRole } from "@/api/user";
import { encrypt } from "@/utils/util";
import { checkPassword } from "@/hooks/usePasswordStrength";
import { storeToRefs } from "pinia";
const props = defineProps({
    recordIds: {
        type: Array,
        default: () => [],
    },
});
const { publicSetting } = storeToRefs(useCommonStore());



const { queryEntityNameById } = useCommonStore();
const $TOOL = inject("$TOOL");

// 2 定义该详情组件名称
defineOptions({
	name: "user-detail",
});

const emits = defineEmits(["onConfirm"]);

let detailConf = ref({
	// 显示流程操作块
	showProcessBlock: false,
	// 显示更多按钮
	showMoreBtn: false,
	// 显示修改历史
	showRevisionHistory: false,
});

let detailId = ref();
let detailEntity = ref();

// 打开详情
let EntityListDetailRefs = ref();
const openDialog = (id) => {
	EntityListDetailRefs.value?.openDialog(id);
	detailId.value = id;
	detailEntity = queryEntityNameById(id);
};

// 检查权限
const checkRole = (type) => {
	let entityCode = detailEntity.value == "Team" ? 24 : 21;
	return $TOOL.checkRole("r" + entityCode + "-" + type);
};

/**
 * ********************************************** 重置密码相关 beg
 */

let resetPasswordDialogIsShow = ref(false);
let resetPasswordUserId = ref("");
let newPassword = ref("");
// 打开重置密码弹框
const openResetPasswordDialog = () => {
	resetPasswordDialogIsShow.value = true;
	resetPasswordUserId.value = detailId.value;
	newPassword.value = "";
};

// 生成密码
const generatePwd = () => {
	newPassword.value = "xxxcxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// 确认修改密码
const confirmResetPassword = async () => {
	if (!newPassword.value) {
		ElMessage.error("请输入密码");
		return;
	}
    let { passed, message } = checkPassword(newPassword.value, publicSetting.value.userPasswordRuleLevel);
    if(!passed){
        ElMessage.error(message);
        return;
    }
    let encryptPassword = await encrypt(newPassword.value);
	let res = await http.get("/user/resetPassword", {
		password: encryptPassword,
		userId: resetPasswordUserId.value,
	});
	if (res && res.code == 200) {
		ElMessage.success("重置成功");
		newPassword.value = "";
		resetPasswordDialogIsShow.value = false;
		updateData();
	}
};


// 删除
const delClick = (id) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res;
            if (detailEntity.value == "Team") {
                res = await delTeam(detailId.value);
            } else {
                if (detailId.value === "021-000000000000000000000000000000000001") {
                    ElMessage.info("管理员用户禁止删除！");
                    return;
                }
                res = await deleteUserById(detailId.value);
            }
            if (res) {
                ElMessage.success("删除成功");
                EntityListDetailRefs.value?.closeDialog();
                updateData();
            }
        })
        .catch(() => {});
};

// 刷新自定义组件
const refreshCustomComponent = () => {
    EntityListDetailRefs.value?.refreshCustomComponent();
}


const updateData = () => {
	emits("onConfirm");
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
