<template>
    <div>
        <el-checkbox v-model="checked" label=" " class="check-box" @change="formatShareTo" />共享给全部用户或
        <span class="a-span" @click="openUserDialog">
            指定用户
            <span v-if="userList.length > 0">({{userList.length}})</span>
        </span>
        <mlDialog title="指定用户" width="550" v-model="userDialogIsShow">
            <div class="save-dialog" style="padding:0 20px;">
                <mlSelectUser v-model="userDialogList" multiple clearable />
                <div class="info-text mt-5">可以共享给不同的角色或职能部门，便于统一管理</div>
                <div class="mt-10">
                    <el-button type="primary" style="width: 80px;" @click="confrimUse">确定</el-button>
                </div>
            </div>
        </mlDialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue"]);
let checked = ref(false);
let shareTo = ref("");
let userList = ref([]);

onMounted(() => {
    if (props.modelValue == "SELF") {
        checked.value = false;
    } else if (props.modelValue == "ALL") {
        checked.value = true;
    } else {
        let list = JSON.parse(props.modelValue);
        userList.value = [...list];
        checked.value = true;
    }
    // if (props.modelValue == "ALL") {
    //     checked.value = true;
    // } else {
    //     checked.value = false;
    // }
});

// 格式化 shareTo
const formatShareTo = () => {
    if (checked.value) {
        if (userList.value.length > 0) {
            shareTo.value = JSON.stringify(userList.value);
        } else {
            shareTo.value = "ALL";
        }
    } else {
        shareTo.value = "SELF";
    }
    emits("update:modelValue", shareTo.value);
};

let userDialogIsShow = ref(false);
let userDialogList = ref([]);
// 打开指定用户弹框
const openUserDialog = () => {
    userDialogList.value = [...userList.value];
    userDialogIsShow.value = true;
};
// 确认指定用户
const confrimUse = () => {
    userList.value = [...userDialogList.value];
    userDialogIsShow.value = false;
    formatShareTo();
};
</script>
<style lang='scss' scoped>
.check-box {
    position: relative;
    top: 2px;
}
.a-span {
    color: $ml-primary;
    cursor: pointer;
    &:hover {
        color: $ml-primary-hover;
    }
}
</style>