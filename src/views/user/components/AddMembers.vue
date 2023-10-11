<template>
    <!--  -->
    <el-button class="mr-10" icon="Plus" @click="openDialog">添加成员</el-button>
    <mlDialog v-model="isShow" title="添加成员" width="500">
        <el-form label-width="80px">
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
const emits = defineEmits(["addMembers"]);
let myMembers = ref([]);
let isShow = ref(false);
// 添加成员
const openDialog = () => {
    isShow.value = true;
};
const addMembers = () => {
    isShow.value = false;
    emits("addMembers");
};
</script>
<style lang='scss' scoped>
</style>