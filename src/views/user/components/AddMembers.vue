<template>
    <!--  -->
    <el-button
        class="mr-10"
        icon="Plus"
        @click="openDialog"
        :disabled="isDisabled"
        v-if="!isDialog"
    >
        添加{{ paramName }}
    </el-button>
    <ml-dialog v-model="isShow" :title="'添加' + paramName" width="500">
        <el-form label-width="80px" v-loading="loading">
            <el-form-item style="margin-bottom: 20px;" :label="'选择' + paramName">
                <mlSelectUser :type="paramType" v-model="myMembers" multiple clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="isShow = false" style="min-width: 70px !important">取消</el-button>
            <el-button type="primary" @click="addMembers" style="min-width: 70px !important">确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref } from "vue";
import { addUsersOfTeam, addUsersOfRole } from "@/api/team";
import { addRolesOfUser } from "@/api/user";
import { ElMessage } from "element-plus";
const props = defineProps({
    paramName: { type: String, default: "" },
    paramType: { type: String, default: "" },
    paramId: { type: String, default: "" },
    isDisabled: { type: Boolean, default: false },
    // 是否弹窗调用
    isDialog: { type: Boolean, default: false },
});

const emits = defineEmits(["addMembers"]);
let myMembers = ref([]);
let isShow = ref(false);
let loading = ref(false);
// 添加成员
const openDialog = () => {
    isShow.value = true;
};
const addMembers = async () => {
    if (myMembers.value.length < 1) {
        isShow.value = false;
        return;
    }
    let param = {
        id: props.paramId,
        idNameList: [...myMembers.value],
    };
    loading.value = true;
    let res;
    
    if(props.isDialog) {
        res = await addUsersOfRole(param);
    }else {
        if (props.paramType == "Role") {
            res = await addRolesOfUser(param);
        } else {
            res = await addUsersOfTeam(param);
        }
    }

    if (res && (res.code == 200 || res.data?.code == 200)) {
        ElMessage.success("添加成功");
        myMembers.value = [];
        isShow.value = false;
        emits("addMembers");
    }
    loading.value = false;
};

defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
</style>