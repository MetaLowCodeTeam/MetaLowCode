<style lang="scss" scoped>
.el-form-item {
    align-items: initial;
}
</style>
<template>
    <ml-dialog 
        v-model="isShow" 
        :title="dialogTitle" 
        width="500px"
        append-to-body
        :show-close="!loading"
    >
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="常量名称" class="is-required">
                <el-input 
                    v-model="formData.label" 
                    :maxlength="15" 
                    clearable
                    placeholder="请输入常量名称"
                    :class="{'is-error': formData.labelError}"
                    @focus="formData.labelError = false"
                />
            </el-form-item>
            <el-form-item label="常量值" class="is-required">
                <el-input 
                    v-model="formData.value" 
                    :maxlength="15" 
                    clearable
                    placeholder="请输入常量值"
                    :class="{'is-error': formData.valueError}"
                    @focus="formData.valueError = false"
                />
                <div class="info-text mt-5" v-if="systemValueVerification[sourceData.systemName]">{{ systemValueVerification[sourceData.systemName].regText }}</div>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="isShow = false" :loading="loading">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="loading">确定</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import systemValueVerification from './systemValueVerification';
const props = defineProps({
	saveFn: { type: Function },
});
const emit = defineEmits(['refresh']);

let isShow = ref(false);
let dialogTitle = ref('');
let loading = ref(false);

const formData = ref({
    label: '',
    value: '',
    labelError: false,
    valueError: false
});

let sourceData = ref({});

const openDialog = (data) => {
    isShow.value = true;
    sourceData.value = data;
    if(data.targe == 'add') {
        dialogTitle.value = '新增系统项';
    }else if(data.targe == 'ins') {
        dialogTitle.value = '插入系统项';
    }else {
        dialogTitle.value = '编辑系统项';
    }
    formData.value = {
        label: data.item?.label,
        value: data.item?.value,
        labelError: false,
        valueError: false
    }
}

const handleSave = async () => {
    let reg = /^[A-Za-z\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d\/\d]+$/
    let { label, value } = formData.value;
    if(!label) {
        formData.value.labelError = true;
        ElMessage.error('常量名称不能为空');
        return;
    }
    if(!reg.test(label)) {
        formData.value.labelError = true;
        ElMessage.error('常量名称格式不正确，由字母大小写、汉字或数字组成的字符串');
        return;
    }
    if(!value) {
        formData.value.valueError = true;
        ElMessage.error('常量值不能为空');
        return;
    }
    if(!reg.test(value)) {
        formData.value.valueError = true;
        ElMessage.error('常量值格式不正确，由字母大小写、汉字或数字组成的字符串');
        return;
    }
    let newItem = {
        label,
        value,
        saved: false
    }
    let { inx, mainList, targe, systemName } = sourceData.value;
    if(systemValueVerification[systemName] && !systemValueVerification[systemName].check(value)) {
        formData.value.valueError = true;
        return;
    }
    //  判断选项是否存在
    for (
        let index = 0;
        index < mainList.length;
        index++
    ) {
        const el = mainList[index];
        if (el.value == value) {
            ElMessage.warning(
                "已存在常量值【" + value + "】选项"
            );
            return;
        }
    }
    // 插入
    if (targe == "ins") {
        mainList.splice(inx + 1, 0, newItem);
    }
    // 新增
    else if (targe == "add") {
        mainList.push(newItem);
    }
    // 编辑
    else {
        mainList[inx].label = newItem.label;
    }
    loading.value = true;
    const res = await props.saveFn(systemName, mainList);
    if(res.code == 200) {
        ElMessage.success('操作成功');
        isShow.value = false;
        emit('refresh');
    }
    loading.value = false;
    
}

defineExpose({
    openDialog
})

</script>

