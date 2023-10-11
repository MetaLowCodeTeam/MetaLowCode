<template>
    <!--  -->
    <el-button class="mr-10" icon="Plus" @click="openDialog">添加成员</el-button>
    <mlDialog v-model="isShow" title="添加成员" width="500">
        <el-form label-width="80px" v-loading="loading">
            <el-form-item style="margin-bottom: 20px;" label="选择用户">
                <mlSelectUser v-model="myMembers" multiple clearable />
            </el-form-item>
            <el-form-item label=" ">
                <el-button type="primary" @click="addMembers">确认</el-button>
            </el-form-item>
        </el-form>
    </mlDialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { addTeamMembers } from "@/api/team";
import { ElMessage } from "element-plus";
const props = defineProps({
    teamId: { type: String, default: "" },
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
        teamId: props.teamId,
        nodeRoleList: [...myMembers.value],
    };
    loading.value = true;
    let res = await addTeamMembers(param);
    if(res){
        ElMessage.success("添加成功");
        myMembers.value = [];
        isShow.value = false;
        emits("addMembers");
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
</style>